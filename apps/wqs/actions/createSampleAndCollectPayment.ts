import { PartialTest } from "@/types/common";
import prisma from "@repo/db/client";


interface SampleRequestCreateBaseResponse {
  success: boolean;
}

interface SampleRequestCreationError extends SampleRequestCreateBaseResponse {
  success: false;
  error: string;
}

interface SampleRequestCreationSuccess extends SampleRequestCreateBaseResponse {
  success: true;
  paymentId: string;
}

type SampleRequestionCreationResponse =
  | SampleRequestCreationError
  | SampleRequestCreationSuccess;


export async function createSampleAndCollectPayment(
  requestId: string,
  tests: PartialTest[],
  userId: string,
): Promise<SampleRequestionCreationResponse> {
  try {
    const paymentId = await prisma.$transaction(async (tx) => {
      const totalPrice = tests.reduce<number>(
        (acc, curr) => acc + curr.price,
        0,
      );

      if (totalPrice <= 0) {
        throw new Error("Invalid tests selected");
      }

      await tx.sampleTest.createMany({
        data: tests.map((test) => ({
          requestId: requestId,
          testId: test.testId,
          testName: test.name,
          unitUsed: test.unit,
          minValueUsed: test.minValue,
          maxValueUsed: test.maxValue,
        })),
      });

      const payment = await tx.payment.create({
        data: {
          amount: totalPrice,
          requestId: requestId,
          userId: userId,
          status: "Success",
        },
        select: {
          paymentId: true,
        },
      });

      await tx.testRequest.update({
        where: {
          requestId: requestId,
        },
        data: {
          status: "PaymentCollected",
        },
      });

      return payment.paymentId;
    });

    return {
      success: true,
      paymentId,
    };
  } catch (error) {
    return {
      success: false,
      error: "Something went wrong",
    };
  }
}

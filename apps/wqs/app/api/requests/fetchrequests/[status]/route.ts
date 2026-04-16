import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { selectionPipeline } from "@/types/selector";
import { validatePageSchema } from "@/zod/validatePage";
import prisma from "@repo/db/client";
import { Role, TestRequestStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const IN_PROGRESS: TestRequestStatus[] = [
  TestRequestStatus.PaymentCollected,
  TestRequestStatus.SampleCollected,
  TestRequestStatus.Testing
];

const TECHNICIAN_INPROGRESS: TestRequestStatus[] = [
  TestRequestStatus.SampleCollected,
  TestRequestStatus.Testing
]

const CLOSED: TestRequestStatus[] = [TestRequestStatus.Completed, TestRequestStatus.Rejected];

const fetchStatus = (status: TestRequestStatus, role: Role = Role.user) => {
  if(role === Role.technician && TECHNICIAN_INPROGRESS.includes(status)){
    return TECHNICIAN_INPROGRESS;
  }
  if(role === Role.user && IN_PROGRESS.includes(status)){
    return IN_PROGRESS;
  }
  if(CLOSED.includes(status)){
    return CLOSED;
  }
  return [status];
}
export async function GET(req: NextRequest, {params}: {params: Promise<{status: string}>}){
  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    if(!session || !session.user || !session.user.id){
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    const pageValidationResponse = validatePageSchema.safeParse(parseInt(req.nextUrl.searchParams.get("page") as string));
    if(!pageValidationResponse.success){
      return NextResponse.json({error: "Invalid page number"}, {status: 400});
    }
    const page = pageValidationResponse.data;
    const limit = 7;
    const skip = (page - 1) * limit;
    const {status} = await params;
    const updatedStatus = fetchStatus(status as TestRequestStatus, session.user.role);
    console.log("updated status", updatedStatus)
    const totalCount = await prisma.testRequest.count({
      where: {
        status:{
          in: updatedStatus
        },
        ...(session.user.role === Role.user && {userId: session.user.id})
      }
    });
    if(totalCount === 0){
      return NextResponse.json({requests: [], totalPages: 1}, {status: 200});
    }
    const requests = await prisma.testRequest.findMany({
      where: {
        status: {
          in: updatedStatus
        },
        ...(session.user.role === Role.user && {userId: session.user.id}),
        // ...((session.user.role === Role.technician) && {testerId: session.user.id})
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        ...selectionPipeline,
        ...(status === TestRequestStatus.Testing && {
          payment: {
            where: {
              status: "Success",
            },
            select: {
              amount: true
            }
          }
        }),
        ...(status === TestRequestStatus.Completed && {
          overallResult: true
        }),
        ...((status === TestRequestStatus.Testing || status === TestRequestStatus.Completed) && {
          sampleTests: {
            select: {
              id: true,
              ...(status === TestRequestStatus.Testing && {
                test: {
                  select: {
                    name: true
                  }
                }
              }),
              status: true,
              value: true,
              ...(status === TestRequestStatus.Completed && {
                testName: true,
                minValueUsed: true,
                maxValueUsed: true,
                unitUsed: true,
                result: true
               })
            }
          }
        })
      }
    });

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    return NextResponse.json({requests, totalPages}, {status: 200});
  } catch (error) {
    console.log(error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
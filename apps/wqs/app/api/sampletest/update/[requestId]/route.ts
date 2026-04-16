import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { updateTestSchema } from "@/zod/test";
import { MessageType, UpdateRequestCountEvent } from "@repo/datatypes";
import prisma from "@repo/db/client";
import { ReportStatus, Role, TestResultStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {SampleTestStatus, TestRequestStatus} from '@prisma/client'
import { publish } from "@/lib/publisher";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);

    if (
      !session ||
      !session.user ||
      !session.user.id ||
      session.user.role !== Role.technician
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await params;

    if (!requestId) {
      return NextResponse.json({ error: "Invalid requestId" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateTestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid test data" }, { status: 400 });
    }

    const incomingTests = parsed.data.tests;

    const existingRequest = await prisma.testRequest.findUnique({
      where: { requestId },
      select: {
        testerId: true,
        status: true,
        sampleTests: {
          select: {
            id: true,
            status: true,
            value: true,
            minValueUsed: true,
            maxValueUsed: true,
          },
        },
      },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (
      !existingRequest.testerId ||
      existingRequest.testerId !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingOrTesting = existingRequest.sampleTests.filter(
      (t) => t.status === TestRequestStatus.Pending || t.status === TestRequestStatus.Testing,
    );
    
    const alreadyCompleted = existingRequest.sampleTests.filter(
      (
        t,
      ): t is {
        id: string;
        status: SampleTestStatus;
        value: number;
        minValueUsed: number;
        maxValueUsed: number;
      } => t.status === SampleTestStatus.Completed && t.value !== null,
    );

    const snapshotMap = new Map(pendingOrTesting.map((t) => [t.id, t]));

    const uniqueIncomingMap = new Map<string, number>();

    for (const t of incomingTests) {
      if (!uniqueIncomingMap.has(t.id)) {
        uniqueIncomingMap.set(t.id, t.value);
      }
    }

    const updatePayload: {
      id: string;
      value: number;
      result: TestResultStatus;
    }[] = [];

    let actualUpdatableCount = 0;

    for (const [id, value] of uniqueIncomingMap.entries()) {
      const snapshot = snapshotMap.get(id);
      if (!snapshot) continue;

      actualUpdatableCount++;

      const safe =
        value >= snapshot.minValueUsed && value <= snapshot.maxValueUsed;

      updatePayload.push({
        id,
        value,
        result: safe ? TestResultStatus.SAFE : TestResultStatus.UNSAFE,
      });
    }

    if (updatePayload.length === 0) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 200 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await Promise.all(
        updatePayload.map((item) =>
          tx.sampleTest.update({
            where: { id: item.id },
            data: {
              value: item.value,
              result: item.result,
              status: SampleTestStatus.Completed,
            },
          }),
        ),
      );

      const remainingAfterUpdate =
        pendingOrTesting.length - actualUpdatableCount;

      if (remainingAfterUpdate === 0) {
        const allCompletedNow = [
          ...alreadyCompleted,
          ...updatePayload.map((u) => {
            const snap = snapshotMap.get(u.id)!;
            return {
              value: u.value,
              minValueUsed: snap.minValueUsed,
              maxValueUsed: snap.maxValueUsed,
            };
          }),
        ];

        let totalRisk = 0;

        for (const t of allCompletedNow) {
          const mid = (t.minValueUsed + t.maxValueUsed) / 2;
          const halfRange = (t.maxValueUsed - t.minValueUsed) / 2;

          if (halfRange === 0) continue;

          const deviation = Math.abs(t.value - mid);
          totalRisk += deviation / halfRange;
        }

        const avgRisk = totalRisk / allCompletedNow.length;

        let overallResult: ReportStatus;

        if (avgRisk <= 0.25) {
          overallResult = ReportStatus.EXCELLENT;
        } else if (avgRisk <= 0.5) {
          overallResult = ReportStatus.GOOD;
        } else if (avgRisk <= 0.75) {
          overallResult = ReportStatus.MODERATE;
        } else if (avgRisk <= 1) {
          overallResult = ReportStatus.POOR;
        } else {
          overallResult = ReportStatus.UNSAFE;
        }

        await tx.testRequest.update({
          where: { requestId },
          data: {
            status: TestRequestStatus.Completed,
            overallResult,
          },
        });
        const payload: UpdateRequestCountEvent = {
          action: MessageType.update_request_count,
          data: {
            previousStatus: existingRequest.status,
            status: TestRequestStatus.Completed,
            count: 1,
          },
        }
        await publish(MessageType.socket_message, JSON.stringify(payload));
      } else {
        await tx.testRequest.update({
          where: { requestId },
          data: {
            status: TestRequestStatus.Testing,
          },
        });
        if(existingRequest.status !== TestRequestStatus.Testing){
          const payload: UpdateRequestCountEvent = {
            action: MessageType.update_request_count,
            data: {
              previousStatus: existingRequest.status,
              status: TestRequestStatus.Testing,
              count: 1,
            },
          }
          await publish(MessageType.socket_message, JSON.stringify(payload));
        }
      }
    });

    return NextResponse.json(
      { message: "Tests updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

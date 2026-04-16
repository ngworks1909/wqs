import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { publish } from "@/lib/publisher";
import { MessageType, UpdateRequestCountEvent } from "@repo/datatypes";
import prisma from "@repo/db/client";
import { Role, TestRequestStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, {params}: {params: Promise<{requestId: string}>}){
    try {
        const session = await getServerSession(NEXT_AUTH_CONFIG);
        if(!session || !session.user || !session.user.id || session.user.role !== Role.user){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const {requestId} = await params;
        if(!requestId){
            return NextResponse.json({error: "Invalid test request id"}, {status: 400});
        }
        const existingRequest = await prisma.testRequest.findUnique({
            where: {
                requestId
            },
            select: {
                status: true,
                userId: true
            }
        });
        if(!existingRequest || existingRequest.userId !== session.user.id){
            return NextResponse.json({error: "Test request not found"}, {status: 400});
        }
        const deletableStatus = [
          TestRequestStatus.Pending,
          TestRequestStatus.Accepted,
          TestRequestStatus.Rejected
        ] as const;
        
        type DeletableStatus = typeof deletableStatus[number];
        
        function isDeletableStatus(
          status: TestRequestStatus
        ): status is DeletableStatus {
          return deletableStatus.includes(status as DeletableStatus);
        }
        
        if(!isDeletableStatus(existingRequest.status)){
            return NextResponse.json({error: "Test request cannot be deleted"}, {status: 400});
        }
        await prisma.testRequest.update({
            where: {
                requestId
            },
            data: {
                status: "Deleted"
            }
        });
        const payload: UpdateRequestCountEvent = {
            action: MessageType.update_request_count,
            data: {
                previousStatus: existingRequest.status,
                status: TestRequestStatus.Deleted,
                count: 1
            }
        }
        await publish(MessageType.socket_message, JSON.stringify(payload));
        return NextResponse.json({message: "Test request deleted successfully"}, {status: 200});
    } catch (err) {
        console.log(err)
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}
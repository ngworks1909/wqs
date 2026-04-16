import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { publish } from "@/lib/publisher";
import { testRequestStatusUpdateSchema } from "@/zod/testRequest";
import { MessageType, UpdateRequestCountEvent } from "@repo/datatypes";
import prisma from "@repo/db/client";
import { Role, TestRequestStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, {params}: {params: Promise<{requestId: string}>}){
    try {
        const session = await getServerSession(NEXT_AUTH_CONFIG);
        if(!session || !session.user || !session.user.id || session.user.role !== Role.technician){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const {requestId} = await params;
        if(!requestId){
            return NextResponse.json({error: "Invalid test request id"}, {status: 400});
        }
        const data = await req.json();
        const statusValidationResponse = testRequestStatusUpdateSchema.safeParse(data);
        if(!statusValidationResponse.success){
            return NextResponse.json({error: "Invalid test request data"}, {status: 400});
        }
        const {status} = statusValidationResponse.data;
        const existingRequest = await prisma.testRequest.findUnique({
            where: {
                requestId
            },
            select: {
                status: true,
                testerId: true
            }
        });
        if(!existingRequest){
            return NextResponse.json({error: "Test request not found"}, {status: 400});
        }
        await prisma.testRequest.update({
            where: {
                requestId
            },
            data: {
                status,
                ...(status === TestRequestStatus.Accepted && {testerId: session.user.id})
            },
        });
        const payload: UpdateRequestCountEvent = {
            action: MessageType.update_request_count,
            data: {
                previousStatus: existingRequest.status,
                status,
                count: 1
            }
        }
        await publish(MessageType.socket_message, JSON.stringify(payload));
        return NextResponse.json({message: "Test request status updated successfully"}, {status: 200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}
import { createSampleAndCollectPayment } from "@/actions/createSampleAndCollectPayment";
import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { createPaymentSchema } from "@/zod/validatePayment";
import prisma from "@repo/db/client";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { PartialTest } from "@/types/common";
import { publish } from "@/lib/publisher";
import { MessageType, UpdatePaymentSuccessEvent } from "@repo/datatypes";


export async function POST(req: NextRequest, {params}: {params: Promise<{requestId: string}>}){
    try {
        const session = await getServerSession(NEXT_AUTH_CONFIG);
        if(!session || !session.user || !session.user.id || session.user.role !== Role.user){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const userId: string = session.user.id;
        const {requestId} = await params;
        if(!requestId){
            return NextResponse.json({error: "Invalid request id"}, {status: 400});
        }
        const data = await req.json()
        const createPaymentValidationResponse = createPaymentSchema.safeParse(data);
        if(!createPaymentValidationResponse.success){
            return NextResponse.json({error: "Invalid test request data"}, {status: 400});
        }
        const { testIds} = createPaymentValidationResponse.data;
        const existingTestRequest = await prisma.testRequest.findUnique({
            where: {
                requestId
            },
            select: {
                requestId: true,
                userId: true,
                status: true
            }
        });
        if(!existingTestRequest || existingTestRequest.userId !== userId){
            return NextResponse.json({error: "Test request not found"}, {status: 400});
        }
        if(existingTestRequest.status === "PaymentCollected"){
            return NextResponse.json({error: "Payment already collected"}, {status: 400});
        }
        const tests: PartialTest[] = await prisma.test.findMany({
            where: {
                testId: {
                    in: testIds
                }
            },
            select: {
                testId: true,
                name: true,
                maxValue: true,
                minValue: true,
                unit: true,
                price: true
            }
        });

        if(testIds.length !== tests.length){
            return NextResponse.json({error: "Invalid test ids"}, {status: 400});
        }
        const response = await createSampleAndCollectPayment(requestId, tests, userId);
        if(!response.success){
            // return res.status(400).json({error: response.error});
            return NextResponse.json({error: response.error}, {status: 400});
        }
        const amount = tests.reduce((acc, curr) => acc + curr.price, 0);
        const payload: UpdatePaymentSuccessEvent = {
            action: MessageType.update_payment_success,
            data: {
                amount
            }
        }
        await publish(MessageType.socket_message, JSON.stringify(payload));
        return NextResponse.json({message: "Payment collected successfully"}, {status: 200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}
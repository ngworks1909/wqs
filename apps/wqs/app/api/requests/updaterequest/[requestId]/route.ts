import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { updateTestRequestSchema } from "@/zod/testRequest";
import prisma from "@repo/db/client";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }
){
    try {
        const session = await getServerSession(NEXT_AUTH_CONFIG);
        if(!session || !session.user || !session.user.id || session.user.role !== Role.user){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const {requestId} = await params
        if(!requestId){
            return NextResponse.json({error: "Invalid test request id"}, {status: 400});
        }
        const data = await req.json();
        console.log(data)
        const updateTestRequestValidationResponse = updateTestRequestSchema.safeParse(data);
        if(!updateTestRequestValidationResponse.success){
            return NextResponse.json({error: "Invalid test request data"}, {status: 400});
        }
        const { waterTypeId, location, sampleLocation, mobileNumber } = updateTestRequestValidationResponse.data;
        const existingRequest = await prisma.testRequest.findUnique({
            where: {
                requestId
            },
            select: {
                waterTypeId: true,
                location: true,
                sampleLocation: true,
                mobileNumber: true,
                userId: true
            }
        });
        if(!existingRequest){
            return NextResponse.json({error: "Test request not found"}, {status: 404});
        }
        if(existingRequest.userId !== session.user.id){
            return NextResponse.json({error: "Unauthorized to update test request"}, {status: 401});
        }
        if(waterTypeId === existingRequest.waterTypeId && location === existingRequest.location && sampleLocation === existingRequest.sampleLocation && mobileNumber === existingRequest.mobileNumber){
            return NextResponse.json({message: "Test request already up to date"}, {status: 200});
        }
        await prisma.testRequest.update({
            where: {
                requestId
            },
            data: {
                waterTypeId,
                location,
                sampleLocation,
                mobileNumber
            }
        });
        return NextResponse.json({message: "Test request updated successfully"}, {status: 200});
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}
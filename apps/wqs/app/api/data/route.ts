import prisma from "@repo/db/client";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const waterTypes = await prisma.waterType.findMany({
            select: {
                waterTypeId: true,
                name: true
            }
        });
        const tests = await prisma.test.findMany({
            select: {
                testId: true,
                name: true,
                description: true,
                price: true
            }
        })
        return NextResponse.json({waterTypes, tests}, {status: 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: "Internal server error"})
    }
}
import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { validatePageSchema } from "@/zod/validatePage";
import prisma from "@repo/db/client";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    try {
        const session = await getServerSession(NEXT_AUTH_CONFIG);
        if(!session || !session.user || !session.user.id || session.user.role !== Role.user){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const pageValidationResponse = validatePageSchema.safeParse(parseInt(req.nextUrl.searchParams.get("page") as string));
        if(!pageValidationResponse.success){
            return NextResponse.json({error: "Invalid page number"}, {status: 400});
        }
        const page = pageValidationResponse.data;
        const limit = 8;
        const skip = (page - 1) * limit;
        const userId = session.user.id;

        const totalCount = await prisma.payment.count({
            where: { userId }
        });
        const payments = await prisma.payment.findMany({
            where: {
                userId
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc"
            },
            select: {
                paymentId: true,
                amount: true,
                request: {
                    select: {
                        sampleLocation: true,
                        waterType: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                status: true,
                createdAt: true
            }
        });
        const totalPages = Math.ceil(totalCount / limit);
        return NextResponse.json({payments, pagination: {
          totalPages: totalPages === 0 ? 1: totalPages,
          currentPage: page,
        }}, {status: 200});
    } catch (error) {
        console.error("Failed to fetch payments", error)
        return NextResponse.json({error: "Failed to fetch payments"}, {status: 500});
    }
}
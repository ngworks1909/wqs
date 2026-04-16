import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { validatePageSchema } from "@/zod/validatePage";
import prisma from "@repo/db/client";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    try {
        const session = await getServerSession(NEXT_AUTH_CONFIG);
        if(!session || !session.user || !session.user.id || session.user.role !== Role.admin){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const pageValidationResponse = validatePageSchema.safeParse(parseInt(req.nextUrl.searchParams.get("page") as string));
        if(!pageValidationResponse.success){
            return NextResponse.json({error: "Invalid page number"}, {status: 400});
        }
        const page = pageValidationResponse.data;
        const limit = 8;
        const skip = (page - 1) * limit;
        const totalCount = await prisma.user.count({
            where: {
                role: Role.technician
            }
        });
        const technicians = await prisma.user.findMany({
            where: {
                role: Role.technician
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc"
            },
            select: {
                userId: true,
                username: true,
                email: true,
                createdAt: true,
                _count: {
                    select: {
                        testStories: true
                    }
                }
            }
        });
        return NextResponse.json({
            technicians,
            totalPages: Math.max(1, Math.ceil(totalCount / limit))
        }, {status: 200});
    } catch (error) {
        console.error("Failed to fetch technicians", error)
        return NextResponse.json({error: "Failed to fetch technicians"}, {status: 500});
    }
}
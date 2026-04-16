import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { selectionPipeline } from "@/types/selector";
import { validatePageSchema } from "@/zod/validatePage";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
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
        const completedCount = await prisma.testRequest.count({
          where: {
            status: "Completed"
          }
        });
        if(completedCount === 0){
          return NextResponse.json({reports: [], totalPages: 1}, {status: 200});
        }
         const totalPages = Math.ceil(completedCount / limit);
        const results = await prisma.testRequest.findMany({
            where: {
                status: "Completed"
            },
            skip,
            take: limit,
            orderBy: {
                updatedAt: "desc"
            },
            select: {
                ...selectionPipeline,
                status: false,
                createdAt: false,
                overallResult: true,
                sampleTests: {
                    select: {
                        id: true,
                        testName: true,
                        maxValueUsed: true,
                        minValueUsed: true,
                        unitUsed: true,
                        result: true
                    }
                }
            }
        });

        return NextResponse.json({reports: results, totalPages}, {status: 200});
    } catch (error) {
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}
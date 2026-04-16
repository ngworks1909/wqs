import {upsertUserSchema} from "@/zod/validateUser";
import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/lib/auth";

export async function POST(req: NextRequest){
    try {
        const session = await getServerSession(NEXT_AUTH_CONFIG);
        if(!session || !session.user || session.user.role !== "admin"){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const data = await req.json();
        const signupValidationResponse = upsertUserSchema.safeParse(data);
        if(!signupValidationResponse.success){
            console.log(signupValidationResponse.error)
            return NextResponse.json({error: "Invalid credentials"}, {status: 400});
        }

        const {email, password, username} = signupValidationResponse.data;
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            },
            select: {
                userId: true
            }
        });
        if(existingUser){
            return NextResponse.json({error: "User already exists"}, {status: 400});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const technician = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username,
                role: "technician"
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
        return NextResponse.json({message: "User created successfully", technician}, {status: 200});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}
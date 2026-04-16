import { upsertUserSchema } from "@/zod/validateUser";
import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import { publish } from "@/lib/publisher";
import {MessageType, UserSignupEvent} from '@repo/datatypes'

export async function POST(req: NextRequest){
    try {
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
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username
            }
        });
        const payload: UserSignupEvent = {
            action: MessageType.user_signup
        }
        await publish(MessageType.socket_message, JSON.stringify(payload))
        return NextResponse.json({message: "User created successfully"}, {status: 200});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}
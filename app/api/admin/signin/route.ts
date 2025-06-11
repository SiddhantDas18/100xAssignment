import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const SECRET = process.env.SECRET;

export async function POST(req:NextRequest){
    try{
        if (!SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const {email,password} = await req.json();

        const user = await prismaClient.user.findUnique({
            where:{
                email:email
            }
        })

        if(!user){
            return NextResponse.json({
                message:"User not found",
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password,user.password);

        if(!isPasswordCorrect){
            return NextResponse.json({
                message:"Invalid password",
            })
        }

        const token = jwt.sign({
            id: user.id,
            role: user.role
        }, SECRET)

        return NextResponse.json({
            message: "Login successful",
            user: user,
            token: token
        })


    }catch(e){
        return NextResponse.json({
            message:(e as Error).message,
        })
    }
    

    
}
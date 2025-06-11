import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req:NextRequest){
    try{

        const {email,password,username} = await req.json();

        const ifExist = await prismaClient.user.findUnique({
            where:{
                email:email,
                username:username
            }
        })

        if(ifExist){
            return NextResponse.json({
                message:"User already exists",
            })
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await prismaClient.user.create({
            data:{
                email:email,
                password:hashedPassword,
                username:username,
                role:"ADMIN"
            }
        })

        return NextResponse.json({
            message:"User created successfully",
            user:user
        })


    }catch(e){
        return NextResponse.json({
            message:(e as Error).message,
        })
    }
    

    
}
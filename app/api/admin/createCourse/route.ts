import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db";
import middleware from "@/middleware/middleware";

export async function POST(req:NextRequest){
    try{

        const authresponse = await middleware(req);

        const userData = authresponse.headers.get("x-user-id");
        
        if(!userData){
            return NextResponse.json({
                msg:"User data not found"
            }, { status: 401 })
        }

        const [role, userId] = userData.split(':');

        if(role !== 'ADMIN') {
            return NextResponse.json({
                msg: "Unauthorized: Admin access required"
            }, { status: 403 })
        }

        const {title,description,price, imageUrl} = await req.json();

        const createCourse = await prismaClient.course.create({
            data:{
                title:title,
                description:description,
                price:price,
                imageUrl: imageUrl
            }
        })

        return NextResponse.json({
            msg:"Course created successfully",
            course:createCourse
        })

    }catch(e){
        return NextResponse.json({
            msg:(e as Error).message
        })
    }
}
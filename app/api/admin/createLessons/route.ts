import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db"
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

        const {title, courseId} = await req.json()

        const ifExist = await prismaClient.lesson.findFirst({
            where:{
                title:title,
                courseId:courseId
            }
        })

        if(ifExist){
            return NextResponse.json({
                msg:"There is alerady a lesson with this course."
            })
        }

        const createLesson = await prismaClient.lesson.create({
            data:{
                title:title,
                courseId:courseId
            }
        })

        return NextResponse.json({
            success: true,
            lesson: createLesson
        })

    }catch(e){
        return NextResponse.json({
            success:false,
            message:"Something went wrong",
            error:(e as Error).message
        })
    }
}
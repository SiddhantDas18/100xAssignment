import { NextRequest,NextResponse } from "next/server";
import prismaClient from "@/lib/db";


export async function GET(req:NextRequest){
    try{

        const courses = await prismaClient.course.findMany();

        return NextResponse.json({
            success:true,
            message:"Courses fetched successfully",
            courses:courses
        })

    }catch(e){
        return NextResponse.json({
            success:false,
            message:"Something went wrong"
        })
    }
}
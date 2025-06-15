import { NextRequest,NextResponse } from "next/server";
import prismaClient from "@/lib/db";
// No middleware import needed for public route
// import middleware from "@/middleware/middleware";


export async function GET(req:NextRequest){
    try{
        // Removed authentication and authorization logic
        // const authResponse = await middleware(req);
        // const userData = authResponse.headers.get("x-user-id");
        // if (!userData || userData.split(':')[0] !== 'ADMIN') {
        //     return NextResponse.json({
        //         msg: "Unauthorized"
        //     }, { status: 401 });
        // }

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
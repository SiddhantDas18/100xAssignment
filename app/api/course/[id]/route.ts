import { NextRequest,NextResponse } from "next/server";
import prismaClient from "@/lib/db";
import middleware from "@/middleware/middleware";

export async function GET(req:NextRequest){
    try{

        const authresponse = await middleware(req);

        const userData = authresponse.headers.get("x-user-id");
        
        if(!userData) {
            return NextResponse.json({
                msg: "User data not found"
            }, { status: 401 })
        }

        const [role, userId] = userData.split(':')

        // Ensure only administrators can access this route for managing courses
        if (role !== 'ADMIN') {
            return NextResponse.json({
                msg: "Forbidden: Only administrators can access this resource."
            }, { status: 403 });
        }

        const id = req.nextUrl.pathname.split('/').pop();
        const courseId = Number(id)
        
        const openCourse = await prismaClient.course.findUnique({
            where:{
                id:courseId
            },
            include: {
                lessons: {
                    include: {
                        content: true,
                    },
                },
            }
        })

        if(!openCourse){
            return NextResponse.json({
                msg:"No course found with this name"
            }, { status: 404 })
        }

        return NextResponse.json({
            course: openCourse
        })

    }catch(e){
        return NextResponse.json({
            msg:(e as Error).message
        }, { status: 500 })
    }
}
import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db"
import middleware from "@/middleware/middleware";

export async function POST(req: NextRequest) {
    try {
        const authResponse = await middleware(req);

        const userData = authResponse.headers.get("x-user-id");

        if (!userData || userData.split(':')[0] !== 'ADMIN') {
            return NextResponse.json({
                msg: "Unauthorized"
            }, { status: 401 });
        }

        const {
            title,
            courseId,
            videoUrl,
            description,
            thumbnailUrl,
            parentId,
        } = await req.json();

        if (!title || !courseId) {
            return NextResponse.json({
                msg: "Lesson title and courseId are required"
            }, { status: 400 });
        }

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

        const newLesson = await prismaClient.lesson.create({
            data: {
                title,
                courseId,
                videoUrl: videoUrl || null,
                description: description || null,
                thumbnailUrl: thumbnailUrl || null,
                parentId: parentId || null,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Lesson created successfully",
            lesson: newLesson,
        }, { status: 201 });

    } catch (e) {
        console.error("Error creating lesson:", e);
        return NextResponse.json({
            msg: (e as Error).message || "Something went wrong"
        }, { status: 500 });
    }
}
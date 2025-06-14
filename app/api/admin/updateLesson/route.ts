import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db";
import middleware from "@/middleware/middleware";

export async function PUT(req: NextRequest) {
    try {
        const authresponse = await middleware(req);

        const userData = authresponse.headers.get("x-user-id");
        
        if (!userData) {
            return NextResponse.json({
                msg: "User data not found"
            }, { status: 401 })
        }

        const [role, userId] = userData.split(':');

        if (role !== 'ADMIN') {
            return NextResponse.json({
                msg: "Unauthorized: Admin access required"
            }, { status: 403 })
        }

        const {
            lessonId,
            title,
            videoUrl,
            description,
            thumbnailUrl,
            parentId
        } = await req.json();

        if (!lessonId || !title || !videoUrl) {
            return NextResponse.json({
                success: false,
                message: "Lesson ID, title, and video URL are required."
            }, { status: 400 });
        }

        const updatedLesson = await prismaClient.lesson.update({
            where: {
                id: lessonId
            },
            data: {
                title,
                videoUrl,
                description,
                thumbnailUrl,
                parentId: parentId === null ? null : Number(parentId) // Ensure parentId is number or null
            }
        });

        return NextResponse.json({
            success: true,
            message: "Lesson updated successfully.",
            lesson: updatedLesson
        });

    } catch (e) {
        console.error("Error updating lesson:", e);
        return NextResponse.json({
            success: false,
            message: "Something went wrong",
            error: (e as Error).message
        }, { status: 500 });
    }
} 
import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db";
import middleware from "@/middleware/middleware";

export async function PUT(req: NextRequest) {
    try {
        const authResponse = await middleware(req);

        const userData = authResponse.headers.get("x-user-id");

        if (!userData || userData.split(':')[0] !== 'ADMIN') {
            return NextResponse.json({
                msg: "Unauthorized"
            }, { status: 401 });
        }

        const {
            lessonId,
            title,
            videoUrl,
            description,
            thumbnailUrl,
            parentId,
        } = await req.json();

        if (!lessonId || !title) {
            return NextResponse.json({
                msg: "Lesson ID and title are required"
            }, { status: 400 });
        }

        const updatedLesson = await prismaClient.lesson.update({
            where: {
                id: lessonId,
            },
            data: {
                title,
                videoUrl: videoUrl || null,
                description: description || null,
                thumbnailUrl: thumbnailUrl || null,
                parentId: parentId || null,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Lesson updated successfully",
            lesson: updatedLesson,
        }, { status: 200 });

    } catch (e) {
        console.error("Error updating lesson:", e);
        return NextResponse.json({
            msg: (e as Error).message || "Something went wrong"
        }, { status: 500 });
    }
} 
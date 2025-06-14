import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");
        const lessonId = searchParams.get("lessonId");

        if (!courseId || !lessonId) {
            return NextResponse.json({
                success: false,
                message: "Course ID and Lesson ID are required"
            }, { status: 400 });
        }

        const lesson = await prismaClient.lesson.findUnique({
            where: {
                id: parseInt(lessonId),
                courseId: parseInt(courseId)
            }
        });

        if (!lesson) {
            return NextResponse.json({
                success: false,
                message: "Lesson not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Lesson details fetched successfully",
            lesson: lesson
        });

    } catch (e) {
        console.error("Error fetching lesson details:", e);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 });
    }
} 
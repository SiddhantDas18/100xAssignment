import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db";
import middleware from "@/middleware/middleware";

export async function DELETE(req: NextRequest) {
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

        const { lessonId, courseId } = await req.json();

        if (!lessonId || !courseId) {
            return NextResponse.json({
                success: false,
                message: "Lesson ID and Course ID are required."
            }, { status: 400 });
        }

        // Verify the lesson belongs to the course and exists
        const lesson = await prismaClient.lesson.findFirst({
            where: {
                id: lessonId,
                courseId: courseId
            }
        });

        if (!lesson) {
            return NextResponse.json({
                success: false,
                message: "Lesson not found or does not belong to this course."
            }, { status: 404 });
        }

        await prismaClient.lesson.delete({
            where: {
                id: lessonId
            }
        });

        return NextResponse.json({
            success: true,
            message: "Lesson deleted successfully."
        });

    } catch (e) {
        console.error("Error deleting lesson:", e);
        return NextResponse.json({
            success: false,
            message: "Something went wrong",
            error: (e as Error).message
        }, { status: 500 });
    }
} 
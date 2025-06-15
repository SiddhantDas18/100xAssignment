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
            contentId,
            lessonId,
            type,
            content,
            order,
        } = await req.json();

        if (!contentId || !lessonId || !type || content === undefined || content === null) {
            return NextResponse.json({
                msg: "Content ID, Lesson ID, type, and content are required"
            }, { status: 400 });
        }

        const updatedContent = await prismaClient.content.update({
            where: {
                id: contentId,
                lessonId: lessonId,
            },
            data: {
                type,
                content,
                order: order || 0,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Content updated successfully",
            content: updatedContent,
        }, { status: 200 });

    } catch (e) {
        console.error("Error updating content:", e);
        return NextResponse.json({
            msg: (e as Error).message || "Something went wrong"
        }, { status: 500 });
    }
} 
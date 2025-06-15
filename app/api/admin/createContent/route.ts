import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db";
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
            lessonId,
            type,
            content,
            order,
        } = await req.json();

        if (!lessonId || !type || content === undefined || content === null) {
            return NextResponse.json({
                msg: "Lesson ID, type, and content are required"
            }, { status: 400 });
        }

        const newContent = await prismaClient.content.create({
            data: {
                lessonId,
                type,
                content,
                order: order || 0,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Content created successfully",
            content: newContent,
        }, { status: 201 });

    } catch (e) {
        console.error("Error creating content:", e);
        return NextResponse.json({
            msg: (e as Error).message || "Something went wrong"
        }, { status: 500 });
    }
} 
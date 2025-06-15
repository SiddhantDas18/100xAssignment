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
            title,
            description,
            price,
            imageUrl,
            categoryId,
        } = await req.json();

        if (!title || !description || !price || !imageUrl || categoryId === null) {
            return NextResponse.json({
                msg: "All fields are required"
            }, { status: 400 });
        }

        const newCourse = await prismaClient.course.create({
            data: {
                title,
                description,
                price,
                imageUrl,
                categories: {
                    connect: { id: categoryId },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: "Course created successfully",
            course: newCourse,
        }, { status: 201 });

    } catch (e) {
        console.error("Error creating course:", e);
        return NextResponse.json({
            msg: (e as Error).message || "Something went wrong"
        }, { status: 500 });
    }
}
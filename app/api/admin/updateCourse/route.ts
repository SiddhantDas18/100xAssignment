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
            courseId,
            title,
            description,
            price,
            imageUrl,
        } = await req.json();

        if (!courseId || !title || !description || !price || !imageUrl) {
            return NextResponse.json({
                success: false,
                message: "Course ID, title, description, price, and image URL are required."
            }, { status: 400 });
        }

        const updatedCourse = await prismaClient.course.update({
            where: {
                id: courseId
            },
            data: {
                title,
                description,
                price,
                imageUrl,
            }
        });

        return NextResponse.json({
            success: true,
            message: "Course updated successfully.",
            course: updatedCourse
        });

    } catch (e) {
        console.error("Error updating course:", e);
        return NextResponse.json({
            success: false,
            message: "Something went wrong",
            error: (e as Error).message
        }, { status: 500 });
    }
} 
import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");

        if (!courseId) {
            return NextResponse.json({
                success: false,
                message: "Course ID is required"
            }, { status: 400 });
        }

        const course = await prismaClient.course.findUnique({
            where: {
                id: parseInt(courseId)
            },
            include: {
                lessons: true // Include lessons associated with the course
            }
        });

        if (!course) {
            return NextResponse.json({
                success: false,
                message: "Course not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Course details fetched successfully",
            course: course
        });

    } catch (e) {
        console.error("Error fetching course details:", e);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 });
    }
} 
import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db"
import middleware from "@/middleware/middleware";

export async function POST(req: NextRequest) {
    try {
        const authresponse = await middleware(req);

        const userData = authresponse.headers.get("x-user-id");
        
        if(!userData) {
            return NextResponse.json({
                msg: "User data not found"
            }, { status: 401 })
        }

        const [role, userId] = userData.split(':');

        const { courseId } = await req.json();

        // Get course price
        const course = await prismaClient.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return NextResponse.json({
                msg: "Course not found"
            }, { status: 404 })
        }

        // Check if already purchased
        const existingPurchase = await prismaClient.purchase.findFirst({
            where: {
                userId: parseInt(userId),
                courseId: courseId
            }
        });

        if (existingPurchase) {
            return NextResponse.json({
                msg: "Course already purchased"
            }, { status: 400 })
        }

        // Create purchase
        const purchase = await prismaClient.purchase.create({
            data: {
                userId: parseInt(userId),
                courseId: courseId,
                purhcaseAmount: course.price
            }
        });

        return NextResponse.json({
            success: true,
            purchase: purchase
        });

    } catch(e) {
        return NextResponse.json({
            success: false,
            message: "Something went wrong",
            error: (e as Error).message
        })
    }
}
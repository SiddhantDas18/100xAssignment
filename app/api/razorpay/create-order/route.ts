import { NextRequest, NextResponse } from "next/server";
import Razorpay from 'razorpay';
import prismaClient from "@/lib/db";
import middleware from "@/middleware/middleware";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
    try {
        // Authenticate and authorize the user
        const authResponse = await middleware(req);
        const userData = authResponse.headers.get("x-user-id");

        if (!userData) {
            return NextResponse.json({
                msg: "User not authenticated"
            }, { status: 401 });
        }

        const [role, userId] = userData.split(':');
        const parsedUserId = Number(userId);

        const { courseId } = await req.json();

        if (!courseId) {
            return NextResponse.json({
                msg: "Course ID is required"
            }, { status: 400 });
        }

        const course = await prismaClient.course.findUnique({
            where: {
                id: courseId,
            },
        });

        if (!course) {
            return NextResponse.json({
                msg: "Course not found"
            }, { status: 404 });
        }

        // Check if the user has already purchased the course
        const existingPurchase = await prismaClient.purchase.findFirst({
            where: {
                userId: parsedUserId,
                courseId: courseId,
                status: 'completed',
            },
        });

        if (existingPurchase) {
            return NextResponse.json({
                msg: "Course already purchased"
            }, { status: 409 });
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: course.price * 100, // Amount in smallest currency unit (paise for INR)
            currency: "INR",
            receipt: `receipt_${courseId}_${parsedUserId}`,
            notes: {
                courseId: courseId.toString(),
                userId: parsedUserId.toString(),
            }
        });

        // Save the order details to your database
        await prismaClient.order.create({
            data: {
                orderId: order.id,
                userId: parsedUserId,
                courseId: courseId,
                amount: order.amount / 100, // Convert back to rupees for storage
                currency: order.currency,
                status: "created",
                notes: order.notes, // Store Razorpay notes in your DB
            },
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (e: any) {
        console.error("Error creating Razorpay order:", e);
        return NextResponse.json({
            msg: e.message || "Something went wrong"
        }, { status: 500 });
    }
} 
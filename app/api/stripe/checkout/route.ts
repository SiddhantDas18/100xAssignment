import { NextRequest, NextResponse } from "next/server";
import Stripe from 'stripe';
import prismaClient from "@/lib/db";
import middleware from "@/middleware/middleware";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY is not set.");
    // Consider throwing an error here or handling it more gracefully if the app can't function without it
}
console.log("Stripe Secret Key (last 4 chars):");
const stripe = new Stripe(stripeSecretKey as string, {
    apiVersion: '2024-06-20',
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
                status: 'completed', // Only check for completed purchases
            },
        });

        if (existingPurchase) {
            return NextResponse.json({
                msg: "Course already purchased"
            }, { status: 409 }); // 409 Conflict
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: course.title,
                            description: course.description || undefined,
                            images: course.imageUrl ? [course.imageUrl] : undefined,
                        },
                        unit_amount: course.price * 100, // Price in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/dashboard?payment=success&courseId=${course.id}`,
            cancel_url: `${req.headers.get('origin')}/courses/${course.id}?payment=cancelled`,
            metadata: {
                courseId: course.id,
                userId: parsedUserId,
            },
        });

        return NextResponse.json({
            success: true,
            url: session.url,
        });

    } catch (e: any) {
        console.error("Error creating Stripe checkout session:", e);
        if (e instanceof Stripe.StripeError) {
            console.error("Stripe Error Details:", {
                message: e.message,
                type: e.type,
                code: e.code,
                // Add more details if necessary, e.g., e.statusCode, e.param
            });
        } else {
            console.error("Non-Stripe Error Details:", e); // Log full error object for other errors
        }
        return NextResponse.json({
            msg: e.message || "Something went wrong"
        }, { status: 500 });
    }
} 
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prismaClient from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ msg: 'No stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed.', err.message);
        return NextResponse.json({ msg: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;

            // Extract metadata
            const userId = session.metadata?.userId ? Number(session.metadata.userId) : null;
            const courseId = session.metadata?.courseId ? Number(session.metadata.courseId) : null;
            const amount = session.amount_total !== null ? session.amount_total / 100 : 0; // Amount in USD

            if (!userId || !courseId) {
                console.error('Missing userId or courseId in checkout session metadata.');
                return NextResponse.json({ msg: 'Missing metadata' }, { status: 400 });
            }

            try {
                await prismaClient.purchase.create({
                    data: {
                        userId: userId,
                        courseId: courseId,
                        amount: amount,
                        status: 'completed',
                    },
                });
                console.log(`Purchase recorded for user ${userId}, course ${courseId}`);
            } catch (dbError) {
                console.error('Error saving purchase to DB:', dbError);
                return NextResponse.json({ msg: 'Database error' }, { status: 500 });
            }
            break;
        // Potentially handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
} 
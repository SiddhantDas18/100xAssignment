import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prismaClient from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json({ msg: 'No signature header' }, { status: 400 });
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            return NextResponse.json({ msg: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(body);
        console.log('Razorpay Webhook Event Received:', event.event);

        // Handle payment success
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const order = event.payload.payment.entity.order_id;

            console.log('Payment Captured - Razorpay Order ID:', order);
            console.log('Payment Details:', { amount: payment.amount, currency: payment.currency });

            // Get order details to extract metadata using the unique orderId
            const orderDetails = await prismaClient.order.findUnique({
                where: { orderId: order },
            });

            if (!orderDetails) {
                console.error('Order not found for orderId:', order);
                return NextResponse.json({ msg: 'Order not found' }, { status: 404 });
            }

            const userId = orderDetails.userId;
            const courseId = orderDetails.courseId;
            const amount = payment.amount / 100; // Convert from paise to rupees

            console.log('Extracted from Order Details:', { userId, courseId, amount });

            // Create purchase record and link it to the Order
            await prismaClient.purchase.create({
                data: {
                    userId: userId,
                    courseId: courseId,
                    amount: amount,
                    status: 'completed',
                    orderId: orderDetails.id, // Link to the Order record's primary key
                },
            });
            console.log(`Purchase recorded for user ${userId}, course ${courseId} with orderId ${orderDetails.id}`);

            // Update the Order status to 'paid'
            await prismaClient.order.update({
                where: { id: orderDetails.id },
                data: { status: 'paid' },
            });
            console.log(`Order ${order} status updated to 'paid'.`);

            return NextResponse.json({ received: true });
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ msg: 'Webhook error' }, { status: 500 });
    }
} 
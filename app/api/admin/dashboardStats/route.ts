import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    console.log("Admin API - Token received:", !!token);
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    console.log("Admin API - Decoded token:", decoded);
    if (!decoded || decoded.role.toLowerCase() !== 'admin') {
      console.warn("Admin API - Authorization check failed. Decoded role:", decoded?.role);
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });
    }

    const totalCourses = await prisma.course.count();
    const totalLessons = await prisma.lesson.count();
    const totalUsers = await prisma.user.count();
    
    // Calculate total revenue from completed purchases
    const totalRevenueResult = await prisma.purchase.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'completed',
      },
    });
    const totalRevenue = totalRevenueResult._sum.amount || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalCourses,
        totalLessons,
        totalUsers,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
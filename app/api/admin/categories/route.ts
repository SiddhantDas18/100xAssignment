import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/admin/categories
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id]
export async function PUT(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, description } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, message: 'Category ID and name are required' },
        { status: 400 }
      );
    }

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        slug,
        description,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Category ID is required' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
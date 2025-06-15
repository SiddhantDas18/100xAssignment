import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db";
import middleware from "@/middleware/middleware";

export async function GET(req: NextRequest) {
    try {
        const authResponse = await middleware(req);

        const userData = authResponse.headers.get("x-user-id");

        if (!userData || userData.split(':')[0] !== 'ADMIN') {
            return NextResponse.json({
                msg: "Unauthorized"
            }, { status: 401 });
        }

        const users = await prismaClient.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Users fetched successfully",
            users: users,
        }, { status: 200 });

    } catch (e) {
        console.error("Error fetching users:", e);
        return NextResponse.json({
            msg: (e as Error).message || "Something went wrong"
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const authResponse = await middleware(req);

        const userData = authResponse.headers.get("x-user-id");

        if (!userData || userData.split(':')[0] !== 'ADMIN') {
            return NextResponse.json({
                msg: "Unauthorized"
            }, { status: 401 });
        }

        const url = new URL(req.url);
        const userId = Number(url.searchParams.get('userId'));

        if (!userId) {
            return NextResponse.json({
                msg: "User ID is required"
            }, { status: 400 });
        }

        const deletedUser = await prismaClient.user.delete({
            where: {
                id: userId,
            },
        });

        return NextResponse.json({
            success: true,
            message: "User deleted successfully",
            user: deletedUser,
        }, { status: 200 });

    } catch (e) {
        console.error("Error deleting user:", e);
        return NextResponse.json({
            msg: (e as Error).message || "Something went wrong"
        }, { status: 500 });
    }
} 
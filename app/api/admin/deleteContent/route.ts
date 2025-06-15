import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/db";
import middleware from "@/middleware/middleware";

export async function DELETE(req: NextRequest) {
    try {
        const authResponse = await middleware(req);

        const userData = authResponse.headers.get("x-user-id");

        if (!userData || userData.split(':')[0] !== 'ADMIN') {
            return NextResponse.json({
                msg: "Unauthorized"
            }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const contentId = searchParams.get("contentId");

        if (!contentId) {
            return NextResponse.json({
                msg: "Content ID is required"
            }, { status: 400 });
        }

        await prismaClient.content.delete({
            where: {
                id: Number(contentId),
            },
        });

        return NextResponse.json({
            success: true,
            message: "Content deleted successfully",
        }, { status: 200 });

    } catch (e) {
        console.error("Error deleting content:", e);
        return NextResponse.json({
            msg: (e as Error).message || "Something went wrong"
        }, { status: 500 });
    }
} 
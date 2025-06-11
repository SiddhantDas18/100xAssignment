import { NextRequest,NextResponse } from "next/server";
import prismaClient from "@/lib/db"
import middleware from "@/middleware/middleware";

export async function GET(req:NextRequest){
    try{

        const authresponse = await middleware(req);

        const userData = authresponse.headers.get("x-user-id");
        
        if(!userData) {
            return NextResponse.json({
                msg: "User data not found"
            }, { status: 401 })
        }

        const [role, userId] = userData.split(':')
        const user = Number(userId)

        const myCourses = await prismaClient.purchase.findMany({
            where:{
                userId:user
            }
        })

        if(myCourses.length==0){
            return NextResponse.json({
                msg:"Empty Bro"
            })
        }

        return NextResponse.json({
            msg:"Your courses",
            course:myCourses
        })

    }catch(e){
        msg:(e as Error).message
    }
}
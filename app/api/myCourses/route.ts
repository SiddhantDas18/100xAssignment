import { NextRequest,NextResponse } from "next/server";
import prismaClient from "@/lib/db"
import middleware from "@/middleware/middleware";

export async function GET(req:NextRequest){
    try{
        const authresponse = await middleware(req);
        console.log("Auth Response Headers:", authresponse.headers);
        const userData = authresponse.headers.get("x-user-id");
        
        if(!userData) {
            return NextResponse.json({
                msg: "User data not found"
            }, { status: 401 })
        }

        const [role, userId] = userData.split(':')
        const user = Number(userId)
        console.log("Parsed User ID for myCourses query:", user);

        // Fetch purchases with course details
        const purchases = await prismaClient.purchase.findMany({
            where: {
                userId: user,
                status: "completed" // Only fetch completed purchases
            },
            include: {
                course: {
                    include: {
                        lessons: true // Include lessons for each course
                    }
                }
            }
        });
        console.log("Fetched Purchases:", purchases);

        // Transform the data to match the frontend Course interface
        const courses = purchases.map(purchase => ({
            id: purchase.courseId,
            title: purchase.course.title,
            description: purchase.course.description,
            imageUrl: '/default-course-image.jpg', // Default image since it's not in schema
            price: purchase.amount,
            originalPrice: purchase.course.price,
            discount: 0, // Calculate if needed
            progress: 0, // You can implement progress tracking later
            lessons: purchase.course.lessons.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                videoUrl: lesson.videoUrl
            }))
        }));
        console.log("Transformed Courses:", courses);

        return NextResponse.json({
            courses: courses
        });

    } catch(e) {
        console.error('Error in myCourses:', e);
        return NextResponse.json({
            msg: (e as Error).message
        }, { status: 500 });
    }
}
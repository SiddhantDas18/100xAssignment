'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';

interface Course {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    originalPrice: number;
    discount: number;
    progress: number;
}

export default function Dashboard() {
    const router = useRouter();
    // Initialize with null to handle the initial state
    const [courses, setCourses] = useState<Course[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/signin');
                    return;
                }

                const response = await axios.get('/api/myCourses', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourses((response.data as { courses: Course[] }).courses || []);
            } catch (err) {
                setError('Failed to fetch your courses');
                console.error('Error fetching courses:', err);
                setCourses([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchMyCourses();
    }, [router]);

    if (loading) {
        return (
            <div className="h-screen w-screen bg-gradient-to-b from-[#f7f9fd] to-[#d4ddee] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-screen bg-gradient-to-b from-[#f7f9fd] to-[#d4ddee] p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>
                
                {error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (!courses || courses.length === 0) ? ( // Add null check here
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">You haven't purchased any courses yet</h2>
                        <p className="text-gray-600 mb-8">Start your learning journey today!</p>
                        <Link
                            href="/courses"
                            className="inline-block bg-blue-500 text-white px-8 py-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
                        >
                            Explore Courses
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={{
                                    ...course,
                                    id: parseInt(course.id),
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
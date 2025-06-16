'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import LessonCard from '@/components/LessonCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Lesson {
  id: number;
  title: string;
  videoUrl?: string;
}

interface CourseDetail {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  lessons: Lesson[];
}

export default function CourseDetailPage({ params: paramsPromise }: { params: Promise<{ courseId: string }> }) {
  const params = React.use(paramsPromise);
  const { courseId } = params;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'success' | 'error' | 'purchased' | 'alreadyPurchased' | 'notLoggedIn'>('idle');
  const router = useRouter();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setPurchaseStatus('notLoggedIn');
          // Do not redirect immediately, let user see course details first
        }

        const response = await axios.get<{ success: boolean; course: CourseDetail }>(`/api/getCourseDetails?courseId=${courseId}`);
        console.log('API Response:', response.data); // Log the API response

        if (response.data.success) {
          setCourse(response.data.course);
          console.log('Course State:', response.data.course); // Log the course state
          // Check if course is already purchased
          if (token) {
            try {
              const myCoursesResponse = await axios.get<{ courses: any[] }>('/api/myCourses', {
                headers: { Authorization: `Bearer ${token}` }
              });
              const isAlreadyPurchased = myCoursesResponse.data.courses.some((c: any) => c.id === course.id.toString());
              console.log('isAlreadyPurchased:', isAlreadyPurchased); // Debug log
              if (isAlreadyPurchased) {
                setPurchaseStatus('alreadyPurchased');
                console.log('Purchase Status set to:', 'alreadyPurchased'); // Debug log
              }
            } catch (myCoursesError) {
              console.error("Error checking purchased courses:", myCoursesError);
            }
          }
        } else {
          setError('Failed to fetch course details.');
        }
      } catch (err: unknown) {
        console.error('Error fetching course details:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, router]);

  const handlePurchase = async () => {
    setPurchaseStatus('idle'); // Reset status
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPurchaseStatus('notLoggedIn');
        router.push('/signin');
        return;
      }

      const response = await axios.post<{ success: boolean; orderId?: string; amount?: number; currency?: string; key?: string; msg?: string }>('/api/razorpay/create-order', {
        courseId: course?.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.orderId) {
        // Initialize Razorpay
        const options = {
          key: response.data.key,
          amount: response.data.amount,
          currency: response.data.currency,
          name: "100xDevs",
          description: course?.title,
          order_id: response.data.orderId,
          handler: function (response: any) {
            // Handle successful payment
            setPurchaseStatus('success');
            router.push('/dashboard');
          },
          prefill: {
            name: "User Name", // You can get this from user profile
            email: "user@example.com", // You can get this from user profile
          },
          theme: {
            color: "#2563EB"
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        if (response.data.msg === "Course already purchased") {
          setPurchaseStatus('alreadyPurchased');
        } else {
          setPurchaseStatus('error');
          setError(response.data.msg || "Failed to purchase course.");
        }
      }
    } catch (err: unknown) {
      console.error("Error purchasing course:", err);
      setPurchaseStatus('error');
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during purchase.');
      }
    }
  };

  const redirectToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => router.back()} 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Course not found.</p>
      </div>
    );
  }

  console.log('Current purchaseStatus before render:', purchaseStatus); // Debug log

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
      <p className="text-gray-700 mb-8">{course.description}</p>

      <div className="mb-8 flex items-center justify-between">
        <span className="text-3xl font-bold text-blue-600">₹{course.price}</span>
        {purchaseStatus === 'notLoggedIn' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/signin')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            Login to Purchase
          </motion.button>
        )}

        {purchaseStatus === 'idle' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePurchase}
            className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            Buy Course
          </motion.button>
        )}

        {purchaseStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center space-x-4"
          >
            <span className="text-green-600 font-semibold">Purchase Successful!</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={redirectToDashboard}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
            >
              Go to My Courses
            </motion.button>
          </motion.div>
        )}

        {purchaseStatus === 'alreadyPurchased' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={redirectToDashboard}
            className="bg-gray-400 text-white px-6 py-3 rounded-lg shadow-md"
          >
            Already Purchased / View Course
          </motion.button>
        )}

        {purchaseStatus === 'error' && (
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 font-semibold"
          >
            Error: {error}
          </motion.span>
        )}
      </div>

      {(purchaseStatus === 'alreadyPurchased' || purchaseStatus === 'success') && course.lessons && course.lessons.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <h2 className="text-2xl font-semibold mb-4">Lessons</h2>
        {course.lessons?.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} courseId={courseId} />
        ))}
      </div>
      )}
    </div>
  );
} 
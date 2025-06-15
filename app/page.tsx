'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import axios from "axios";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasPurchasedCourses, setHasPurchasedCourses] = useState(false);

  useEffect(() => {
    const checkAuthAndCourses = async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
          try {
            const response = await axios.get('/api/myCourses', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.courses && response.data.courses.length > 0) {
              setHasPurchasedCourses(true);
        router.push('/dashboard');
      } else {
              router.push('/courses');
            }
          } catch (error) {
            console.error("Error fetching purchased courses:", error);
            router.push('/signin'); // Redirect to signin on API error or invalid token
          }
        } else {
          router.push('/signin');
      }
    }
    };

    checkAuthAndCourses();
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen"
    >
      <div className="text-center">
        <Image src="/kirat.png" alt="Loading" width={100} height={100} className="animate-pulse mx-auto mb-4" />
        <p className="text-lg text-gray-700">Loading your learning journey...</p>
    </div>
    </motion.div>
  );
}

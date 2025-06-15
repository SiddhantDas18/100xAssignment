'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ManageLessonsPage() {
  const router = useRouter();

  useEffect(() => {
    // Unconditionally redirect to manage-courses
    router.push('/admin/manage-courses');
  }, [router]);

  // Render nothing while redirecting
  return null;
} 
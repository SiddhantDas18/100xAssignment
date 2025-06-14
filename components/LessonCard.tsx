'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Lesson {
  id: number;
  title: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

interface LessonCardProps {
  lesson: Lesson;
  courseId: string;
}

export default function LessonCard({ lesson, courseId }: LessonCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full"
    >
      <div className="relative w-full pt-[56.25%] bg-gray-200">
        {lesson.thumbnailUrl ? (
          <Image
            src={lesson.thumbnailUrl}
            alt={lesson.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">No thumbnail available</span>
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <h2 className="text-xl font-semibold mb-2">{lesson.title}</h2>
        <div className="flex items-center gap-4 mt-auto">
          <Link
            href={`/courses/${courseId}/lessons/${lesson.id}`}
            className="flex-1 text-center px-6 py-2.5 rounded-lg transition-colors bg-blue-500 hover:bg-blue-600 text-white"
          >
            View Lesson
          </Link>
        </div>
      </div>
    </motion.div>
  );
} 
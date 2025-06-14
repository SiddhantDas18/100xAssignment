'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <Link href={`/courses/${course.id}`}>
        <div className="relative h-48">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        <div className="p-4">
          {course.category && (
            <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-2">
              {course.category.name}
            </span>
          )}
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-indigo-600 font-medium">
              ${course.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">View Course</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react';
import Image from 'next/image';

interface LessonDetail {
  id: number;
  title: string;
  videoUrl?: string;
  description?: string; // Assuming lessons can have descriptions
  thumbnailUrl?: string;
}

export default function LessonDetailPage({ params: paramsPromise }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const params = React.use(paramsPromise);
  const { courseId, lessonId } = params;
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLessonDetails = async () => {
      try {
        const response = await axios.get<{ success: boolean; lesson: LessonDetail }>(`/api/getLessonDetails?courseId=${courseId}&lessonId=${lessonId}`);
        if (response.data.success) {
          setLesson(response.data.lesson);
        } else {
          setError('Failed to fetch lesson details.');
        }
      } catch (err: unknown) {
        console.error('Error fetching lesson details:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lessonId) {
      fetchLessonDetails();
    }
  }, [courseId, lessonId]);

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

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Lesson not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>
      {lesson.thumbnailUrl && (
        <div className="mb-8 relative w-full pt-[56.25%] bg-gray-200 rounded-lg overflow-hidden">
          <Image
            src={lesson.thumbnailUrl}
            alt={lesson.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      {lesson.videoUrl && (
        <div className="mb-8 aspect-video w-full bg-black rounded-lg overflow-hidden">
          <iframe
            src={lesson.videoUrl}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      )}
      {lesson.description && (
        <div className="text-gray-700 leading-relaxed">
          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p>{lesson.description}</p>
        </div>
      )}
      <div className="mt-8">
        <button 
          onClick={() => router.back()} 
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Back to Course
        </button>
      </div>
    </div>
  );
} 
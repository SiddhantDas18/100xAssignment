'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import React from 'react';

interface Lesson {
    id: number;
    title: string;
    videoUrl?: string;
    description?: string;
    thumbnailUrl?: string;
    parentId?: number;
    sublessons?: Lesson[];
}

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    lesson: Lesson[];
}

export default function ManageLessons({ params: paramsPromise }: { params: Promise<{ courseId: string }> }) {
    const params = React.use(paramsPromise);
    const { courseId } = params;
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState('');
    const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
    const [newLessonDescription, setNewLessonDescription] = useState('');
    const [newLessonThumbnailUrl, setNewLessonThumbnailUrl] = useState('');
    const [newLessonParentId, setNewLessonParentId] = useState<number | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [currentLessonToEdit, setCurrentLessonToEdit] = useState<Lesson | null>(null);
    const [editLessonTitle, setEditLessonTitle] = useState('');
    const [editLessonVideoUrl, setEditLessonVideoUrl] = useState('');
    const [editLessonDescription, setEditLessonDescription] = useState('');
    const [editLessonThumbnailUrl, setEditLessonThumbnailUrl] = useState('');
    const [editLessonParentId, setEditLessonParentId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [lessonLoading, setLessonLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/signin');
                    return;
                }

                const response = await axios.get<{ course: Course & { lesson: (Lesson & { sublessons: Lesson[] })[] } }>(`/api/course/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.course) {
                    const courseData = response.data.course;
                    const topLevelLessons = courseData.lesson.filter(lesson => lesson.parentId === null);
                    const lessonsWithSublessons = topLevelLessons.map(lesson => ({
                        ...lesson,
                        sublessons: courseData.lesson.filter(sub => sub.parentId === lesson.id)
                    }));
                    setCourse({ ...courseData, lesson: lessonsWithSublessons });
                } else {
                    setError("Course not found.");
                }
            } catch (err) {
                console.error("Error fetching course details:", err);
                setError("Failed to fetch course details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId, router]);

    const resetForm = () => {
        setNewLessonTitle('');
        setNewLessonVideoUrl('');
        setNewLessonDescription('');
        setNewLessonThumbnailUrl('');
        setNewLessonParentId(null);
        setIsEditing(false);
        setCurrentLessonToEdit(null);
        setEditLessonTitle('');
        setEditLessonVideoUrl('');
        setEditLessonDescription('');
        setEditLessonThumbnailUrl('');
        setEditLessonParentId(null);
    };

    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        setLessonLoading(true);
        setMessage('');
        setError('');

        if (!newLessonTitle) {
            setError("Lesson title is required.");
            setLessonLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/signin');
                return;
            }

            const response = await axios.post<{ success: boolean; message?: string; lesson?: Lesson }>('/api/admin/createLessons', {
                title: newLessonTitle,
                courseId: Number(courseId),
                videoUrl: newLessonVideoUrl || undefined,
                description: newLessonDescription || undefined,
                thumbnailUrl: newLessonThumbnailUrl || undefined,
                parentId: newLessonParentId,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage("Lesson created successfully!");
                resetForm();
                fetchCourseDetails(); // Refresh course data
            } else {
                setError(response.data.message || "Failed to create lesson.");
            }
        } catch (err: unknown) {
            console.error("Error creating lesson:", err);
            if (err instanceof Error && 'response' in err && err.response) {
                const axiosError = err as { response: { data: { msg?: string } } };
                setError(axiosError.response.data.msg || "An unexpected error occurred.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLessonLoading(false);
        }
    };

    const handleEditClick = (lesson: Lesson) => {
        setIsEditing(true);
        setCurrentLessonToEdit(lesson);
        setEditLessonTitle(lesson.title);
        setEditLessonVideoUrl(lesson.videoUrl || '');
        setEditLessonDescription(lesson.description || '');
        setEditLessonThumbnailUrl(lesson.thumbnailUrl || '');
        setEditLessonParentId(lesson.parentId || null);
    };

    const handleUpdateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        setLessonLoading(true);
        setMessage('');
        setError('');

        if (!currentLessonToEdit) {
            setError("No lesson selected for editing.");
            setLessonLoading(false);
            return;
        }

        if (!editLessonTitle) {
            setError("Lesson title is required.");
            setLessonLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/signin');
                return;
            }

            const response = await axios.put<{ success: boolean; message?: string; lesson?: Lesson }>('/api/admin/updateLesson', {
                lessonId: currentLessonToEdit.id,
                title: editLessonTitle,
                videoUrl: editLessonVideoUrl || undefined,
                description: editLessonDescription || undefined,
                thumbnailUrl: editLessonThumbnailUrl || undefined,
                parentId: editLessonParentId,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage("Lesson updated successfully!");
                resetForm();
                fetchCourseDetails(); // Refresh course data
            } else {
                setError(response.data.message || "Failed to update lesson.");
            }
        } catch (err: unknown) {
            console.error("Error updating lesson:", err);
            if (err instanceof Error && 'response' in err && err.response) {
                const axiosError = err as { response: { data: { msg?: string } } };
                setError(axiosError.response.data.msg || "An unexpected error occurred.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLessonLoading(false);
        }
    };

    const handleDeleteLesson = async (lessonId: number) => {
        if (!confirm("Are you sure you want to delete this lesson? This will also delete any sublessons.")) {
            return;
        }
        setLessonLoading(true);
        setMessage('');
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/signin');
                return;
            }

            const response = await axios.delete<{ success: boolean; message?: string }>('/api/admin/deleteLesson', {
                headers: { Authorization: `Bearer ${token}` },
                params: { lessonId, courseId: Number(courseId) }
            });

            if (response.data.success) {
                setMessage("Lesson deleted successfully!");
                // No need to manually update state, fetchCourseDetails will refresh
                fetchCourseDetails();
            } else {
                setError(response.data.message || "Failed to delete lesson.");
            }
        } catch (err: unknown) {
            console.error("Error deleting lesson:", err);
            if (err instanceof Error && 'response' in err && err.response) {
                setError((err.response as any).data.msg || "An unexpected error occurred.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLessonLoading(false);
        }
    };

    const fetchCourseDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/signin');
                return;
            }

            const response = await axios.get<{ course: Course & { lesson: (Lesson & { sublessons: Lesson[] })[] } }>(`/api/course/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.course) {
                const courseData = response.data.course;
                const topLevelLessons = courseData.lesson.filter(lesson => lesson.parentId === null);
                const lessonsWithSublessons = topLevelLessons.map(lesson => ({
                    ...lesson,
                    sublessons: courseData.lesson.filter(sub => sub.parentId === lesson.id)
                }));
                setCourse({ ...courseData, lesson: lessonsWithSublessons });
            } else {
                setError("Course not found.");
            }
        } catch (err) {
            console.error("Error fetching course details:", err);
            setError("Failed to fetch course details. Please try again.");
        }
    };

    const renderLesson = (lesson: Lesson, indentLevel: number) => (
        <div 
            key={lesson.id} 
            className={"bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center " + 
                (indentLevel > 0 ? 'ml-8 border-l-4 border-blue-200 pl-4' : '')}
        >
            <div className="flex-grow mb-4 md:mb-0">
                <h3 className="text-xl font-medium text-gray-900 mb-2">{lesson.title}</h3>
                {lesson.description && <p className="text-gray-600 mb-2">{lesson.description}</p>}
                {lesson.videoUrl && (
                    <div className="w-full md:w-96 mb-4">
                        <video controls src={lesson.videoUrl} className="w-full rounded-md"></video>
                    </div>
                )}
                {lesson.thumbnailUrl && <p className="text-gray-600 break-all mb-2">Thumbnail URL: {lesson.thumbnailUrl}</p>}
                <p className="text-gray-600 break-all">Video URL: {lesson.videoUrl || 'N/A'}</p>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => handleEditClick(lesson)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={lessonLoading}
                >
                    Edit
                </button>
                <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={lessonLoading}
                >
                    Delete
                </button>
            </div>
        </div>
    );

    const renderLessonsRecursive = (lessons: Lesson[], indentLevel: number = 0) => (
        <>
            {lessons.map(lesson => (
                <div key={lesson.id}>
                    {renderLesson(lesson, indentLevel)}
                    {lesson.sublessons && lesson.sublessons.length > 0 && (
                        <div className="mt-4 space-y-4">
                            {renderLessonsRecursive(lesson.sublessons, indentLevel + 1)}
                        </div>
                    )}
                </div>
            ))}
        </>
    );

    if (loading) {
        return (
            <div className="h-screen w-screen bg-gradient-to-b from-[#f7f9fd] to-[#d4ddee] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-screen bg-gradient-to-b from-[#f7f9fd] to-[#d4ddee] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen w-screen bg-gradient-to-b from-[#f7f9fd] to-[#d4ddee] flex items-center justify-center">
                <p className="text-gray-700">Course not found or accessible.</p>
            </div>
        );
    }

    const availableParentLessons = course.lesson.filter(l => !isEditing || (currentLessonToEdit && l.id !== currentLessonToEdit.id && l.parentId !== currentLessonToEdit.id));

    return (
        <div className="min-h-screen w-screen bg-gradient-to-b from-[#f7f9fd] to-[#d4ddee] p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Manage Lessons for "{course.title}"</h1>

                <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">{isEditing ? 'Edit Lesson' : 'Create New Lesson'}</h2>
                    {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

                    <form onSubmit={isEditing ? handleUpdateLesson : handleCreateLesson} className="space-y-4">
                        <div>
                            <label htmlFor="lessonTitle" className="block text-sm font-medium text-gray-700">Lesson Title</label>
                            <input
                                type="text"
                                id="lessonTitle"
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={isEditing ? editLessonTitle : newLessonTitle}
                                onChange={(e) => isEditing ? setEditLessonTitle(e.target.value) : setNewLessonTitle(e.target.value)}
                                disabled={lessonLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">Video URL</label>
                            <input
                                type="text"
                                id="videoUrl"
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={isEditing ? editLessonVideoUrl : newLessonVideoUrl}
                                onChange={(e) => isEditing ? setEditLessonVideoUrl(e.target.value) : setNewLessonVideoUrl(e.target.value)}
                                disabled={lessonLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="description"
                                rows={3}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={isEditing ? editLessonDescription : newLessonDescription}
                                onChange={(e) => isEditing ? setEditLessonDescription(e.target.value) : setNewLessonDescription(e.target.value)}
                                disabled={lessonLoading}
                            ></textarea>
                        </div>
                        <div>
                            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
                            <input
                                type="text"
                                id="thumbnailUrl"
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={isEditing ? editLessonThumbnailUrl : newLessonThumbnailUrl}
                                onChange={(e) => isEditing ? setEditLessonThumbnailUrl(e.target.value) : setNewLessonThumbnailUrl(e.target.value)}
                                disabled={lessonLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">Parent Lesson (Optional)</label>
                            <select
                                id="parentId"
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={isEditing ? (editLessonParentId || '') : (newLessonParentId || '')}
                                onChange={(e) => isEditing ? setEditLessonParentId(e.target.value ? Number(e.target.value) : null) : setNewLessonParentId(e.target.value ? Number(e.target.value) : null)}
                                disabled={lessonLoading}
                            >
                                <option value="">No Parent (Top Level Lesson)</option>
                                {availableParentLessons.map(lesson => (
                                    <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={lessonLoading}
                            >
                                {isEditing ? 'Update Lesson' : 'Add Lesson'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={lessonLoading}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Existing Lessons</h2>
                {course.lesson.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
                        No lessons added to this course yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {renderLessonsRecursive(course.lesson)}
                    </div>
                )}
            </div>
        </div>
    );
} 
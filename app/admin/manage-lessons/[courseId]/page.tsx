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
    content?: Content[];
}

interface Content {
    id: number;
    lessonId: number;
    type: string;
    content: string;
    order: number;
}

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    lessons: Lesson[];
}

export default function ManageLessons({ params: paramsPromise }: { params: Promise<{ courseId: string }> }) {
    const params = React.use(paramsPromise);
    const { courseId } = params;
    const router = useRouter();

    // Redirect if courseId is not provided
    if (!courseId) {
        router.push('/admin/manage-courses');
        return null; // Or a loading spinner, as the redirect will happen immediately
    }

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
    const [availableParentLessons, setAvailableParentLessons] = useState<Lesson[]>([]);

    const [newContentType, setNewContentType] = useState('');
    const [newContentValue, setNewContentValue] = useState('');
    const [newContentOrder, setNewContentOrder] = useState<number | ''>('');
    const [isAddingContent, setIsAddingContent] = useState(false);
    const [currentLessonForContent, setCurrentLessonForContent] = useState<Lesson | null>(null);

    const [isEditingContent, setIsEditingContent] = useState(false);
    const [currentContentToEdit, setCurrentContentToEdit] = useState<Content | null>(null);
    const [editContentType, setEditContentType] = useState('');
    const [editContentValue, setEditContentValue] = useState('');
    const [editContentOrder, setEditContentOrder] = useState<number | ''>('');
    const [contentLoading, setContentLoading] = useState(false);

    const fetchCourseDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/signin');
                return;
            }

            const response = await axios.get<{ course: Course & { lessons: (Lesson & { sublessons: Lesson[] })[] } }>(`/api/course/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.course) {
                const courseData = response.data.course;
                console.log("Course data received:", courseData);
                const topLevelLessons = courseData.lessons.filter(lesson => lesson.parentId === null);
                const lessonsWithSublessons = topLevelLessons.map(lesson => ({
                    ...lesson,
                    sublessons: courseData.lessons.filter(sub => sub.parentId === lesson.id)
                }));
                setCourse({ ...courseData, lessons: lessonsWithSublessons });
            } else {
                setError("Course not found.");
            }
        } catch (err: any) {
            console.error("Error fetching course details:", err);
            if (err.response) {
                console.error("Response data:", err.response.data);
                console.error("Response status:", err.response.status);
                console.error("Response headers:", err.response.headers);
                setError(err.response.data.msg || "Failed to fetch course details. Please try again.");
            } else if (err.request) {
                console.error("Request data:", err.request);
                setError("Failed to fetch course details. No response from server. Please try again.");
            } else {
                console.error("Error message:", err.message);
                setError("Failed to fetch course details. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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
        setNewContentType('');
        setNewContentValue('');
        setNewContentOrder('');
        setIsAddingContent(false);
        setCurrentLessonForContent(null);
        setIsEditingContent(false);
        setCurrentContentToEdit(null);
        setEditContentType('');
        setEditContentValue('');
        setEditContentOrder('');
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
        setAvailableParentLessons(course?.lessons.filter(l => l.id !== lesson.id && l.parentId === null) || []);
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
                params: { lessonId }
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

    const handleAddContentClick = (lesson: Lesson) => {
        setIsAddingContent(true);
        setCurrentLessonForContent(lesson);
        setNewContentType('');
        setNewContentValue('');
        setNewContentOrder('');
        setMessage('');
        setError('');
    };

    const handleCreateContent = async (e: React.FormEvent) => {
        e.preventDefault();
        setContentLoading(true);
        setMessage('');
        setError('');

        if (!currentLessonForContent) {
            setError("No lesson selected to add content.");
            setContentLoading(false);
            return;
        }

        if (!newContentType || !newContentValue) {
            setError("Content type and value are required.");
            setContentLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/signin');
                return;
            }

            const response = await axios.post<{ success: boolean; message?: string; content?: Content }>('/api/admin/createContent', {
                lessonId: currentLessonForContent.id,
                type: newContentType,
                content: newContentValue,
                order: Number(newContentOrder) || 0,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage("Content added successfully!");
                resetForm();
                fetchCourseDetails(); // Refresh course data
            } else {
                setError(response.data.message || "Failed to add content.");
            }
        } catch (err: unknown) {
            console.error("Error creating content:", err);
            if (err instanceof Error && 'response' in err && err.response) {
                const axiosError = err as { response: { data: { msg?: string } } };
                setError(axiosError.response.data.msg || "An unexpected error occurred.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setContentLoading(false);
        }
    };

    const handleEditContentClick = (content: Content, lesson: Lesson) => {
        setIsEditingContent(true);
        setCurrentContentToEdit(content);
        setCurrentLessonForContent(lesson); // Keep track of the parent lesson
        setEditContentType(content.type);
        setEditContentValue(content.content);
        setEditContentOrder(content.order);
        setMessage('');
        setError('');
    };

    const handleUpdateContent = async (e: React.FormEvent) => {
        e.preventDefault();
        setContentLoading(true);
        setMessage('');
        setError('');

        if (!currentContentToEdit || !currentLessonForContent) {
            setError("No content or lesson selected for editing.");
            setContentLoading(false);
            return;
        }

        if (!editContentType || !editContentValue) {
            setError("Content type and value are required.");
            setContentLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/signin');
                return;
            }

            const response = await axios.put<{ success: boolean; message?: string; content?: Content }>('/api/admin/updateContent', {
                contentId: currentContentToEdit.id,
                lessonId: currentLessonForContent.id,
                type: editContentType,
                content: editContentValue,
                order: Number(editContentOrder) || 0,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage("Content updated successfully!");
                resetForm();
                fetchCourseDetails(); // Refresh course data
            } else {
                setError(response.data.message || "Failed to update content.");
            }
        } catch (err: unknown) {
            console.error("Error updating content:", err);
            if (err instanceof Error && 'response' in err && err.response) {
                const axiosError = err as { response: { data: { msg?: string } } };
                setError(axiosError.response.data.msg || "An unexpected error occurred.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setContentLoading(false);
        }
    };

    const handleDeleteContent = async (contentId: number) => {
        if (!confirm("Are you sure you want to delete this content item?")) {
            return;
        }
        setContentLoading(true);
        setMessage('');
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/signin');
                return;
            }

            const response = await axios.delete<{ success: boolean; message?: string }>('/api/admin/deleteContent', {
                headers: { Authorization: `Bearer ${token}` },
                params: { contentId }
            });

            if (response.data.success) {
                setMessage("Content deleted successfully!");
                fetchCourseDetails(); // Refresh course data
            } else {
                setError(response.data.message || "Failed to delete content.");
            }
        } catch (err: unknown) {
            console.error("Error deleting content:", err);
            if (err instanceof Error && 'response' in err && err.response) {
                setError((err.response as any).data.msg || "An unexpected error occurred.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setContentLoading(false);
        }
    };

    const renderLesson = (lesson: Lesson, indentLevel: number) => (
        <div key={lesson.id} className={`flex flex-col bg-white p-4 rounded-lg shadow-sm mb-2 ${indentLevel > 0 ? 'ml-8' : ''}`}>
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">{lesson.title}</h3>
                    {lesson.description && <p className="text-sm text-gray-600">{lesson.description}</p>}
                    {lesson.videoUrl && <p className="text-sm text-blue-500">Video URL: {lesson.videoUrl}</p>}
                    {lesson.thumbnailUrl && <p className="text-sm text-gray-500">Thumbnail URL: {lesson.thumbnailUrl}</p>}
                    {lesson.parentId && <p className="text-sm text-gray-500">Parent ID: {lesson.parentId}</p>}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEditClick(lesson)}
                        className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Content Display for this Lesson */}
            {lesson.content && lesson.content.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Content:</h4>
                    {lesson.content.map(contentItem => (
                        <div key={contentItem.id} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm mb-2">
                            <div>
                                <p className="text-sm font-medium text-gray-800">Type: {contentItem.type}</p>
                                <p className="text-sm text-gray-600">Value: {contentItem.content}</p>
                                <p className="text-sm text-gray-500">Order: {contentItem.order}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditContentClick(contentItem, lesson)}
                                    className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                                >
                                    Edit Content
                                </button>
                                <button
                                    onClick={() => handleDeleteContent(contentItem.id)}
                                    className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                                >
                                    Delete Content
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={() => handleAddContentClick(lesson)}
                className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors duration-200"
            >
                Add Content to this Lesson
            </button>
        </div>
    );

    const renderLessonsRecursive = (lessons: Lesson[], indentLevel: number = 0) => (
        <div className="space-y-2">
            {lessons.map(lesson => (
                <React.Fragment key={lesson.id}>
                    {renderLesson(lesson, indentLevel)}
                    {lesson.sublessons && lesson.sublessons.length > 0 && (
                        <div className="ml-8">
                            {renderLessonsRecursive(lesson.sublessons, indentLevel + 1)}
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
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

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manage Lessons for "{course?.title}"</h1>
                <Link href="/admin/manage-courses" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Manage Courses</Link>

                {/* Add New Lesson Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-medium text-gray-700 mb-4">{isEditing ? 'Edit Lesson' : 'Add New Lesson'}</h2>
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
                                {course && course.lessons.filter(l => l.parentId === null).map(lesson => (
                                    <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                                disabled={lessonLoading}
                            >
                                {isEditing ? 'Update Lesson' : 'Create Lesson'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="w-full bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-200"
                                    disabled={lessonLoading}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Messages */}
                {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

                {/* Existing Lessons List */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-medium text-gray-700 mb-4">Existing Lessons</h2>
                    <div className="space-y-4">
                        {course && course.lessons.length > 0 ? (
                            renderLessonsRecursive(course.lessons.filter(l => l.parentId === null))
                        ) : (
                            <div className="text-gray-500 text-center py-4">No lessons found for this course.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Content Modal */}
            {isAddingContent && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative p-8 bg-white w-full max-w-md mx-auto rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold mb-4">Add Content to {currentLessonForContent?.title}</h3>
                        <form onSubmit={handleCreateContent} className="space-y-4">
                            <div>
                                <label htmlFor="contentType" className="block text-sm font-medium text-gray-700">Content Type</label>
                                <select
                                    id="contentType"
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={newContentType}
                                    onChange={(e) => setNewContentType(e.target.value)}
                                    disabled={contentLoading}
                                >
                                    <option value="">Select Type</option>
                                    <option value="text">Text</option>
                                    <option value="video">Video URL</option>
                                    <option value="image">Image URL</option>
                                    <option value="code">Code</option>
                                    <option value="quiz">Quiz ID</option>
                                    <option value="pdf">PDF URL</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="contentValue" className="block text-sm font-medium text-gray-700">Content Value</label>
                                {newContentType === 'text' || newContentType === 'code' ? (
                                    <textarea
                                        id="contentValue"
                                        rows={5}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={newContentValue}
                                        onChange={(e) => setNewContentValue(e.target.value)}
                                        disabled={contentLoading}
                                    ></textarea>
                                ) : (
                                    <input
                                        type="text"
                                        id="contentValue"
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={newContentValue}
                                        onChange={(e) => setNewContentValue(e.target.value)}
                                        disabled={contentLoading}
                                    />
                                )}
                            </div>
                            <div>
                                <label htmlFor="contentOrder" className="block text-sm font-medium text-gray-700">Order (Optional)</label>
                                <input
                                    type="number"
                                    id="contentOrder"
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={newContentOrder}
                                    onChange={(e) => setNewContentOrder(e.target.value === '' ? '' : Number(e.target.value))}
                                    disabled={contentLoading}
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                                    disabled={contentLoading}
                                >
                                    Add Content
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddingContent(false);
                                        resetForm();
                                    }}
                                    className="w-full bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-200"
                                    disabled={contentLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Content Modal */}
            {isEditingContent && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative p-8 bg-white w-full max-w-md mx-auto rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold mb-4">Edit Content for {currentLessonForContent?.title}</h3>
                        <form onSubmit={handleUpdateContent} className="space-y-4">
                            <div>
                                <label htmlFor="editContentType" className="block text-sm font-medium text-gray-700">Content Type</label>
                                <select
                                    id="editContentType"
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={editContentType}
                                    onChange={(e) => setEditContentType(e.target.value)}
                                    disabled={contentLoading}
                                >
                                    <option value="">Select Type</option>
                                    <option value="text">Text</option>
                                    <option value="video">Video URL</option>
                                    <option value="image">Image URL</option>
                                    <option value="code">Code</option>
                                    <option value="quiz">Quiz ID</option>
                                    <option value="pdf">PDF URL</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="editContentValue" className="block text-sm font-medium text-gray-700">Content Value</label>
                                {editContentType === 'text' || editContentType === 'code' ? (
                                    <textarea
                                        id="editContentValue"
                                        rows={5}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={editContentValue}
                                        onChange={(e) => setEditContentValue(e.target.value)}
                                        disabled={contentLoading}
                                    ></textarea>
                                ) : (
                                    <input
                                        type="text"
                                        id="editContentValue"
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={editContentValue}
                                        onChange={(e) => setEditContentValue(e.target.value)}
                                        disabled={contentLoading}
                                    />
                                )}
                            </div>
                            <div>
                                <label htmlFor="editContentOrder" className="block text-sm font-medium text-gray-700">Order (Optional)</label>
                                <input
                                    type="number"
                                    id="editContentOrder"
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={editContentOrder}
                                    onChange={(e) => setEditContentOrder(e.target.value === '' ? '' : Number(e.target.value))}
                                    disabled={contentLoading}
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                                    disabled={contentLoading}
                                >
                                    Update Content
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditingContent(false);
                                        resetForm();
                                    }}
                                    className="w-full bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-200"
                                    disabled={contentLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 
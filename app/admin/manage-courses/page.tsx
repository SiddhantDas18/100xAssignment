'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    categoryId: number | null;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

export default function ManageCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentCourseToEdit, setCurrentCourseToEdit] = useState<Course | null>(null);
    const [editCourseTitle, setEditCourseTitle] = useState('');
    const [editCourseDescription, setEditCourseDescription] = useState('');
    const [editCoursePrice, setEditCoursePrice] = useState<number | ''>('');
    const [editCourseImageUrl, setEditCourseImageUrl] = useState('');
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        price: '',
        imageUrl: '',
        categoryId: null as number | null,
    });
    const router = useRouter();

    useEffect(() => {
        fetchCourses();
        fetchCategories();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get<{ success: boolean; courses: Course[] }>('/api/getCourse');
            if (response.data.success) {
                setCourses(response.data.courses);
            } else {
                setError(response.data.message || "Failed to fetch courses.");
            }
        } catch (err) {
            console.error("Error fetching courses:", err);
            setError("An unexpected error occurred while fetching courses.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/admin/categories');
            if (response.data.success) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentCourseToEdit(null);
        setEditCourseTitle('');
        setEditCourseDescription('');
        setEditCoursePrice('');
        setEditCourseImageUrl('');
        setMessage('');
        setError('');
    };

    const handleEditClick = (course: Course) => {
        setIsEditing(true);
        setCurrentCourseToEdit(course);
        setEditCourseTitle(course.title);
        setEditCourseDescription(course.description);
        setEditCoursePrice(course.price);
        setEditCourseImageUrl(course.imageUrl || '');
        setEditForm({
            title: course.title,
            description: course.description,
            price: course.price.toString(),
            imageUrl: course.imageUrl || '',
            categoryId: course.categoryId,
        });
        setMessage('');
        setError('');
    };

    const handleUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (!currentCourseToEdit) {
            setError("No course selected for editing.");
            setLoading(false);
            return;
        }

        if (!editCourseTitle || !editCourseDescription || editCoursePrice === '' || !editCourseImageUrl) {
            setError("All fields are required.");
            setLoading(false);
            return;
        }

        if (isNaN(Number(editCoursePrice)) || Number(editCoursePrice) <= 0) {
            setError("Price must be a positive number.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/signin');
                return;
            }

            const response = await axios.put('/api/admin/updateCourse', {
                courseId: currentCourseToEdit.id,
                title: editCourseTitle,
                description: editCourseDescription,
                price: Number(editCoursePrice),
                imageUrl: editCourseImageUrl,
                categoryId: editForm.categoryId,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setMessage(response.data.message || "Course updated successfully!");
                resetForm();
                fetchCourses(); // Refresh course list
            } else {
                setError(response.data.message || "Failed to update course.");
            }
        } catch (err) {
            console.error("Error updating course:", err);
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.msg || "An unexpected error occurred.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (courseId: number) => {
        if (!confirm("Are you sure you want to delete this course? This action cannot be undone and will delete all associated lessons.")) {
            return;
        }
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/signin');
                return;
            }

            const response = await axios.delete('/api/admin/deleteCourse', {
                headers: { Authorization: `Bearer ${token}` },
                data: { courseId }
            });

            if (response.data.success) {
                setMessage("Course deleted successfully!");
                fetchCourses(); // Refresh course list
            } else {
                setError(response.data.message || "Failed to delete course.");
            }
        } catch (err) {
            console.error("Error deleting course:", err);
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.msg || "An unexpected error occurred.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="min-h-screen w-screen bg-gradient-to-b from-[#f7f9fd] to-[#d4ddee] p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Manage Courses</h1>
                
                <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">{isEditing ? 'Edit Course' : 'Create New Course'}</h2>
                    {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

                    <form onSubmit={isEditing ? handleUpdateCourse : ((e) => { e.preventDefault(); router.push('/admin/create-course'); })} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Course Title</label>
                            <input
                                type="text"
                                id="title"
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={isEditing ? editCourseTitle : ''}
                                onChange={(e) => setEditCourseTitle(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="description"
                                rows={4}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={isEditing ? editCourseDescription : ''}
                                onChange={(e) => setEditCourseDescription(e.target.value)}
                                disabled={loading}
                            ></textarea>
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                            <input
                                type="number"
                                id="price"
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={isEditing ? editCoursePrice : ''}
                                onChange={(e) => setEditCoursePrice(e.target.value === '' ? '' : Number(e.target.value))}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Thumbnail)</label>
                            <input
                                type="text"
                                id="imageUrl"
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={isEditing ? editCourseImageUrl : ''}
                                onChange={(e) => setEditCourseImageUrl(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                id="category"
                                value={editForm.categoryId || ''}
                                onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value ? Number(e.target.value) : null })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {isEditing ? 'Update Course' : 'Go to Create Course'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">No courses found.</h2>
                        <p className="text-gray-600 mb-8">Start by creating a new course!</p>
                        <Link
                            href="/admin/create-course"
                            className="inline-block bg-blue-500 text-white px-8 py-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
                        >
                            Create Course
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
                                {course.imageUrl && (
                                    <div className="mb-4">
                                        <Image
                                            src={course.imageUrl}
                                            alt={course.title}
                                            width={400}
                                            height={200}
                                            className="rounded-md object-cover w-full h-48"
                                        />
                                    </div>
                                )}
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h2>
                                <p className="text-gray-600 mb-4">{course.description}</p>
                                <p className="text-gray-700 font-medium">Price: ${course.price}</p>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleEditClick(course)}
                                        className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors text-sm"
                                    >
                                        Edit Course
                                    </button>
                                    <Link
                                        href={`/admin/manage-lessons/${course.id}`}
                                        className="flex-1 text-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
                                    >
                                        Manage Lessons
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteCourse(course.id)}
                                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm"
                                    >
                                        Delete Course
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 
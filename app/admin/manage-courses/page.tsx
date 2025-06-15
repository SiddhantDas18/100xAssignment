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
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [newCourseDescription, setNewCourseDescription] = useState('');
    const [newCoursePrice, setNewCoursePrice] = useState<number | ''>('');
    const [newCourseImageUrl, setNewCourseImageUrl] = useState('');
    const [newCourseCategoryId, setNewCourseCategoryId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchCourses();
        fetchCategories();
    }, []);

        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/signin');
                    return;
                }

            const response = await axios.get<{
                message: string; success: boolean; courses: Course[] 
}>('/api/getCourse', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
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
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/signin');
                return;
            }
            const response = await axios.get('/api/admin/categories', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if ((response.data as { success: boolean; categories: Category[] }).success) {
                setCategories((response.data as { categories: Category[] }).categories);
            } else {
                setError((response.data as { message?: string }).message || "Failed to fetch categories.");
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError("An unexpected error occurred while fetching categories.");
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

            if ((response.data as { success: boolean }).success) {
                setMessage((response.data as { message?: string }).message || "Course updated successfully!");
                resetForm();
                fetchCourses(); // Refresh course list
            } else {
                setError((response.data as { message?: string }).message || "Failed to update course.");
            }
        } catch (err: any) {
            console.error("Error updating course:", err);
            if (err.response) {
                console.error("Response data:", err.response.data);
                console.error("Response status:", err.response.status);
                console.error("Response headers:", err.response.headers);
                setError(err.response.data.msg || "Failed to update course");
            } else if (err.request) {
                console.error("Request data:", err.request);
                setError("Failed to update course. No response from server.");
            } else {
                console.error("Error message:", err.message);
                setError("An unexpected error occurred");
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
                params: { courseId }
            });

            if ((response.data as { success: boolean }).success) {
                setMessage("Course deleted successfully!");
                fetchCourses(); // Refresh course list
            } else {
                setError((response.data as { message?: string }).message || "Failed to delete course.");
            }
        } catch (err: any) {
            console.error("Error deleting course:", err);
            if (err.response) {
                console.error("Response data:", err.response.data);
                console.error("Response status:", err.response.status);
                console.error("Response headers:", err.response.headers);
                setError(err.response.data.msg || "Failed to delete course");
            } else if (err.request) {
                console.error("Request data:", err.request);
                setError("Failed to delete course. No response from server.");
            } else {
                console.error("Error message:", err.message);
                setError("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (!newCourseTitle || !newCourseDescription || newCoursePrice === '' || !newCourseImageUrl || newCourseCategoryId === null) {
            setError("All fields for new course are required.");
            setLoading(false);
            return;
        }

        if (isNaN(Number(newCoursePrice)) || Number(newCoursePrice) <= 0) {
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

            const response = await axios.post('/api/admin/createCourse', {
                title: newCourseTitle,
                description: newCourseDescription,
                price: Number(newCoursePrice),
                imageUrl: newCourseImageUrl,
                categoryId: newCourseCategoryId,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if ((response.data as { success: boolean }).success) {
                setMessage((response.data as { message?: string }).message || "Course created successfully!");
                setNewCourseTitle('');
                setNewCourseDescription('');
                setNewCoursePrice('');
                setNewCourseImageUrl('');
                setNewCourseCategoryId(null);
                fetchCourses(); // Refresh course list
            } else {
                setError((response.data as { message?: string }).message || "Failed to create course.");
            }
        } catch (err) {
            console.error("Error creating course:", err);
            if (err && typeof err === 'object' && 'isAxiosError' in err) {
                setError((err as any).response?.data?.msg || (err as unknown as Error).message || "Failed to create course");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
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
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manage Courses</h1>
                
                {/* Create New Course Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-medium text-gray-700 mb-4">Create New Course</h2>
                    <form className="space-y-4" onSubmit={handleCreateCourse}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter course title"
                                value={newCourseTitle}
                                onChange={(e) => setNewCourseTitle(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                placeholder="Enter course description"
                                value={newCourseDescription}
                                onChange={(e) => setNewCourseDescription(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter price"
                                    value={newCoursePrice}
                                    onChange={(e) => setNewCoursePrice(e.target.value === '' ? '' : Number(e.target.value))}
                                    disabled={loading}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Thumbnail)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter image URL"
                                    value={newCourseImageUrl}
                                    onChange={(e) => setNewCourseImageUrl(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={newCourseCategoryId || ''}
                                onChange={(e) => setNewCourseCategoryId(e.target.value === '' ? null : Number(e.target.value))}
                                disabled={loading}
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                            disabled={loading}
                        >
                            Create Course
                        </button>
                    </form>
                </div>

                {/* Existing Courses List */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-medium text-gray-700 mb-4">Existing Courses</h2>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : error ? (
                            <div className="text-red-500 text-center py-4">{error}</div>
                        ) : courses.length === 0 ? (
                            <div className="text-gray-500 text-center py-4">No courses found</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {courses.map(course => (
                                    <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-800">{course.title}</h3>
                                                <p className="text-gray-600 mt-1">{course.description}</p>
                                                <p className="text-blue-600 font-medium mt-2">${course.price}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={`/admin/manage-lessons/${course.id}`}
                                                    className="px-3 py-1 text-sm text-purple-600 border border-purple-600 rounded hover:bg-purple-50"
                                                >
                                                    Manage Lessons
                                                </Link>
                                                <button
                                                    onClick={() => handleEditClick(course)}
                                                    className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCourse(course.id)}
                                                    className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
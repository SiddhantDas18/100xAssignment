'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { motion } from 'framer-motion';

interface DecodedToken {
    id: number;
    role: string;
    exp: number;
}

interface DashboardStats {
  totalCourses: number;
  totalLessons: number;
  totalUsers: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState<DashboardStats>({
        totalCourses: 0,
        totalLessons: 0,
        totalUsers: 0,
        totalRevenue: 0,
    });

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const decoded = jwt.decode(token) as DecodedToken;
                if (!decoded || !decoded.role || decoded.role.toLowerCase() !== 'admin') {
                    throw new Error('Not authorized');
                }

                setIsAdmin(true);
                await fetchDashboardStats(token);
            } catch (err) {
                console.error('Admin authentication error:', err);
                setError(err instanceof Error ? err.message : 'Authentication failed');
                router.push('/signin');
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [router]);

    const fetchDashboardStats = async (token: string) => {
        try {
            const response = await axios.get('/api/admin/dashboardStats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if ((response.data as { success: boolean }).success) {
                setStats((response.data as { stats: DashboardStats }).stats);
            } else {
                throw new Error((response.data as { message?: string }).message || 'Failed to fetch stats');
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError('Failed to load dashboard data');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <p className="text-red-500 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/signin')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-lg shadow-lg"
                >
                    <h3 className="text-lg font-semibold mb-2">Total Courses</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalCourses}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-lg shadow-lg"
                >
                    <h3 className="text-lg font-semibold mb-2">Total Lessons</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.totalLessons}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-lg shadow-lg"
                >
                    <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-lg shadow-lg"
                >
                    <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-yellow-600">
                        ${stats.totalRevenue.toFixed(2)}
                    </p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                    href="/admin/manage-courses"
                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                    <h3 className="text-xl font-semibold mb-2">Manage Courses</h3>
                    <p className="text-gray-600">Create, edit, and delete courses</p>
                </Link>

                <Link
                    href="/admin/manage-courses"
                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                    <h3 className="text-xl font-semibold mb-2">Manage Lessons</h3>
                    <p className="text-gray-600">Organize and update lessons</p>
                </Link>

                <Link
                    href="/admin/users"
                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                    <h3 className="text-xl font-semibold mb-2">Manage Users</h3>
                    <p className="text-gray-600">View and manage user accounts</p>
                </Link>
            </div>
        </div>
    );
}
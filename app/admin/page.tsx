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
            const token = localStorage.getItem('token');
            console.log("Admin Page - Token found:", !!token); // Log if token exists
            if (!token) {
                router.push('/signin');
                return;
            }

            try {
                const decoded = jwt.decode(token) as DecodedToken;
                console.log("Admin Page - Decoded token:", decoded);
                if (decoded && decoded.role && decoded.role.toLowerCase() === 'admin') {
                    setIsAdmin(true);
                    // Fetch real-time stats only if admin
                    fetchDashboardStats(token);
                } else {
                    console.warn("Admin Page - User not authorized. Decoded role:", decoded?.role);
                    setError("You are not authorized to view this page.");
                    router.push('/dashboard'); // Redirect non-admins
                }
            } catch (err) {
                console.error("Admin Page - Error decoding token:", err);
                setError("Authentication failed. Please log in again.");
                router.push('/signin');
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [router]);

    const fetchDashboardStats = async (token: string) => {
      try {
        const response = await axios.get<{ success: boolean; stats: DashboardStats }>(
          '/api/admin/dashboardStats',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          setStats(response.data.stats);
        } else {
          setError(response.data.message || 'Failed to fetch dashboard stats');
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Error fetching dashboard stats. Please try again.');
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
                        onClick={() => router.push('/signin')}
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        // This case should ideally not be reached due to the redirect above,
        // but as a fallback, show nothing or a specific message.
        return null;
    }

    const statCards = [
        {
            title: 'Total Courses',
            value: stats.totalCourses,
            icon: '📚',
            color: 'bg-blue-500',
        },
        {
            title: 'Total Lessons',
            value: stats.totalLessons,
            icon: '📝',
            color: 'bg-green-500',
        },
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: '👥',
            color: 'bg-purple-500',
        },
        {
            title: 'Total Revenue',
            value: `₹${stats.totalRevenue}`,
            icon: '💰',
            color: 'bg-yellow-500',
        },
    ];

    const quickActions = [
        {
            title: 'Create Course',
            description: 'Add a new course to the platform',
            icon: '➕',
            href: '/admin/create-course',
        },
        {
            title: 'Manage Lessons',
            description: 'Organize course lessons',
            icon: '📄',
            href: '/admin/manage-lessons',
        },
        {
            title: 'Manage Content',
            description: 'Manage various content types (text, video, quiz, etc.)',
            icon: '✒️',
            href: '/admin/content',
        },
        {
            title: 'Categories',
            description: 'Manage course categories',
            icon: '🗂️',
            href: '/admin/categories',
        },
        {
            title: 'Upload Media',
            description: 'Upload and manage images/videos',
            icon: '📤',
            href: '/admin/media',
        },
        {
            title: 'User Management',
            description: 'Manage user accounts',
            icon: '👤',
            href: '/admin/users',
        },
        {
            title: 'Settings',
            description: 'Configure application settings',
            icon: '⚙️',
            href: '/admin/settings',
        },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`${stat.color} rounded-lg p-6 text-white shadow-lg`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">{stat.title}</p>
                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <span className="text-3xl">{stat.icon}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickActions.map((action, index) => (
                        <motion.div
                            key={action.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                        >
                            <Link href={action.href} className="block">
                                <div className="flex items-center space-x-4">
                                    <span className="text-3xl">{action.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{action.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-600">No recent activity to display.</p>
                </div>
            </div>
        </div>
    );
} 
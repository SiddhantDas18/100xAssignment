'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Courses', href: '/admin/manage-courses', icon: '📚' },
  { name: 'Lessons', href: '/admin/manage-lessons', icon: '📝' },
  { name: 'Categories', href: '/admin/categories', icon: '🏷️' },
  { name: 'Media', href: '/admin/media', icon: '🖼️' },
  { name: 'Users', href: '/admin/users', icon: '👥' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50"
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">CMS Admin</h1>
        </div>
        <nav className="mt-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${
                pathname === item.href ? 'bg-gray-100 border-r-4 border-blue-500' : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm p-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiHome, FiBook, FiFileText, FiTag, FiImage, FiUsers, FiSettings, FiMenu } from 'react-icons/fi';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: FiHome },
  { name: 'Home', href: '/', icon: FiHome },
  { name: 'Courses', href: '/admin/manage-courses', icon: FiBook },
  { name: 'Lessons', href: '/admin/manage-lessons', icon: FiFileText },
  { name: 'Categories', href: '/admin/categories', icon: FiTag },
  { name: 'Media', href: '/admin/media', icon: FiImage },
  { name: 'Users', href: '/admin/users', icon: FiUsers },
  { name: 'Settings', href: '/admin/settings', icon: FiSettings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const pathname = usePathname();

  const isSidebarCurrentlyOpen = isHovering;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        initial={{ width: 80 }} // Collapsed width
        animate={{ width: isSidebarCurrentlyOpen ? 256 : 80 }} // Expanded width (256px = w-64)
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full bg-white shadow-lg z-50 overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="p-4 flex items-center">
          <h1 className="text-xl font-semibold text-gray-800"
              style={{ opacity: isSidebarCurrentlyOpen ? 1 : 0, transition: 'opacity 0.3s' }}>
            Admin Panel
          </h1>
        </div>
        <nav className="mt-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${
                  pathname === item.href ? 'bg-gray-100 border-r-4 border-blue-500' : ''
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {isSidebarCurrentlyOpen && (
                  <span className="whitespace-nowrap" style={{ opacity: isSidebarCurrentlyOpen ? 1 : 0, transition: 'opacity 0.3s' }}>
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarCurrentlyOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-end">
          {/* Removed the menu button here */}
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
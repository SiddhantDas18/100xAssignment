'use client';

import { motion } from 'framer-motion';

export default function ContentPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6"
    >
      <h1 className="text-3xl font-bold mb-8">Content Management</h1>
      <p className="text-gray-600">This page will allow you to manage various types of content, such as text, videos, and quizzes.</p>
      {/* TODO: Add content management components here */}
    </motion.div>
  );
} 
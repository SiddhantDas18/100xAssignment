'use client';

import { motion } from 'framer-motion';

export default function MediaPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6"
    >
      <h1 className="text-3xl font-bold mb-8">Media Management</h1>
      <p className="text-gray-600">This page will allow you to upload and manage images, videos, and other media assets.</p>
      {/* TODO: Add media management components here */}
    </motion.div>
  );
} 
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2Icon } from 'lucide-react';
export const LoadingScreen: React.FC = () => {
  return <div className="fixed inset-0 flex items-center justify-center bg-white">
      <motion.div initial={{
      opacity: 0,
      scale: 0.8
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.3
    }} className="flex flex-col items-center">
        <Loader2Icon className="h-12 w-12 text-blue-600 animate-spin" />
        <motion.p initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.3
      }} className="mt-4 text-lg font-medium text-gray-700">
          Loading...
        </motion.p>
      </motion.div>
    </div>;
};
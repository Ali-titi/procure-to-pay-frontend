import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
interface DashboardLayoutProps {
  children: React.ReactNode;
}
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar isMobile={false} />
      {/* Mobile Sidebar - shown/hidden based on state */}
      <AnimatePresence>
        {isSidebarOpen && <>
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 0.5
        }} exit={{
          opacity: 0
        }} transition={{
          duration: 0.2
        }} className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={toggleSidebar} />
            <Sidebar isMobile={true} toggleMobileSidebar={toggleSidebar} />
          </>}
      </AnimatePresence>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>;
};
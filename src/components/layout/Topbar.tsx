import React from 'react';
import { motion } from 'framer-motion';
import { MenuIcon, BellIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
interface TopbarProps {
  toggleSidebar: () => void;
}
export const Topbar: React.FC<TopbarProps> = ({
  toggleSidebar
}) => {
  const {
    user,
    userRole
  } = useAuth();
  const roleLabels = {
    staff: 'Staff',
    approver: 'Approver',
    approver_1: 'Approver Level 1',
    approver_2: 'Approver Level 2',
    finance: 'Finance'
  };
  return <motion.header initial={{
    y: -20,
    opacity: 0
  }} animate={{
    y: 0,
    opacity: 1
  }} transition={{
    duration: 0.3
  }} className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100">
            <MenuIcon className="h-6 w-6" />
          </button>
          <div className="ml-4 md:ml-0">
            <h1 className="text-lg font-semibold text-gray-900">
              {userRole && roleLabels[userRole]} Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Welcome back, {user?.name || 'User'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative">
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-blue-600" />
            </div>
            <span className="hidden md:inline-block text-sm font-medium">
              {user?.name || 'User'}
            </span>
          </div>
        </div>
      </div>
    </motion.header>;
};
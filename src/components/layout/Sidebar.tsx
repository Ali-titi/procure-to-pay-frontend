import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon, FileTextIcon, CheckSquareIcon, FileIcon, DollarSignIcon, UserIcon, LogOutIcon, ChevronLeftIcon, ChevronRightIcon, MenuIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
interface SidebarProps {
  isMobile: boolean;
  toggleMobileSidebar?: () => void;
}
export const Sidebar: React.FC<SidebarProps> = ({
  isMobile,
  toggleMobileSidebar
}) => {
  const {
    userRole,
    logout
  } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  // Define navigation items based on user role
  const navigationItems = {
    staff: [{
      name: 'Dashboard',
      path: '/dashboard/staff',
      icon: <HomeIcon className="h-5 w-5" />
    }, {
      name: 'My Requests',
      path: '/dashboard/staff/requests',
      icon: <FileTextIcon className="h-5 w-5" />
    }],
    approver1: [{
      name: 'Dashboard',
      path: '/dashboard/approver',
      icon: <HomeIcon className="h-5 w-5" />
    }, {
      name: 'My Approvals',
      path: '/dashboard/approver/approvals',
      icon: <CheckSquareIcon className="h-5 w-5" />
    }],
    approver2: [{
      name: 'Dashboard',
      path: '/dashboard/approver',
      icon: <HomeIcon className="h-5 w-5" />
    }, {
      name: 'My Approvals',
      path: '/dashboard/approver/approvals',
      icon: <CheckSquareIcon className="h-5 w-5" />
    }],
    finance: [{
      name: 'Dashboard',
      path: '/dashboard/finance',
      icon: <HomeIcon className="h-5 w-5" />
    }, {
      name: 'Approved Requests',
      path: '/dashboard/finance/approved',
      icon: <FileTextIcon className="h-5 w-5" />
    }, {
      name: 'Purchase Orders',
      path: '/dashboard/finance/po',
      icon: <FileIcon className="h-5 w-5" />
    }, {
      name: 'Finance Documents',
      path: '/dashboard/finance/documents',
      icon: <DollarSignIcon className="h-5 w-5" />
    }],
    admin: [{
      name: 'Dashboard',
      path: '/dashboard/staff',
      icon: <HomeIcon className="h-5 w-5" />
    }, {
      name: 'All Requests',
      path: '/dashboard/staff/requests',
      icon: <FileTextIcon className="h-5 w-5" />
    }]
  };
  // Select navigation items based on user role
  const navItems = userRole ? navigationItems[userRole] : [];
  // Common items for all roles
  const commonItems = [{
    name: 'Profile',
    path: '/profile',
    icon: <UserIcon className="h-5 w-5" />
  }];
  const sidebarVariants = {
    expanded: {
      width: '240px'
    },
    collapsed: {
      width: '72px'
    }
  };
  const sidebarContent = <>
      <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center mb-6 px-4 py-2`}>
        {!isCollapsed && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="text-lg font-bold text-blue-600">
            ProcurePay
          </motion.div>}
        {!isMobile && <button onClick={toggleCollapse} className="p-1 rounded-md hover:bg-gray-100 text-gray-500">
            {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
          </button>}
        {isMobile && <button onClick={toggleMobileSidebar} className="p-1 rounded-md hover:bg-gray-100 text-gray-500">
            <MenuIcon className="h-5 w-5" />
          </button>}
      </div>
      <div className="space-y-1 px-3">
        {navItems.map(item => {
        const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
        return <Link key={item.path} to={item.path} className={`sidebar-link ${isActive ? 'active' : ''}`} onClick={isMobile ? toggleMobileSidebar : undefined}>
              {item.icon}
              <AnimatePresence>
                {!isCollapsed && <motion.span initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }}>
                    {item.name}
                  </motion.span>}
              </AnimatePresence>
            </Link>;
      })}
        <div className="border-t border-gray-100 my-4"></div>
        {commonItems.map(item => {
        const isActive = location.pathname === item.path;
        return <Link key={item.path} to={item.path} className={`sidebar-link ${isActive ? 'active' : ''}`} onClick={isMobile ? toggleMobileSidebar : undefined}>
              {item.icon}
              <AnimatePresence>
                {!isCollapsed && <motion.span initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }}>
                    {item.name}
                  </motion.span>}
              </AnimatePresence>
            </Link>;
      })}
        <button onClick={logout} className="sidebar-link text-red-600 hover:bg-red-50 w-full text-left">
          <LogOutIcon className="h-5 w-5" />
          <AnimatePresence>
            {!isCollapsed && <motion.span initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} exit={{
            opacity: 0
          }}>
                Logout
              </motion.span>}
          </AnimatePresence>
        </button>
      </div>
    </>;
  if (isMobile) {
    return <motion.div initial={{
      x: -240
    }} animate={{
      x: 0
    }} exit={{
      x: -240
    }} transition={{
      duration: 0.3
    }} className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg flex flex-col">
        {sidebarContent}
      </motion.div>;
  }
  return <motion.div variants={sidebarVariants} initial={false} animate={isCollapsed ? 'collapsed' : 'expanded'} transition={{
    duration: 0.3
  }} className="hidden md:flex h-screen bg-white border-r border-gray-100 flex-col sticky top-0 overflow-y-auto">
      {sidebarContent}
    </motion.div>;
};
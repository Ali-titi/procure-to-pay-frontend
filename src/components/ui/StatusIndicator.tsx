import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from 'lucide-react';
interface StatusIndicatorProps {
  status: 'pending_l1' | 'rejected_l1' | 'pending_l2' | 'rejected_l2' | 'approved' | 'ordered' | 'delivered' | 'completed';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showText = true,
  className = ''
}) => {
  const statusConfig = {
    pending_l1: {
      icon: <ClockIcon />,
      text: 'Pending L1',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    rejected_l1: {
      icon: <XCircleIcon />,
      text: 'Rejected L1',
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    },
    pending_l2: {
      icon: <ClockIcon />,
      text: 'Pending L2',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    rejected_l2: {
      icon: <XCircleIcon />,
      text: 'Rejected L2',
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    },
    approved: {
      icon: <CheckCircleIcon />,
      text: 'Approved',
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    ordered: {
      icon: <CheckCircleIcon />,
      text: 'Ordered',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    delivered: {
      icon: <CheckCircleIcon />,
      text: 'Delivered',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    completed: {
      icon: <CheckCircleIcon />,
      text: 'Completed',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  };
  const sizeConfig = {
    sm: {
      iconSize: 'h-4 w-4',
      padding: 'p-1',
      text: 'text-xs'
    },
    md: {
      iconSize: 'h-5 w-5',
      padding: 'p-1.5',
      text: 'text-sm'
    },
    lg: {
      iconSize: 'h-6 w-6',
      padding: 'p-2',
      text: 'text-base'
    }
  };
  const {
    icon,
    text,
    color,
    bgColor
  } = statusConfig[status];
  const {
    iconSize,
    padding,
    text: textSize
  } = sizeConfig[size];
  return <motion.div initial={{
    opacity: 0,
    scale: 0.9
  }} animate={{
    opacity: 1,
    scale: 1
  }} transition={{
    duration: 0.2
  }} className={`flex items-center gap-2 ${className}`}>
      <div className={`${padding} rounded-full ${bgColor}`}>
        <div className={`${iconSize} ${color}`}>{icon}</div>
      </div>
      {showText && <span className={`font-medium ${textSize} ${color}`}>{text}</span>}
    </motion.div>;
};
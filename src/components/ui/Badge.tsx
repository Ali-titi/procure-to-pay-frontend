import React from 'react';
import { motion } from 'framer-motion';
interface BadgeProps {
  status: 'pending_l1' | 'rejected_l1' | 'pending_l2' | 'rejected_l2' | 'approved' | 'ordered' | 'delivered' | 'completed';
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
export const Badge: React.FC<BadgeProps> = ({
  status,
  animated = false,
  size = 'md',
  className = ''
}) => {
  const statusClasses = {
    pending_l1: 'badge-warning',
    rejected_l1: 'badge-danger',
    pending_l2: 'badge-warning',
    rejected_l2: 'badge-danger',
    approved: 'badge-success',
    ordered: 'badge-info',
    delivered: 'badge-info',
    completed: 'badge-success'
  };
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1.5'
  };
  const statusText = {
    pending_l1: 'Pending L1',
    rejected_l1: 'Rejected L1',
    pending_l2: 'Pending L2',
    rejected_l2: 'Rejected L2',
    approved: 'Approved',
    ordered: 'Ordered',
    delivered: 'Delivered',
    completed: 'Completed'
  };
  const badge = <span className={`badge ${statusClasses[status]} ${sizeClasses[size]} ${className}`}>
      {statusText[status]}
    </span>;
  if (animated) {
    return <motion.div initial={{
      scale: 0.8,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} transition={{
      duration: 0.2
    }}>
        {badge}
      </motion.div>;
  }
  return badge;
};
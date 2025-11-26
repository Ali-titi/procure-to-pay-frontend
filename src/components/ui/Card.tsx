import React from 'react';
import { motion } from 'framer-motion';
interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
  animated?: boolean;
}
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  animated = false
}) => {
  const cardContent = <div className={`card ${className}`}>
      {(title || subtitle) && <div className="mb-4">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>}
      {children}
      {footer && <div className="mt-4 pt-3 border-t border-gray-100">{footer}</div>}
    </div>;
  if (animated) {
    return <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.3
    }}>
        {cardContent}
      </motion.div>;
  }
  return cardContent;
};
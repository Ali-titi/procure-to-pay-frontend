import React from 'react';
interface SkeletonProps {
  height?: string;
  width?: string;
  className?: string;
  circle?: boolean;
  count?: number;
}
export const Skeleton: React.FC<SkeletonProps> = ({
  height = '20px',
  width = '100%',
  className = '',
  circle = false,
  count = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  const shapeClass = circle ? 'rounded-full' : 'rounded';
  return <>
      {Array(count).fill(0).map((_, index) => <div key={index} className={`${baseClasses} ${shapeClass} ${className}`} style={{
      height,
      width,
      marginBottom: index < count - 1 ? '0.5rem' : '0'
    }} />)}
    </>;
};
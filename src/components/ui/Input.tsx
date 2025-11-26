import React, { forwardRef } from 'react';
import { AlertCircleIcon } from 'lucide-react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  fullWidth = true,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'border-red-500 focus:ring-red-500' : '';
  const iconClass = leftIcon || rightIcon ? 'pl-10' : '';
  return <div className={`mb-4 ${widthClass}`}>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>}
        <div className="relative">
          {leftIcon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>}
          <input ref={ref} className={`input ${errorClass} ${iconClass} ${className}`} {...props} />
          {rightIcon && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>}
        </div>
        {error && <div className="mt-1 flex items-center text-sm text-red-600">
            <AlertCircleIcon className="h-4 w-4 mr-1" />
            {error}
          </div>}
      </div>;
});
Input.displayName = 'Input';
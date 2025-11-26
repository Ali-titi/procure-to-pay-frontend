import React, { forwardRef } from 'react';
import { AlertCircleIcon } from 'lucide-react';
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  const errorClass = error ? 'border-red-500 focus:ring-red-500' : '';
  return <div className="mb-4 w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>}
        <textarea ref={ref} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errorClass} ${className}`} {...props} />
        {error && <div className="mt-1 flex items-center text-sm text-red-600">
            <AlertCircleIcon className="h-4 w-4 mr-1" />
            {error}
          </div>}
      </div>;
});
Textarea.displayName = 'Textarea';
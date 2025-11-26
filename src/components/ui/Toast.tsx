import React from 'react';
import { toast, ToastOptions } from 'react-toastify';
import { CheckCircleIcon, AlertCircleIcon, InfoIcon } from 'lucide-react';
type ToastType = 'success' | 'error' | 'info' | 'warning';
interface ShowToastOptions extends ToastOptions {
  title?: string;
}
export const showToast = (message: string, type: ToastType = 'info', options?: ShowToastOptions) => {
  const {
    title,
    ...restOptions
  } = options || {};
  const icons = {
    success: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    error: <AlertCircleIcon className="h-5 w-5 text-red-500" />,
    info: <InfoIcon className="h-5 w-5 text-blue-500" />,
    warning: <AlertCircleIcon className="h-5 w-5 text-yellow-500" />
  };
  const content = <div className="flex">
      <div className="flex-shrink-0 mr-3">{icons[type]}</div>
      <div>
        {title && <p className="font-medium">{title}</p>}
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>;
  return toast[type](content, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...restOptions
  });
};
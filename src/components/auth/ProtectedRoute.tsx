import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '../ui/LoadingScreen';
interface ProtectedRouteProps {
  allowedRoles: string[];
}
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles
}) => {
  const {
    isAuthenticated,
    userRole,
    isLoading
  } = useAuth();
  if (isLoading) {
    return <LoadingScreen />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (userRole && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'staff') {
      return <Navigate to="/dashboard/staff" />;
    } else if (userRole === 'approver_1' || userRole === 'approver_2') {
      return <Navigate to="/dashboard/approver" />;
    } else if (userRole === 'finance') {
      return <Navigate to="/dashboard/finance" />;
    }
  }
  return <Outlet />;
};
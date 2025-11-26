import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffRequests } from './pages/staff/StaffRequests';
import { RequestDetails } from './pages/staff/RequestDetails';
import { EditRequestForm } from './pages/staff/EditRequestForm';
import { ApproverDashboard } from './pages/approver/ApproverDashboard';
import { ApproverRequestDetails } from './pages/approver/ApproverRequestDetails';
import { ApproverApprovals } from './pages/approver/ApproverApprovals';
import { FinanceDashboard } from './pages/finance/FinanceDashboard';
import { FinanceApproved } from './pages/finance/FinanceApproved';
import { FinancePurchaseOrders } from './pages/finance/FinancePurchaseOrders';
import { FinanceDocuments } from './pages/finance/FinanceDocuments';
import { FinanceRequestDetails } from './pages/finance/FinanceRequestDetails';
import { PurchaseOrderDetails } from './pages/finance/PurchaseOrderDetails';
import { Profile } from './pages/profile/Profile';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
export function AppRouter() {
  const {
    isAuthenticated,
    userRole
  } = useAuth();
  return <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Protected Routes - Profile accessible to all authenticated users */}
        <Route element={<ProtectedRoute allowedRoles={['staff', 'approver1', 'approver2', 'finance', 'admin']} />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
        {/* Staff Routes */}
        <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
          <Route path="/dashboard/staff" element={<StaffDashboard />} />
          <Route path="/dashboard/staff/requests" element={<StaffRequests />} />
          <Route path="/dashboard/staff/requests/:id" element={<RequestDetails />} />
          <Route path="/dashboard/staff/requests/:id/edit" element={<EditRequestForm />} />
        </Route>
        {/* Approver Routes */}
        <Route element={<ProtectedRoute allowedRoles={['approver1', 'approver2', 'admin']} />}>
          <Route path="/dashboard/approver" element={<ApproverDashboard />} />
          <Route path="/dashboard/approver/approvals" element={<ApproverApprovals />} />
          <Route path="/dashboard/approver/requests/:id" element={<ApproverRequestDetails />} />
        </Route>
        {/* Finance Routes */}
        <Route element={<ProtectedRoute allowedRoles={['finance', 'admin']} />}>
          <Route path="/dashboard/finance" element={<FinanceDashboard />} />
          <Route path="/dashboard/finance/approved" element={<FinanceApproved />} />
          <Route path="/dashboard/finance/po" element={<FinancePurchaseOrders />} />
          <Route path="/dashboard/finance/documents" element={<FinanceDocuments />} />
          <Route path="/dashboard/finance/requests/:id" element={<FinanceRequestDetails />} />
          <Route path="/dashboard/finance/po/:id" element={<PurchaseOrderDetails />} />
        </Route>
        {/* Default Routes */}
        <Route path="/" element={isAuthenticated ? userRole === 'staff' || userRole === 'admin' ? <Navigate to="/dashboard/staff" /> : (userRole === 'approver1' || userRole === 'approver2') ? <Navigate to="/dashboard/approver" /> : userRole === 'finance' ? <Navigate to="/dashboard/finance" /> : <Navigate to="/register" /> : <Navigate to="/register" />} />
        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>;
}
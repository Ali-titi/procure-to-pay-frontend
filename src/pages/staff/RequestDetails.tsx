import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, EditIcon, TrashIcon, FileTextIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { ApprovalTimeline } from '../../components/ui/ApprovalTimeline';
import { Modal } from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';
interface RequestDetail {
  id: number;
  title: string;
  description: string;
  amount: string; // API returns as string from DecimalField
  quantity: number;
  department: string;
  vendor_name: string;
  category: string;
  urgency: string;
  status: 'pending_l1' | 'rejected_l1' | 'pending_l2' | 'rejected_l2' | 'approved' | 'ordered' | 'delivered' | 'completed';
  created_by: number;
  created_by_name: string;
  proforma_file?: string;
  created_at: string;
  updated_at: string;
  approvals: {
    id: number;
    approver: number;
    approver_name: string;
    approver_role: string;
    level: number;
    status: 'approved' | 'rejected';
    comment: string;
    date: string;
  }[];
}

// Helper functions for status display
const getStatusDisplayName = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending_l1': 'Pending Level 1 Approval',
    'rejected_l1': 'Rejected by Level 1',
    'pending_l2': 'Pending Level 2 Approval',
    'rejected_l2': 'Rejected by Level 2',
    'approved': 'Approved',
    'ordered': 'Order Placed',
    'delivered': 'Delivered',
    'completed': 'Completed'
  };
  return statusMap[status] || status;
};

const getStatusDescription = (status: string): string => {
  const descriptionMap: Record<string, string> = {
    'pending_l1': 'Your request is waiting for Level 1 approver review.',
    'rejected_l1': 'Your request was rejected by the Level 1 approver.',
    'pending_l2': 'Your request passed Level 1 and is now waiting for Level 2 approval.',
    'rejected_l2': 'Your request was rejected by the Level 2 approver.',
    'approved': 'Your request has been approved and is ready for ordering.',
    'ordered': 'Purchase order has been placed with the vendor.',
    'delivered': 'Items have been delivered and are being validated.',
    'completed': 'Request is fully completed and closed.'
  };
  return descriptionMap[status] || 'Status description not available.';
};

const getStatusProgress = (status: string): number => {
  const progressMap: Record<string, number> = {
    'pending_l1': 20,
    'rejected_l1': 20,
    'pending_l2': 50,
    'rejected_l2': 50,
    'approved': 75,
    'ordered': 85,
    'delivered': 95,
    'completed': 100
  };
  return progressMap[status] || 0;
};

const getStatusColor = (status: string): string => {
  if (status.includes('rejected')) return 'bg-red-500';
  if (status.includes('pending')) return 'bg-yellow-500';
  if (status === 'approved' || status === 'completed') return 'bg-green-500';
  return 'bg-blue-500';
};

export const RequestDetails: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchRequestDetails = async () => {
    if (!id) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/requests/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch request details');
      }
      const data = await response.json();
      console.log('Fetched request details:', data);
      setRequest(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching request details:', error);
      showToast('Failed to load request details', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const handleRefresh = async () => {
    if (!id) return;
    setIsRefreshing(true);
    await fetchRequestDetails();
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/dashboard/staff/requests/${id}/edit`);
    }
  };
  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!id) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/requests/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete request');
      }

      showToast('Request deleted successfully', 'success');
      navigate('/dashboard/staff/requests');
    } catch (error) {
      console.error('Error deleting request:', error);
      showToast('Failed to delete request', 'error');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };
  if (isLoading) {
    return <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeftIcon className="h-4 w-4" />} onClick={() => navigate('/dashboard/staff/requests')}>
              Back
            </Button>
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="animate-pulse p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </Card>
            </div>
            <div>
              <Card className="animate-pulse p-6">
                <div className="space-y-4">
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>;
  }
  if (!request) {
    return <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700">
            Request not found
          </h2>
          <p className="mt-2 text-gray-500">
            The request you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/dashboard/staff/requests')}>
            Back to Requests
          </Button>
        </div>
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeftIcon className="h-4 w-4" />} onClick={() => navigate('/dashboard/staff/requests')}>
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Request #{request.id}
              </h1>
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            {request.status === 'pending_l1' && <>
                <Button variant="outline" size="sm" leftIcon={<EditIcon className="h-4 w-4" />} onClick={handleEdit}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" leftIcon={<TrashIcon className="h-4 w-4" />} className="text-red-600 hover:bg-red-50" onClick={handleDelete}>
                  Delete
                </Button>
              </>}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }} className="lg:col-span-2 space-y-6">
            <Card>
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {request.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Created on{' '}
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusIndicator status={request.status} size="lg" />
                  </div>
                </div>

                {/* Request Summary */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Request Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">Amount:</span>
                      <div className="text-blue-900 font-semibold">${parseFloat(request.amount).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Vendor:</span>
                      <div className="text-blue-900">{request.vendor_name || 'Not specified'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Category:</span>
                      <div className="text-blue-900">{request.category || 'Not specified'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Urgency:</span>
                      <div className="text-blue-900">{request.urgency || 'Not specified'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Quantity:</span>
                      <div className="text-blue-900">{request.quantity || 'Not specified'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Department:</span>
                      <div className="text-blue-900">{request.department || 'Not specified'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Created:</span>
                      <div className="text-blue-900">{new Date(request.created_at).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Last Updated:</span>
                      <div className="text-blue-900">{new Date(request.updated_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Status Description */}
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Current Status: {getStatusDisplayName(request.status)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {getStatusDescription(request.status)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {getStatusProgress(request.status)}%
                      </div>
                      <div className="text-xs text-gray-500">Complete</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(request.status)}`}
                        style={{ width: `${getStatusProgress(request.status)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Submitted</span>
                      <span>L1 Review</span>
                      <span>L2 Review</span>
                      <span>Approved</span>
                      <span>Completed</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Description
                  </h3>
                  <p className="mt-1 text-gray-700">{request.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Amount
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      ${parseFloat(request.amount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Vendor
                    </h3>
                    <p className="mt-1 text-gray-700">{request.vendor_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Category
                    </h3>
                    <p className="mt-1 text-gray-700">{request.category || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Urgency
                    </h3>
                    <p className="mt-1 text-gray-700">{request.urgency || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Quantity
                    </h3>
                    <p className="mt-1 text-gray-700">{request.quantity || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Department
                    </h3>
                    <p className="mt-1 text-gray-700">{request.department || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </Card>
            <Card title="Attached Documents">
              <div className="space-y-4">
                {request.proforma_file && <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      <FileTextIcon className="h-6 w-6 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Proforma Invoice
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded on{' '}
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" leftIcon={<DownloadIcon className="h-4 w-4" />} onClick={() => window.open(`http://localhost:8000${request.proforma_file}`, '_blank')}>
                      View
                    </Button>
                  </div>}
              </div>
            </Card>
          </motion.div>
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.2
        }}>
            <Card title="Approval Status">
              <ApprovalTimeline items={request.approvals.map(approval => ({
                id: approval.id.toString(),
                status: approval.status,
                approver: approval.approver_name,
                role: `Level ${approval.level} Approver`,
                date: new Date(approval.date).toLocaleDateString(),
                comments: approval.comment
              }))} />
            </Card>

            {/* Status History */}
            <Card title="Status History">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Request Submitted</p>
                    <p className="text-xs text-gray-500">{new Date(request.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {request.approvals.map((approval, index) => (
                  <div key={approval.id} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      approval.status === 'approved' ? 'bg-green-500' :
                      approval.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Level {approval.level} {approval.status === 'approved' ? 'Approved' : 'Rejected'} by {approval.approver_name}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(approval.date).toLocaleString()}</p>
                      {approval.comment && (
                        <p className="text-xs text-gray-600 mt-1 italic">"{approval.comment}"</p>
                      )}
                    </div>
                  </div>
                ))}

                {request.status === 'approved' && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Request Approved - Ready for Ordering</p>
                      <p className="text-xs text-gray-500">Ready for finance processing</p>
                    </div>
                  </div>
                )}

                {(request.status === 'ordered' || request.status === 'delivered' || request.status === 'completed') && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Order Placed</p>
                      <p className="text-xs text-gray-500">Purchase order sent to vendor</p>
                    </div>
                  </div>
                )}

                {request.status === 'completed' && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Request Completed</p>
                      <p className="text-xs text-gray-500">All processes finished successfully</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Request" size="sm" footer={<>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>}>
        <p className="text-gray-700">
          Are you sure you want to delete this request? This action cannot be
          undone.
        </p>
      </Modal>
    </DashboardLayout>;
};
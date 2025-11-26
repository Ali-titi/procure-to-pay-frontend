import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, CheckIcon, XIcon, FileTextIcon, DownloadIcon, MessageSquareIcon } from 'lucide-react';
import { useApiBaseUrl } from '../../hooks/useApiBaseUrl';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { ApprovalTimeline } from '../../components/ui/ApprovalTimeline';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
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
  created_at: string;
  updated_at: string;
  proforma_file?: string;
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
export const ApproverRequestDetails: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const baseUrl = useApiBaseUrl();
  const [isLoading, setIsLoading] = useState(true);
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/api/requests/${id}/`, {
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
      } catch (error) {
        console.error('Error fetching request details:', error);
        showToast('Failed to load request details', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id]);
  const handleApprove = () => {
    setIsApproveModalOpen(true);
  };
  const handleReject = () => {
    setIsRejectModalOpen(true);
  };
  const confirmApprove = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/requests/${id}/approve/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: comments })
      });

      if (!response.ok) {
        throw new Error('Failed to approve request');
      }

      showToast('Request approved successfully', 'success');
      navigate('/dashboard/approver');
    } catch (error) {
      console.error('Error approving request:', error);
      showToast('Failed to approve request', 'error');
    } finally {
      setIsSubmitting(false);
      setIsApproveModalOpen(false);
    }
  };
  const confirmReject = async () => {
    if (!comments.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/requests/${id}/reject/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: comments })
      });

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      showToast('Request rejected', 'success');
      navigate('/dashboard/approver');
    } catch (error) {
      console.error('Error rejecting request:', error);
      showToast('Failed to reject request', 'error');
    } finally {
      setIsSubmitting(false);
      setIsRejectModalOpen(false);
    }
  };
  if (isLoading) {
    return <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeftIcon className="h-4 w-4" />} onClick={() => navigate('/dashboard/approver')}>
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
          <Button variant="primary" className="mt-4" onClick={() => navigate('/dashboard/approver')}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeftIcon className="h-4 w-4" />} onClick={() => navigate('/dashboard/approver')}>
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Request #{request.id}
            </h1>
          </div>
          {(request.status === 'pending_l1' || request.status === 'pending_l2') && <div className="flex items-center gap-2">
              <Button variant="success" leftIcon={<CheckIcon className="h-4 w-4" />} onClick={handleApprove}>
                Approve
              </Button>
              <Button variant="danger" leftIcon={<XIcon className="h-4 w-4" />} onClick={handleReject}>
                Reject
              </Button>
            </div>}
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
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {request.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Requested by {request.created_by_name} on{' '}
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusIndicator status={request.status} size="lg" />
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
                      Quantity
                    </h3>
                    <p className="mt-1 text-gray-700">{request.quantity || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Vendor
                    </h3>
                    <p className="mt-1 text-gray-700">{request.vendor_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Department
                    </h3>
                    <p className="mt-1 text-gray-700">{request.department || 'Not specified'}</p>
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
                    <Button variant="outline" size="sm" leftIcon={<DownloadIcon className="h-4 w-4" />} onClick={() => window.open(`${baseUrl}${request.proforma_file}`, '_blank')}>
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
            <Card title="Approval Workflow">
              <ApprovalTimeline items={request.approvals.map(approval => ({
                id: approval.id.toString(),
                status: approval.status,
                approver: approval.approver_name,
                role: approval.approver_role,
                date: new Date(approval.date).toLocaleDateString(),
                comments: approval.comment
              }))} />
            </Card>
          </motion.div>
        </div>
      </div>
      <Modal isOpen={isApproveModalOpen} onClose={() => setIsApproveModalOpen(false)} title="Approve Request" size="md" footer={<>
            <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={confirmApprove} isLoading={isSubmitting}>
              Confirm Approval
            </Button>
          </>}>
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to approve this purchase request for $
            {parseFloat(request.amount).toFixed(2)}?
          </p>
          <Textarea label="Comments (Optional)" placeholder="Add any comments or notes..." value={comments} onChange={e => setComments(e.target.value)} rows={3} />
        </div>
      </Modal>
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Reject Request" size="md" footer={<>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmReject} isLoading={isSubmitting}>
              Confirm Rejection
            </Button>
          </>}>
        <div className="space-y-4">
          <p className="text-gray-700">
            Please provide a reason for rejecting this purchase request.
          </p>
          <Textarea label="Rejection Reason *" placeholder="Explain why this request is being rejected..." value={comments} onChange={e => setComments(e.target.value)} rows={4} error={!comments.trim() ? 'Reason is required' : undefined} />
        </div>
      </Modal>
    </DashboardLayout>;
};
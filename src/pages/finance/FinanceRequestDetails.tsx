import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, FileTextIcon, DownloadIcon, FileIcon, CheckCircleIcon } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { ApprovalTimeline } from '../../components/ui/ApprovalTimeline';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
interface RequestDetail {
  id: number;
  title: string;
  description: string;
  amount: number;
  vendorName: string;
  category: string;
  urgency: string;
  status: 'approved' | 'processed';
  requestor: string;
  createdAt: string;
  updatedAt: string;
  proformaUrl?: string;
  receiptUrl?: string;
  poNumber?: string;
  approvalHistory: {
    id: string;
    status: 'approved' | 'rejected' | 'pending';
    approver: string;
    role: string;
    date?: string;
    comments?: string;
  }[];
}
export const FinanceRequestDetails: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [isGeneratePOModalOpen, setIsGeneratePOModalOpen] = useState(false);
  const [poNumber, setPONumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockRequest: RequestDetail = {
          id: Number(id),
          title: 'IT Equipment for New Hires',
          description: 'Purchase of laptops, monitors, and accessories for 5 new developers joining the team next month.',
          amount: 8750.0,
          vendorName: 'TechSupply Co.',
          category: 'Hardware',
          urgency: 'High',
          status: Math.random() > 0.5 ? 'approved' : 'processed',
          requestor: 'Sarah Johnson',
          createdAt: '2023-05-10T14:30:00Z',
          updatedAt: '2023-05-15T10:20:00Z',
          proformaUrl: 'https://example.com/proforma.pdf',
          receiptUrl: Math.random() > 0.5 ? 'https://example.com/receipt.pdf' : undefined,
          poNumber: Math.random() > 0.5 ? `PO-2023-${1000 + Number(id)}` : undefined,
          approvalHistory: [{
            id: '1',
            status: 'approved',
            approver: 'Jane Smith',
            role: 'Level 1 Approver',
            date: '2023-05-11',
            comments: 'Approved - necessary for onboarding'
          }, {
            id: '2',
            status: 'approved',
            approver: 'Mike Johnson',
            role: 'Level 2 Approver',
            date: '2023-05-12',
            comments: 'Budget approved'
          }]
        };
        setRequest(mockRequest);
        setPONumber(`PO-2023-${1000 + Number(id)}`);
      } catch (error) {
        console.error('Error fetching request details:', error);
        showToast('Failed to load request details', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);
  const handleGeneratePO = () => {
    setIsGeneratePOModalOpen(true);
  };
  const confirmGeneratePO = async () => {
    try {
      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (request) {
        setRequest({
          ...request,
          poNumber: poNumber,
          status: 'processed'
        });
      }
      showToast('Purchase Order generated successfully', 'success');
      setIsGeneratePOModalOpen(false);
      // Navigate to PO details
      navigate(`/dashboard/finance/po/${id}`);
    } catch (error) {
      console.error('Error generating PO:', error);
      showToast('Failed to generate Purchase Order', 'error');
    } finally {
      setIsGenerating(false);
    }
  };
  if (isLoading) {
    return <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeftIcon className="h-4 w-4" />} onClick={() => navigate('/dashboard/finance')}>
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
          <Button variant="primary" className="mt-4" onClick={() => navigate('/dashboard/finance')}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeftIcon className="h-4 w-4" />} onClick={() => navigate('/dashboard/finance')}>
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Request #{request.id}
              </h1>
              {request.poNumber && <p className="text-sm text-gray-500">PO: {request.poNumber}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!request.poNumber && request.status === 'approved' && <Button variant="primary" leftIcon={<FileIcon className="h-4 w-4" />} onClick={handleGeneratePO}>
                Generate PO
              </Button>}
            {request.poNumber && <Button variant="outline" leftIcon={<FileIcon className="h-4 w-4" />} onClick={() => navigate(`/dashboard/finance/po/${request.id}`)}>
                View PO
              </Button>}
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
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {request.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Requested by {request.requestor} on{' '}
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIndicator status="approved" size="lg" />
                  {request.status === 'processed' && <span className="badge bg-blue-100 text-blue-800">
                      Processed
                    </span>}
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
                      ${request.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Vendor
                    </h3>
                    <p className="mt-1 text-gray-700">{request.vendorName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Category
                    </h3>
                    <p className="mt-1 text-gray-700">{request.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Urgency
                    </h3>
                    <p className="mt-1 text-gray-700">{request.urgency}</p>
                  </div>
                </div>
              </div>
            </Card>
            <Card title="Documents">
              <div className="space-y-3">
                {request.proformaUrl && <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      <FileTextIcon className="h-6 w-6 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Proforma Invoice
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded on{' '}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" leftIcon={<DownloadIcon className="h-4 w-4" />} onClick={() => window.open(request.proformaUrl, '_blank')}>
                      View
                    </Button>
                  </div>}
                {request.receiptUrl ? <div className="flex items-center justify-between p-3 border rounded-md bg-green-50">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Receipt</p>
                        <p className="text-xs text-gray-500">
                          Uploaded by requestor
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" leftIcon={<DownloadIcon className="h-4 w-4" />} onClick={() => window.open(request.receiptUrl, '_blank')}>
                      View
                    </Button>
                  </div> : <div className="p-3 border border-yellow-200 rounded-md bg-yellow-50">
                    <p className="text-sm text-yellow-800">
                      Waiting for receipt upload from requestor
                    </p>
                  </div>}
                {request.poNumber && <div className="flex items-center justify-between p-3 border rounded-md bg-blue-50">
                    <div className="flex items-center">
                      <FileIcon className="h-6 w-6 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Purchase Order
                        </p>
                        <p className="text-xs text-gray-500">
                          {request.poNumber}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/finance/po/${request.id}`)}>
                      View PO
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
            <Card title="Approval History">
              <ApprovalTimeline items={request.approvalHistory} />
            </Card>
          </motion.div>
        </div>
      </div>
      <Modal isOpen={isGeneratePOModalOpen} onClose={() => setIsGeneratePOModalOpen(false)} title="Generate Purchase Order" size="md" footer={<>
            <Button variant="outline" onClick={() => setIsGeneratePOModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmGeneratePO} isLoading={isGenerating}>
              Generate PO
            </Button>
          </>}>
        <div className="space-y-4">
          <p className="text-gray-700">
            Generate a Purchase Order for this approved request?
          </p>
          <Input label="PO Number" value={poNumber} onChange={e => setPONumber(e.target.value)} placeholder="PO-2023-XXXX" />
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              The PO will be sent to {request.vendorName} at{' '}
              {request.vendorName.toLowerCase().replace(/\s+/g, '')}@example.com
            </p>
          </div>
        </div>
      </Modal>
    </DashboardLayout>;
};
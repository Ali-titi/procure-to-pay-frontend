import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useApiBaseUrl } from '../../hooks/useApiBaseUrl';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';
import { SearchIcon, FilterIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, FileTextIcon } from 'lucide-react';

interface RequestData {
  id: number;
  title: string;
  description: string;
  requestor: string;
  amount: number;
  quantity: number;
  department: string;
  status: 'approved' | 'ordered' | 'delivered' | 'completed';
  poNumber?: string;
  createdAt: string;
  updatedAt: string;
  hasProforma: boolean;
  hasReceipt: boolean;
  hasPurchaseOrder: boolean;
  receiptValidation?: {
    status: 'received' | 'partially_received' | 'not_received';
    comment: string;
    date: string;
  };
}

export const FinanceApproved: React.FC = () => {
  const navigate = useNavigate();
  const baseUrl = useApiBaseUrl();
  const [isLoading, setIsLoading] = useState(true);
  const [approvedRequests, setApprovedRequests] = useState<RequestData[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RequestData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [validatingId, setValidatingId] = useState<number | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [validationStatus, setValidationStatus] = useState<'received' | 'partially_received' | 'not_received'>('received');
  const [validationComment, setValidationComment] = useState('');

  useEffect(() => {
    const fetchApprovedRequests = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${baseUrl}/api/finance/`);
        const apiRequests = response.data;

        const transformedRequests: RequestData[] = apiRequests.map((req: any, index: number) => ({
          id: req.id,
          title: req.title,
          description: req.description || '',
          requestor: req.created_by_name || 'Unknown',
          amount: parseFloat(req.amount),
          quantity: req.quantity || 1,
          department: req.department || 'Not specified',
          status: req.status as 'approved' | 'ordered' | 'delivered' | 'completed',
          poNumber: req.purchase_order_file ? `PO-${req.id}` : undefined,
          createdAt: req.created_at,
          updatedAt: req.updated_at,
          hasProforma: !!req.proforma_file,
          hasReceipt: !!req.receipt_file,
          hasPurchaseOrder: !!req.purchase_order_file,
          receiptValidation: req.receipt_validation ? {
            status: req.receipt_validation.status,
            comment: req.receipt_validation.comment,
            date: req.receipt_validation.date
          } : undefined
        }));

        setApprovedRequests(transformedRequests);
        setFilteredRequests(transformedRequests);
      } catch (error) {
        console.error('Error fetching approved requests:', error);
        setApprovedRequests([]);
        setFilteredRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovedRequests();
  }, []);

  useEffect(() => {
    let result = approvedRequests;
    if (searchQuery) {
      result = result.filter(request =>
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.requestor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.poNumber && request.poNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(request => request.status === statusFilter);
    }
    setFilteredRequests(result);
  }, [approvedRequests, searchQuery, statusFilter]);

  const handleValidateReceipt = (request: RequestData) => {
    setSelectedRequest(request);
    setValidationStatus('received');
    setValidationComment('');
    setShowValidationModal(true);
  };

  const submitValidation = async () => {
    if (!selectedRequest) return;

    try {
      setValidatingId(selectedRequest.id);
      const token = localStorage.getItem('token');
      await axios.post(`${baseUrl}/api/finance/${selectedRequest.id}/validate_receipt/`, {
        status: validationStatus,
        comment: validationComment
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      showToast('Receipt validated successfully', 'success');
      setShowValidationModal(false);
      setSelectedRequest(null);
      // Refresh data
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error validating receipt:', error);
      showToast('Failed to validate receipt', 'error');
    } finally {
      setValidatingId(null);
    }
  };

  const columns = [{
    header: 'PO Number',
    accessor: (row: RequestData) => row.poNumber || '-',
    className: 'font-medium text-gray-900'
  }, {
    header: 'Title',
    accessor: (row: RequestData) => row.title
  }, {
    header: 'Requestor',
    accessor: (row: RequestData) => row.requestor
  }, {
    header: 'Department',
    accessor: (row: RequestData) => row.department
  }, {
    header: 'Amount',
    accessor: (row: RequestData) => `$${row.amount.toFixed(2)}`,
    className: 'text-right'
  }, {
    header: 'Status',
    accessor: (row: RequestData) => {
      const statusConfig = {
        approved: {
          text: 'Approved',
          className: 'badge-success'
        },
        ordered: {
          text: 'Ordered',
          className: 'bg-blue-100 text-blue-800'
        },
        delivered: {
          text: 'Delivered',
          className: 'bg-purple-100 text-purple-800'
        },
        completed: {
          text: 'Completed',
          className: 'bg-green-100 text-green-800'
        }
      };
      return <span className={`badge ${statusConfig[row.status].className}`}>
            {statusConfig[row.status].text}
          </span>;
    },
    className: 'text-center'
  }, {
    header: 'Documents',
    accessor: (row: RequestData) => (
      <div className="flex gap-1 justify-center">
        <span className={`w-3 h-3 rounded-full ${row.hasProforma ? 'bg-green-500' : 'bg-gray-300'}`} title="Proforma"></span>
        <span className={`w-3 h-3 rounded-full ${row.hasReceipt ? 'bg-green-500' : 'bg-red-500'}`} title="Receipt"></span>
        <span className={`w-3 h-3 rounded-full ${row.hasPurchaseOrder ? 'bg-green-500' : 'bg-gray-300'}`} title="Purchase Order"></span>
      </div>
    ),
    className: 'text-center'
  }, {
    header: 'Receipt Validation',
    accessor: (row: RequestData) => {
      if (row.receiptValidation) {
        const validationConfig = {
          received: { text: 'Received', className: 'bg-green-100 text-green-800' },
          partially_received: { text: 'Partial', className: 'bg-yellow-100 text-yellow-800' },
          not_received: { text: 'Not Received', className: 'bg-red-100 text-red-800' }
        };
        return <span className={`badge ${validationConfig[row.receiptValidation.status].className}`}>
              {validationConfig[row.receiptValidation.status].text}
            </span>;
      }
      return <span className="badge bg-gray-100 text-gray-800">Not Validated</span>;
    },
    className: 'text-center'
  }, {
    header: 'Actions',
    accessor: (row: RequestData) => (
      <div className="flex gap-2 justify-center">
        {row.status === 'approved' && !row.receiptValidation && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleValidateReceipt(row)}
            disabled={validatingId === row.id}
            className="text-blue-600 hover:bg-blue-50"
          >
            {validatingId === row.id ? 'Validating...' : 'Validate Receipt'}
          </Button>
        )}
        {row.receiptValidation && (
          <span className="text-sm text-gray-500">Validated</span>
        )}
      </div>
    ),
    className: 'text-center'
  }];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Approved Requests
          </h1>
          <Button
            onClick={() => navigate('/dashboard/finance/documents')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileTextIcon className="h-4 w-4 mr-2" />
            View Documents
          </Button>
        </div>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by title, requestor, or PO number..."
                leftIcon={<SearchIcon className="h-5 w-5 text-gray-400" />}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterIcon className="h-5 w-5 text-gray-500" />
              <select
                className="input max-w-xs"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="processed">Processed</option>
              </select>
            </div>
          </div>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Table
            columns={columns}
            data={filteredRequests}
            isLoading={isLoading}
            keyExtractor={row => row.id.toString()}
            emptyMessage="No approved requests found"
          />
        </motion.div>

        {/* Receipt Validation Modal */}
        <Modal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          title="Validate Receipt"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request: {selectedRequest?.title}
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validation Status
              </label>
              <select
                value={validationStatus}
                onChange={(e) => setValidationStatus(e.target.value as 'received' | 'partially_received' | 'not_received')}
                className="input w-full"
              >
                <option value="received">Received - Goods fully received</option>
                <option value="partially_received">Partially Received - Some items missing</option>
                <option value="not_received">Not Received - Goods not received</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={validationComment}
                onChange={(e) => setValidationComment(e.target.value)}
                className="input w-full h-24 resize-none"
                placeholder="Add any comments about the receipt validation..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={submitValidation}
                isLoading={validatingId !== null}
                className="flex-1"
              >
                Validate Receipt
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowValidationModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
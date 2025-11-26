import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useApiBaseUrl } from '../../hooks/useApiBaseUrl';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { SearchIcon, UploadIcon, FileTextIcon, EyeIcon } from 'lucide-react';

interface DocumentData {
  id: number;
  title: string;
  description: string;
  requestor: string;
  department: string;
  amount: number;
  quantity: number;
  poNumber?: string;
  status: 'approved' | 'ordered' | 'delivered' | 'completed';
  hasProforma: boolean;
  hasReceipt: boolean;
  hasPurchaseOrder: boolean;
  receiptValidation?: {
    status: 'received' | 'partially_received' | 'not_received';
    comment: string;
    date: string;
  };
  createdAt: string;
}

export const FinanceDocuments: React.FC = () => {
  const navigate = useNavigate();
  const baseUrl = useApiBaseUrl();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentFilter, setDocumentFilter] = useState<string>('all');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${baseUrl}/api/finance/`);
        const apiRequests = response.data;

        const transformedDocuments: DocumentData[] = apiRequests.map((req: any) => ({
          id: req.id,
          title: req.title,
          description: req.description || '',
          requestor: req.created_by_name || 'Unknown',
          department: req.department || 'Not specified',
          amount: parseFloat(req.amount),
          quantity: req.quantity || 1,
          poNumber: req.purchase_order_file ? `PO-${req.id}` : undefined,
          status: req.status as 'approved' | 'ordered' | 'delivered' | 'completed',
          hasProforma: !!req.proforma_file,
          hasReceipt: !!req.receipt_file,
          hasPurchaseOrder: !!req.purchase_order_file,
          receiptValidation: req.receipt_validation ? {
            status: req.receipt_validation.status,
            comment: req.receipt_validation.comment,
            date: req.receipt_validation.date
          } : undefined,
          createdAt: req.created_at
        }));

        setDocuments(transformedDocuments);
        setFilteredDocuments(transformedDocuments);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setDocuments([]);
        setFilteredDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    let result = documents;
    if (searchQuery) {
      result = result.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.requestor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.poNumber && doc.poNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (documentFilter !== 'all') {
      switch (documentFilter) {
        case 'missing-receipt':
          result = result.filter(doc => !doc.hasReceipt);
          break;
        case 'has-receipt':
          result = result.filter(doc => doc.hasReceipt);
          break;
        case 'complete':
          result = result.filter(doc => doc.hasProforma && doc.hasReceipt && doc.hasPurchaseOrder);
          break;
      }
    }
    setFilteredDocuments(result);
  }, [documents, searchQuery, documentFilter]);

  const getDocumentStatus = (doc: DocumentData) => {
    const docs = [];
    if (doc.hasProforma) docs.push('Proforma');
    if (doc.hasReceipt) docs.push('Receipt');
    if (doc.hasPurchaseOrder) docs.push('PO');

    if (docs.length === 3) return { text: 'Complete', className: 'bg-green-100 text-green-800' };
    if (docs.length === 0) return { text: 'None', className: 'bg-red-100 text-red-800' };
    return { text: docs.join(', '), className: 'bg-yellow-100 text-yellow-800' };
  };

  const columns = [{
    header: 'PO Number',
    accessor: (row: DocumentData) => row.poNumber || '-',
    className: 'font-medium text-gray-900'
  }, {
    header: 'Title',
    accessor: (row: DocumentData) => row.title
  }, {
    header: 'Requestor',
    accessor: (row: DocumentData) => row.requestor
  }, {
    header: 'Department',
    accessor: (row: DocumentData) => row.department
  }, {
    header: 'Amount',
    accessor: (row: DocumentData) => `$${row.amount.toFixed(2)}`,
    className: 'text-right'
  }, {
    header: 'Request Status',
    accessor: (row: DocumentData) => {
      const statusConfig = {
        approved: { text: 'Approved', className: 'badge-success' },
        ordered: { text: 'Ordered', className: 'bg-blue-100 text-blue-800' },
        delivered: { text: 'Delivered', className: 'bg-purple-100 text-purple-800' },
        completed: { text: 'Completed', className: 'bg-green-100 text-green-800' }
      };
      return <span className={`badge ${statusConfig[row.status].className}`}>{statusConfig[row.status].text}</span>;
    },
    className: 'text-center'
  }, {
    header: 'Documents',
    accessor: (row: DocumentData) => {
      const status = getDocumentStatus(row);
      return <span className={`badge ${status.className}`}>{status.text}</span>;
    },
    className: 'text-center'
  }, {
    header: 'Receipt Validation',
    accessor: (row: DocumentData) => {
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
    accessor: (row: DocumentData) => (
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate('/dashboard/finance/approved')}
        className="text-blue-600 hover:bg-blue-50"
      >
        <EyeIcon className="h-4 w-4 mr-1" />
        View Details
      </Button>
    ),
    className: 'text-center'
  }];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Finance Documents
          </h1>
          <Button
            onClick={() => navigate('/dashboard/finance/approved')}
            variant="outline"
            className="text-blue-600 hover:bg-blue-50"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            View Approved Requests
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card animated className="bg-white p-4">
            <div className="flex items-center">
              <FileTextIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
            </div>
          </Card>
          <Card animated className="bg-white p-4">
            <div className="flex items-center">
              <UploadIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Complete Sets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(doc => doc.hasProforma && doc.hasReceipt && doc.hasPurchaseOrder).length}
                </p>
              </div>
            </div>
          </Card>
          <Card animated className="bg-white p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-600 font-bold text-sm">!</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Missing Receipts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(doc => !doc.hasReceipt).length}
                </p>
              </div>
            </div>
          </Card>
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
              <select
                className="input max-w-xs"
                value={documentFilter}
                onChange={e => setDocumentFilter(e.target.value)}
              >
                <option value="all">All Documents</option>
                <option value="missing-receipt">Missing Receipt</option>
                <option value="has-receipt">Has Receipt</option>
                <option value="complete">Complete Sets</option>
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
            data={filteredDocuments}
            isLoading={isLoading}
            keyExtractor={row => row.id.toString()}
            emptyMessage="No documents found"
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusIcon, SearchIcon, FilterIcon } from 'lucide-react';
import axios from 'axios';
import { useApiBaseUrl } from '../../hooks/useApiBaseUrl';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { CreateRequestForm } from './CreateRequestForm';
interface RequestData {
  id: number;
  title: string;
  description: string;
  amount: number;
  vendor_name?: string;
  category?: string;
  urgency?: string;
  status: 'pending_l1' | 'rejected_l1' | 'pending_l2' | 'rejected_l2' | 'approved' | 'ordered' | 'delivered' | 'completed';
  createdAt: string;
  updatedAt: string;
  index: number;
}
export const StaffRequests: React.FC = () => {
  const navigate = useNavigate();
  const baseUrl = useApiBaseUrl();
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RequestData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);

        // Fetch user's requests
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseUrl}/api/requests/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const apiRequests = response.data.results || response.data;
        console.log('Fetched requests:', apiRequests);

        // Transform data to match frontend interface
        const transformedRequests: RequestData[] = apiRequests.map((req: any, index: number) => ({
          id: req.id,
          title: req.title,
          description: req.description,
          amount: parseFloat(req.amount),
          vendor_name: req.vendor_name,
          category: req.category,
          urgency: req.urgency,
          status: req.status,
          createdAt: req.created_at,
          updatedAt: req.updated_at,
          index: index + 1
        }));

        setRequests(transformedRequests);
        setFilteredRequests(transformedRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
        // Set empty data on error
        setRequests([]);
        setFilteredRequests([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [refreshKey]);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };
  useEffect(() => {
    // Apply filters
    let result = requests;
    if (searchQuery) {
      result = result.filter(request => request.title.toLowerCase().includes(searchQuery.toLowerCase()) || request.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      result = result.filter(request => request.status === statusFilter);
    }
    setFilteredRequests(result);
  }, [requests, searchQuery, statusFilter]);
  const columns = [{
    header: '#',
    accessor: (row: RequestData) => row.index.toString(),
    className: 'font-medium text-gray-900'
  }, {
    header: 'Title',
    accessor: (row: RequestData) => (
      <div>
        <div className="font-medium text-gray-900">{row.title}</div>
        <div className="text-xs text-gray-500 truncate max-w-xs">{row.description}</div>
      </div>
    )
  }, {
    header: 'Vendor',
    accessor: (row: RequestData) => row.vendor_name || 'Not specified'
  }, {
    header: 'Category',
    accessor: (row: RequestData) => row.category || 'Not specified'
  }, {
    header: 'Amount',
    accessor: (row: RequestData) => `$${row.amount.toFixed(2)}`,
    className: 'text-right'
  }, {
    header: 'Status',
    accessor: (row: RequestData) => <Badge status={row.status} />,
    className: 'text-center'
  }, {
    header: 'Date',
    accessor: (row: RequestData) => new Date(row.createdAt).toLocaleDateString()
  }];
  const handleRowClick = (row: RequestData) => {
    navigate(`/dashboard/staff/requests/${row.id}`);
  };
  const handleCreateRequest = () => {
    setIsCreateModalOpen(true);
  };
  return <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <Button onClick={handleCreateRequest} leftIcon={<PlusIcon className="h-4 w-4" />} className="mt-4 md:mt-0">
            Create New Request
          </Button>
        </div>
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input placeholder="Search requests..." leftIcon={<SearchIcon className="h-5 w-5 text-gray-400" />} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <FilterIcon className="h-5 w-5 text-gray-500" />
              <select className="input max-w-xs" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="pending_l1">Pending L1</option>
                <option value="pending_l2">Pending L2</option>
                <option value="approved">Approved</option>
                <option value="ordered">Ordered</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="rejected_l1">Rejected L1</option>
                <option value="rejected_l2">Rejected L2</option>
              </select>
            </div>
          </div>
        </Card>
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <Table columns={columns} data={filteredRequests} isLoading={isLoading} onRowClick={handleRowClick} keyExtractor={row => row.id.toString()} emptyMessage="No requests found" />
        </motion.div>
      </div>
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Purchase Request" size="lg">
        <CreateRequestForm onSuccess={() => {
        setIsCreateModalOpen(false);
        refreshData(); // Refresh the requests list
      }} />
      </Modal>
    </DashboardLayout>;
};
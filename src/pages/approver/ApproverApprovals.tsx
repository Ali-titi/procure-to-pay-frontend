import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon, CheckIcon, XIcon, SearchIcon, FilterIcon, ArrowLeftIcon } from 'lucide-react';
import axios from 'axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

interface RequestData {
  id: number;
  title: string;
  description: string;
  amount: string;
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
  index: number;
}

export const ApproverApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RequestData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    const fetchApprovalsData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        // Fetch all requests that this approver has worked on
        const response = await axios.get('http://localhost:8000/api/requests/my_approvals/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const userApprovals = response.data;

        const transformedRequests: RequestData[] = userApprovals.map((req: any, index: number) => ({
          id: req.id,
          title: req.title,
          description: req.description,
          amount: req.amount,
          quantity: req.quantity,
          department: req.department,
          vendor_name: req.vendor_name,
          category: req.category,
          urgency: req.urgency,
          status: req.status,
          created_by: req.created_by,
          created_by_name: req.created_by_name,
          created_at: req.created_at,
          updated_at: req.updated_at,
          index: index + 1
        }));

        setRequests(transformedRequests);
        setFilteredRequests(transformedRequests);

        // Calculate stats
        const totalCount = transformedRequests.length;
        const pendingCount = transformedRequests.filter(req =>
          req.status === 'pending_l1' || req.status === 'pending_l2'
        ).length;
        const approvedCount = transformedRequests.filter(req =>
          req.status === 'approved' || req.status === 'ordered' || req.status === 'delivered' || req.status === 'completed'
        ).length;
        const rejectedCount = transformedRequests.filter(req =>
          req.status === 'rejected_l1' || req.status === 'rejected_l2'
        ).length;

        setStats({
          total: totalCount,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount
        });
      } catch (error) {
        console.error('Error fetching approvals data:', error);
        setRequests([]);
        setFilteredRequests([]);
        setStats({
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovalsData();
  }, []);

  useEffect(() => {
    let result = requests;
    if (searchQuery) {
      result = result.filter(request =>
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.created_by_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
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
    accessor: (row: RequestData) => row.title
  }, {
    header: 'Requestor',
    accessor: (row: RequestData) => row.created_by_name
  }, {
    header: 'Amount',
    accessor: (row: RequestData) => `$${parseFloat(row.amount).toFixed(2)}`,
    className: 'text-right'
  }, {
    header: 'Status',
    accessor: (row: RequestData) => <Badge status={row.status} />,
    className: 'text-center'
  }, {
    header: 'Date',
    accessor: (row: RequestData) => new Date(row.created_at).toLocaleDateString()
  }];

  const handleRowClick = (row: RequestData) => {
    navigate(`/dashboard/approver/requests/${row.id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
              onClick={() => navigate('/dashboard/approver')}
            >
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              My Approvals
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card animated className="bg-white p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Reviewed
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </Card>
          <Card animated className="bg-white p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Still Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </Card>
          <Card animated className="bg-white p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.approved}
                </p>
              </div>
            </div>
          </Card>
          <Card animated className="bg-white p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 mr-4">
                <XIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search requests..."
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
                <option value="pending_l1">Pending L1</option>
                <option value="pending_l2">Pending L2</option>
                <option value="approved">Approved</option>
                <option value="rejected_l1">Rejected L1</option>
                <option value="rejected_l2">Rejected L2</option>
                <option value="ordered">Ordered</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
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
            onRowClick={handleRowClick}
            keyExtractor={row => row.id.toString()}
            emptyMessage="No approvals found"
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};
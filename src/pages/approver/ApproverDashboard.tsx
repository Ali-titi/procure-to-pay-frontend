import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon, CheckIcon, XIcon, SearchIcon, FilterIcon, AlertCircleIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import axios from 'axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
interface RequestData {
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
  index: number;
}
export const ApproverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RequestData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    urgent: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch pending approvals for this approver
        const response = await axios.get('http://localhost:8000/api/approvals/pending/');
        const apiRequests = response.data;

        // Transform data to match frontend interface
        const transformedRequests: RequestData[] = apiRequests.map((req: any, index: number) => ({
          id: req.id,
          title: req.title,
          description: req.description,
          amount: req.amount, // Keep as string from API
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
        const pendingCount = transformedRequests.length;

        // For approver dashboard, we show stats for all requests this approver has handled
        // Let's fetch additional stats from the API or calculate from current data
        const urgentCount = transformedRequests.filter(req =>
          req.urgency === 'critical' ||
          (req.urgency === 'high' && parseFloat(req.amount) > 5000)
        ).length;

        // For now, we'll show pending count and calculate others as 0 since this dashboard focuses on pending approvals
        // In a real app, you might want to fetch stats for approved/rejected counts separately
        setStats({
          pending: pendingCount,
          approved: 0, // Could be fetched separately if needed
          rejected: 0, // Could be fetched separately if needed
          urgent: urgentCount
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty data on error
        setRequests([]);
        setFilteredRequests([]);
        setStats({
          pending: 0,
          approved: 0,
          rejected: 0,
          urgent: 0
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [refreshKey]);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleApprove = async (requestId: number) => {
    try {
      setApprovingId(requestId);
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8000/api/requests/${requestId}/approve/`, {
        comment: 'Approved'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      showToast('Request approved successfully', 'success');
      refreshData();
    } catch (error) {
      console.error('Error approving request:', error);
      showToast('Failed to approve request', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      setRejectingId(requestId);
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8000/api/requests/${requestId}/reject/`, {
        comment: 'Rejected'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      showToast('Request rejected successfully', 'success');
      refreshData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      showToast('Failed to reject request', 'error');
    } finally {
      setRejectingId(null);
    }
  };
  useEffect(() => {
    let result = requests;
    if (searchQuery) {
      result = result.filter(request => request.title.toLowerCase().includes(searchQuery.toLowerCase()) || request.created_by_name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      result = result.filter(request => request.status === statusFilter);
    }
    setFilteredRequests(result);
  }, [requests, searchQuery, statusFilter]);
  const urgencyColors = {
    low: 'bg-gray-100 text-gray-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };
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
    header: 'Quantity',
    accessor: (row: RequestData) => row.quantity,
    className: 'text-center'
  }, {
    header: 'Department',
    accessor: (row: RequestData) => row.department || 'Not specified'
  }, {
    header: 'Urgency',
    accessor: (row: RequestData) => <span className={`badge ${urgencyColors[row.urgency as keyof typeof urgencyColors] || 'bg-gray-100 text-gray-800'}`}>
          {row.urgency ? row.urgency.charAt(0).toUpperCase() + row.urgency.slice(1) : 'Normal'}
        </span>,
    className: 'text-center'
  }, {
    header: 'Status',
    accessor: (row: RequestData) => <Badge status={row.status} />,
    className: 'text-center'
  }, {
    header: 'Date',
    accessor: (row: RequestData) => new Date(row.created_at).toLocaleDateString()
  }, {
    header: 'Actions',
    accessor: (row: RequestData) => (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          leftIcon={<CheckCircleIcon className="h-4 w-4" />}
          onClick={(e) => {
            e.stopPropagation();
            handleApprove(row.id);
          }}
          disabled={approvingId === row.id}
          className="text-green-600 hover:bg-green-50"
        >
          {approvingId === row.id ? 'Approving...' : 'Approve'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<XCircleIcon className="h-4 w-4" />}
          onClick={(e) => {
            e.stopPropagation();
            handleReject(row.id);
          }}
          disabled={rejectingId === row.id}
          className="text-red-600 hover:bg-red-50"
        >
          {rejectingId === row.id ? 'Rejecting...' : 'Reject'}
        </Button>
      </div>
    ),
    className: 'text-center'
  }];
  const handleRowClick = (row: RequestData) => {
    navigate(`/dashboard/approver/requests/${row.id}`);
  };
  return <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Approver Dashboard
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card animated className="bg-white p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </Card>
          <Card animated className="bg-white p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 mr-4">
                <AlertCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.urgent}
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

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Need to see your approved requests?
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                View all requests you've worked on in the My Approvals section.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/approver/approvals')}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              View My Approvals
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input placeholder="Search requests..." leftIcon={<SearchIcon className="h-5 w-5 text-gray-400" />} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <FilterIcon className="h-5 w-5 text-gray-500" />
              <select className="input max-w-xs" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Pending</option>
                <option value="pending_l1">Level 1 Pending</option>
                <option value="pending_l2">Level 2 Pending</option>
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
        duration: 0.3
      }}>
          <Table columns={columns} data={filteredRequests} isLoading={isLoading} onRowClick={handleRowClick} keyExtractor={row => row.id.toString()} emptyMessage="No requests found" />
        </motion.div>
      </div>
    </DashboardLayout>;
};
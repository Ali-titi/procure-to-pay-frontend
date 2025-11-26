import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useApiBaseUrl } from '../../hooks/useApiBaseUrl';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SearchIcon, DownloadIcon } from 'lucide-react';

interface PurchaseOrderData {
  id: number;
  title: string;
  requestor: string;
  amount: number;
  poNumber: string;
  createdAt: string;
  purchase_order_file: string;
}

export const FinancePurchaseOrders: React.FC = () => {
  const baseUrl = useApiBaseUrl();
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderData[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrderData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${baseUrl}/api/finance/purchase_orders/`);
        const apiOrders = response.data;

        const transformedOrders: PurchaseOrderData[] = apiOrders.map((order: any) => ({
          id: order.id,
          title: order.title,
          requestor: order.created_by_name || 'Unknown',
          amount: parseFloat(order.amount),
          poNumber: `PO-${order.id}`,
          createdAt: order.created_at,
          purchase_order_file: order.purchase_order_file
        }));

        setPurchaseOrders(transformedOrders);
        setFilteredOrders(transformedOrders);
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
        setPurchaseOrders([]);
        setFilteredOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchaseOrders();
  }, []);

  useEffect(() => {
    let result = purchaseOrders;
    if (searchQuery) {
      result = result.filter(order =>
        order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.requestor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.poNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredOrders(result);
  }, [purchaseOrders, searchQuery]);

  const handleDownload = (order: PurchaseOrderData) => {
    if (order.purchase_order_file) {
      window.open(`${baseUrl}${order.purchase_order_file}`, '_blank');
    }
  };

  const columns = [{
    header: 'PO Number',
    accessor: (row: PurchaseOrderData) => row.poNumber,
    className: 'font-medium text-gray-900'
  }, {
    header: 'Title',
    accessor: (row: PurchaseOrderData) => row.title
  }, {
    header: 'Requestor',
    accessor: (row: PurchaseOrderData) => row.requestor
  }, {
    header: 'Amount',
    accessor: (row: PurchaseOrderData) => `$${row.amount.toFixed(2)}`,
    className: 'text-right'
  }, {
    header: 'Created',
    accessor: (row: PurchaseOrderData) => new Date(row.createdAt).toLocaleDateString()
  }, {
    header: 'Actions',
    accessor: (row: PurchaseOrderData) => (
      <Button
        size="sm"
        variant="outline"
        className="text-blue-600 hover:bg-blue-50"
        onClick={() => handleDownload(row)}
        disabled={!row.purchase_order_file}
      >
        <DownloadIcon className="h-4 w-4 mr-1" />
        Download
      </Button>
    ),
    className: 'text-center'
  }];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Purchase Orders
          </h1>
        </div>

        <Card className="p-4">
          <div className="flex-1">
            <Input
              placeholder="Search by title, requestor, or PO number..."
              leftIcon={<SearchIcon className="h-5 w-5 text-gray-400" />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Table
            columns={columns}
            data={filteredOrders}
            isLoading={isLoading}
            keyExtractor={row => row.id.toString()}
            emptyMessage="No purchase orders found"
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};
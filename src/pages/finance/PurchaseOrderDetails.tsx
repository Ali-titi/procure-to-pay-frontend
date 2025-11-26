import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, PrinterIcon, DownloadIcon, MailIcon, CheckCircleIcon, ClipboardIcon } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { showToast } from '../../components/ui/Toast';
interface PODetail {
  id: number;
  poNumber: string;
  requestId: number;
  title: string;
  vendorName: string;
  vendorAddress: string;
  vendorEmail: string;
  amount: number;
  date: string;
  items: {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  termsAndConditions: string;
  status: 'sent' | 'acknowledged' | 'fulfilled';
}
export const PurchaseOrderDetails: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [po, setPO] = useState<PODetail | null>(null);
  const [isSending, setIsSending] = useState(false);
  useEffect(() => {
    // In a real app, this would fetch data from the API
    const fetchPODetails = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock data
        const mockPO: PODetail = {
          id: Number(id),
          poNumber: `PO-2023-${1000 + Number(id)}`,
          requestId: Number(id),
          title: 'IT Equipment for New Hires',
          vendorName: 'TechSupply Co.',
          vendorAddress: '123 Tech Street, San Francisco, CA 94107',
          vendorEmail: 'orders@techsupply.example.com',
          amount: 8750.0,
          date: new Date().toISOString(),
          items: [{
            id: 1,
            description: 'Laptop - Developer Edition XPS 13',
            quantity: 5,
            unitPrice: 1200.0,
            totalPrice: 6000.0
          }, {
            id: 2,
            description: '27" 4K Monitor',
            quantity: 5,
            unitPrice: 450.0,
            totalPrice: 2250.0
          }, {
            id: 3,
            description: 'Wireless Keyboard and Mouse Combo',
            quantity: 5,
            unitPrice: 100.0,
            totalPrice: 500.0
          }],
          termsAndConditions: 'Payment terms: Net 30 days. Delivery expected within 2 weeks of PO acknowledgment.',
          status: ['sent', 'acknowledged', 'fulfilled'][Math.floor(Math.random() * 3)] as 'sent' | 'acknowledged' | 'fulfilled'
        };
        setPO(mockPO);
      } catch (error) {
        console.error('Error fetching PO details:', error);
        showToast('Failed to load Purchase Order details', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchPODetails();
    }
  }, [id]);
  const handlePrint = () => {
    window.print();
  };
  const handleDownload = () => {
    showToast('Download functionality would be implemented here', 'info');
  };
  const handleSendEmail = async () => {
    try {
      setIsSending(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast('Purchase Order sent to vendor successfully', 'success');
    } catch (error) {
      console.error('Error sending PO:', error);
      showToast('Failed to send Purchase Order', 'error');
    } finally {
      setIsSending(false);
    }
  };
  const handleCopyPONumber = () => {
    if (po) {
      navigator.clipboard.writeText(po.poNumber);
      showToast('PO number copied to clipboard', 'success');
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
          <Card className="animate-pulse p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </Card>
        </div>
      </DashboardLayout>;
  }
  if (!po) {
    return <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700">
            Purchase Order not found
          </h2>
          <p className="mt-2 text-gray-500">
            The Purchase Order you're looking for doesn't exist or you don't
            have permission to view it.
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
            <Button variant="outline" size="sm" leftIcon={<ArrowLeftIcon className="h-4 w-4" />} onClick={() => navigate(`/dashboard/finance/requests/${po.requestId}`)}>
              Back to Request
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Purchase Order
              </h1>
              <div className="flex items-center mt-1">
                <span className="text-sm font-medium text-gray-500">
                  {po.poNumber}
                </span>
                <Button variant="outline" size="sm" className="ml-2 p-1 h-6 w-6" onClick={handleCopyPONumber}>
                  <ClipboardIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" leftIcon={<PrinterIcon className="h-4 w-4" />} onClick={handlePrint}>
              Print
            </Button>
            <Button variant="outline" leftIcon={<DownloadIcon className="h-4 w-4" />} onClick={handleDownload}>
              Download
            </Button>
            <Button variant="primary" leftIcon={<MailIcon className="h-4 w-4" />} onClick={handleSendEmail} isLoading={isSending} disabled={po.status !== 'sent'}>
              {po.status === 'sent' ? 'Send to Vendor' : 'Already Sent'}
            </Button>
          </div>
        </div>
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3
      }}>
          <Card className="p-6">
            <div className="border-b pb-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Purchase Order
                  </h2>
                  <p className="text-gray-600">{po.poNumber}</p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <p className="text-gray-600">
                    Date: {new Date(po.date).toLocaleDateString()}
                  </p>
                  <div className="mt-2 flex items-center justify-end">
                    <span className="mr-2">Status:</span>
                    {po.status === 'sent' && <span className="badge bg-blue-100 text-blue-800">
                        Sent to Vendor
                      </span>}
                    {po.status === 'acknowledged' && <span className="badge bg-green-100 text-green-800">
                        Acknowledged
                      </span>}
                    {po.status === 'fulfilled' && <span className="badge bg-purple-100 text-purple-800">
                        Fulfilled
                      </span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  From:
                </h3>
                <p className="font-medium text-gray-900">Your Company Name</p>
                <p className="text-gray-700">123 Business Street</p>
                <p className="text-gray-700">Anytown, State 12345</p>
                <p className="text-gray-700">finance@yourcompany.com</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">To:</h3>
                <p className="font-medium text-gray-900">{po.vendorName}</p>
                <p className="text-gray-700">{po.vendorAddress}</p>
                <p className="text-gray-700">{po.vendorEmail}</p>
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Items:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {po.items.map(item => <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                          ${item.totalPrice.toFixed(2)}
                        </td>
                      </tr>)}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        Total:
                      </td>
                      <td className="px-6 py-4 text-right text-base font-bold text-gray-900">
                        ${po.amount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Terms and Conditions:
              </h3>
              <p className="text-gray-700">{po.termsAndConditions}</p>
            </div>
            <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="text-gray-600">
                <p>Thank you for your business.</p>
                <p className="mt-1">
                  For any questions regarding this purchase order, please
                  contact finance@yourcompany.com
                </p>
              </div>
              {po.status === 'fulfilled' && <div className="flex items-center mt-4 md:mt-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-700 font-medium">
                    Order Fulfilled
                  </span>
                </div>}
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>;
};
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useApiBaseUrl } from '../../hooks/useApiBaseUrl';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { UploadBox } from '../../components/ui/UploadBox';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { showToast } from '../../components/ui/Toast';

const editRequestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Amount must be a positive number'
  }),
  quantity: z.string().refine(val => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: 'Quantity must be a positive number'
  }),
  department: z.string().min(1, 'Department is required'),
  vendorName: z.string().min(2, 'Vendor name is required'),
  category: z.string().min(1, 'Category is required'),
  urgency: z.string().min(1, 'Urgency is required')
});

type EditRequestFormValues = z.infer<typeof editRequestSchema>;

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
  proforma_file?: string;
}

export const EditRequestForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const baseUrl = useApiBaseUrl();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [proformaFile, setProformaFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<EditRequestFormValues>({
    resolver: zodResolver(editRequestSchema),
  });

  // Fetch existing request data
  useEffect(() => {
    const fetchRequestData = async () => {
      if (!id) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseUrl}/api/requests/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const requestData: RequestData = response.data;

        // Populate form with existing data
        reset({
          title: requestData.title,
          description: requestData.description,
          amount: requestData.amount,
          quantity: requestData.quantity.toString(),
          department: requestData.department,
          vendorName: requestData.vendor_name,
          category: requestData.category,
          urgency: requestData.urgency
        });

        if (requestData.proforma_file) {
          setExistingFileUrl(`${baseUrl}${requestData.proforma_file}`);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching request data:', error);
        showToast('Failed to load request data', 'error');
        navigate('/dashboard/staff/requests');
      }
    };

    fetchRequestData();
  }, [id, reset, navigate]);

  const handleFileSelect = (file: File) => {
    setProformaFile(file);
    setExistingFileUrl(null); // Remove existing file reference when new file is selected
  };

  const handleRemoveFile = () => {
    setProformaFile(null);
    setExistingFileUrl(null);
  };

  const onSubmit = async (data: EditRequestFormValues) => {
    if (!id) return;

    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('amount', data.amount);
      formData.append('quantity', data.quantity);
      formData.append('department', data.department);
      formData.append('vendor_name', data.vendorName);
      formData.append('category', data.category);
      formData.append('urgency', data.urgency);

      // Only append file if a new one was selected
      if (proformaFile) {
        formData.append('proforma_file', proformaFile);
      }

      console.log('Updating request with data:', {
        title: data.title,
        description: data.description,
        amount: data.amount,
        quantity: data.quantity,
        department: data.department,
        vendor_name: data.vendorName,
        category: data.category,
        urgency: data.urgency,
        hasNewFile: !!proformaFile
      });

      const token = localStorage.getItem('token');
      const response = await axios.put(`${baseUrl}/api/requests/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Update response:', response.data);
      showToast('Purchase request updated successfully!', 'success');
      navigate(`/dashboard/staff/requests/${id}`);
    } catch (error) {
      console.error('Error updating request:', error);
      showToast('Failed to update request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Purchase Request</h1>
            <p className="mt-2 text-gray-600">Update your purchase request details</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg p-6 border">
              <Input
                label="Request Title"
                error={errors.title?.message}
                {...register('title')}
                placeholder="e.g., Office Supplies, Software License"
              />

              <Textarea
                label="Description"
                error={errors.description?.message}
                {...register('description')}
                placeholder="Provide details about the purchase request..."
                rows={4}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Amount ($)"
                  type="number"
                  step="0.01"
                  error={errors.amount?.message}
                  {...register('amount')}
                  placeholder="0.00"
                />
                <Input
                  label="Quantity"
                  type="number"
                  error={errors.quantity?.message}
                  {...register('quantity')}
                  placeholder="1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Vendor Name"
                  error={errors.vendorName?.message}
                  {...register('vendorName')}
                  placeholder="Supplier or vendor name"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select className="input" {...register('department')}>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Admin">Admin</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.department?.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.department?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select className="input" {...register('category')}>
                    <option value="">Select a category</option>
                    <option value="office_supplies">Office Supplies</option>
                    <option value="software">Software</option>
                    <option value="hardware">Hardware</option>
                    <option value="services">Services</option>
                    <option value="travel">Travel</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category?.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.category?.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency
                  </label>
                  <select className="input" {...register('urgency')}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  {errors.urgency?.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.urgency?.message}
                    </p>
                  )}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proforma Invoice / Quote
                  {existingFileUrl && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Current file will be replaced if you upload a new one)
                    </span>
                  )}
                </label>
                <UploadBox
                  onFileSelect={handleFileSelect}
                  acceptedFileTypes="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
                  label={existingFileUrl ? "Upload new proforma invoice or quote" : "Upload proforma invoice or quote"}
                  selectedFile={proformaFile}
                  onRemoveFile={handleRemoveFile}
                  isUploading={isSubmitting && proformaFile !== null}
                  uploadProgress={uploadProgress}
                />
                {existingFileUrl && !proformaFile && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-700">
                      Current file: <a href={existingFileUrl} target="_blank" rel="noopener noreferrer" className="underline">View existing file</a>
                    </p>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Upload a PDF, image, or document with vendor quote details
                </p>
              </motion.div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/dashboard/staff/requests/${id}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Update Request
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};
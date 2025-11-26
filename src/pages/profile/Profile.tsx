import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserIcon, MailIcon, PhoneIcon, BuildingIcon, SaveIcon } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../components/ui/Toast';
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  department: z.string().optional()
});
type ProfileFormValues = z.infer<typeof profileSchema>;
export const Profile: React.FC = () => {
  const {
    user
  } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      department: ''
    }
  });
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Profile update error:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  return <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3
      }}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your account information
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Summary Card */}
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.3,
            delay: 0.1
          }}>
              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                    <UserIcon className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user?.name || 'User'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                  <div className="mt-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                    {user?.role || 'User'}
                  </div>
                </div>
              </Card>
            </motion.div>
            {/* Profile Form */}
            <motion.div initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.3,
            delay: 0.2
          }} className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Personal Information
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <Input label="Full Name" leftIcon={<UserIcon className="h-5 w-5 text-gray-400" />} error={errors.name?.message} {...register('name')} placeholder="John Doe" />
                  <Input label="Email Address" type="email" leftIcon={<MailIcon className="h-5 w-5 text-gray-400" />} error={errors.email?.message} {...register('email')} placeholder="john.doe@example.com" />
                  <Input label="Phone Number" type="tel" leftIcon={<PhoneIcon className="h-5 w-5 text-gray-400" />} error={errors.phone?.message} {...register('phone')} placeholder="+1 (555) 000-0000" />
                  <Input label="Department" leftIcon={<BuildingIcon className="h-5 w-5 text-gray-400" />} error={errors.department?.message} {...register('department')} placeholder="Engineering" />
                  <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={isSubmitting} leftIcon={<SaveIcon className="h-4 w-4" />}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
          {/* Additional Settings Card */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.3
        }} className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">
                      Email Notifications
                    </p>
                    <p className="text-sm text-gray-500">
                      Receive email updates about your requests
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">
                      SMS Notifications
                    </p>
                    <p className="text-sm text-gray-500">
                      Receive text messages for urgent updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>;
};
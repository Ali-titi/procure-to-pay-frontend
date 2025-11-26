import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MailIcon, LockIcon, Loader2Icon } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../components/ui/Toast';
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});
type LoginFormValues = z.infer<typeof loginSchema>;
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const {
    login,
    isAuthenticated,
    userRole
  } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && userRole) {
      let dashboardPath = '/login';
      if (userRole === 'staff') {
        dashboardPath = '/dashboard/staff';
      } else if (userRole === 'approver1' || userRole === 'approver2') {
        dashboardPath = '/dashboard/approver';
      } else if (userRole === 'finance') {
        dashboardPath = '/dashboard/finance';
      } else if (userRole === 'admin') {
        dashboardPath = '/dashboard/staff'; // Admin can access staff dashboard or create admin dashboard
      }
      navigate(dashboardPath, {
        replace: true
      });
    }
  }, [isAuthenticated, userRole, navigate]);
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      await login(data.email, data.password);
      showToast('Successfully logged in!', 'success');
      // Navigation will be handled by the useEffect above
    } catch (error) {
      console.error('Login error:', error);
      showToast('Login failed. Please check your credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }} className="max-w-md w-full">
        <div className="text-center mb-8">
          <motion.h1 initial={{
          scale: 0.9
        }} animate={{
          scale: 1
        }} transition={{
          duration: 0.3
        }} className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ProcurePay
          </motion.h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        <Card className="p-6 shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input label="Email Address" type="email" leftIcon={<MailIcon className="h-5 w-5 text-gray-400" />} error={errors.email?.message} {...register('email')} placeholder="you@example.com" />
            <Input label="Password" type="password" leftIcon={<LockIcon className="h-5 w-5 text-gray-400" />} error={errors.password?.message} {...register('password')} placeholder="••••••••" />
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>;
};
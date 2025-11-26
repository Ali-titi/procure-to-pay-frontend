import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MailIcon, ArrowLeftIcon } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { showToast } from '../../components/ui/Toast';
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email')
});
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export const ForgotPassword: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsSubmitting(true);
      // In a real app, this would call an API endpoint
      console.log('Reset password for:', data.email);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success toast
      showToast('Password reset instructions sent to your email!', 'success');
      // Update UI to show success message
      setIsSubmitted(true);
    } catch (error) {
      console.error('Reset password error:', error);
      showToast('Failed to send reset instructions. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
          <h1 className="text-3xl font-bold text-gray-900">ProcurePay</h1>
          <p className="mt-2 text-gray-600">Reset your password</p>
        </div>
        <Card className="p-6">
          {!isSubmitted ? <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="mb-4 text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your
                password.
              </div>
              <Input label="Email Address" type="email" leftIcon={<MailIcon className="h-5 w-5 text-gray-400" />} error={errors.email?.message} {...register('email')} placeholder="you@example.com" />
              <Button type="submit" fullWidth isLoading={isSubmitting}>
                Send Reset Link
              </Button>
            </form> : <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.5
        }} className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <MailIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Check your email
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                We've sent a password reset link to your email address. Please
                check your inbox and follow the instructions.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setIsSubmitted(false)}>
                Try another email
              </Button>
            </motion.div>}
          <div className="mt-6 flex items-center justify-center">
            <Link to="/login" className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to login
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>;
};
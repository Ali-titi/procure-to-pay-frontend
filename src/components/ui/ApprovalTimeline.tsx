import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from 'lucide-react';
interface TimelineItem {
  id: string;
  status: 'approved' | 'rejected' | 'pending';
  approver: string;
  role: string;
  date?: string;
  comments?: string;
}
interface ApprovalTimelineProps {
  items: TimelineItem[];
}
export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({
  items
}) => {
  const statusIcons = {
    approved: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
    rejected: <XCircleIcon className="h-6 w-6 text-red-500" />,
    pending: <ClockIcon className="h-6 w-6 text-yellow-500" />
  };
  const statusColors = {
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
    pending: 'bg-yellow-500'
  };
  return <div className="flow-root">
      <ul className="-mb-8">
        {items.map((item, index) => <motion.li key={item.id} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3,
        delay: index * 0.1
      }} className="relative pb-8">
            {index !== items.length - 1 && <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />}
            <div className="relative flex items-start space-x-3">
              <div className="relative">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white border-2 border-gray-200">
                  {statusIcons[item.status]}
                </div>
                <span className={`absolute top-0 right-0 h-3 w-3 rounded-full ring-2 ring-white ${statusColors[item.status]}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.approver}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {item.role} {item.date && `· ${item.date}`}
                  </p>
                </div>
                {item.comments && <div className="mt-2 text-sm text-gray-700">
                    <p>{item.comments}</p>
                  </div>}
              </div>
            </div>
          </motion.li>)}
      </ul>
    </div>;
};
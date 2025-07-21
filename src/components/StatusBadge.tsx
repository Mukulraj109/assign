import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'pass' | 'fail' | 'in-progress';
  label: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pass':
        return {
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800',
          text: 'Passed'
        };
      case 'fail':
        return {
          icon: XCircle,
          className: 'bg-red-100 text-red-800',
          text: 'Failed'
        };
      case 'in-progress':
        return {
          icon: AlertCircle,
          className: 'bg-orange-100 text-orange-800',
          text: 'In Progress'
        };
      default:
        return {
          icon: Clock,
          className: 'bg-gray-100 text-gray-800',
          text: 'Pending'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {label}: {config.text}
    </span>
  );
}
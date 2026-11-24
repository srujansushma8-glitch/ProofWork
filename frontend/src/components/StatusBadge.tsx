import React from 'react';
import { ShieldCheck, Clock, XCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'verified' | 'pending_verification' | 'pending' | 'rejected' | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const normalized = status?.toLowerCase() || '';

  let bg = 'bg-slate-100 text-slate-800 border-slate-200';
  let label = 'Unknown';
  let icon = <AlertCircle className="w-3.5 h-3.5" />;

  if (normalized.includes('verified') || normalized === 'confirmed') {
    bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    label = 'Verified';
    icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />;
  } else if (normalized.includes('pending')) {
    bg = 'bg-amber-50 text-amber-800 border-amber-300';
    label = 'Pending Confirmation';
    icon = <Clock className="w-3.5 h-3.5 text-amber-700" />;
  } else if (normalized.includes('reject')) {
    bg = 'bg-rose-50 text-rose-800 border-rose-300';
    label = 'Rejected';
    icon = <XCircle className="w-3.5 h-3.5 text-rose-700" />;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2'
  }[size];

  return (
    <span className={`inline-flex items-center rounded border tracking-wide uppercase font-mono ${bg} ${sizeClasses}`}>
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
};

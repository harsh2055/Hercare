// client/src/components/ui/Badge.jsx
import React from 'react';
import { cn } from '../../utils/cn';

const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-pink-100 text-pink-700',
    rose: 'bg-rose-100 text-rose-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
};

export default Badge;

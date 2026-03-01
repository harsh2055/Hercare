// client/src/components/ui/Card.jsx
import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className, ...props }) => (
  <div
    className={cn('glass-card p-5 soft-shadow', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className }) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

export const CardTitle = ({ children, className }) => (
  <h3 className={cn('text-lg font-semibold text-gray-800', className)}>{children}</h3>
);

export const CardContent = ({ children, className }) => (
  <div className={cn('', className)}>{children}</div>
);

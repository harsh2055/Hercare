// client/src/components/ui/Input.jsx
import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5 rounded-xl border border-pink-200 bg-white/70 text-gray-800 placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all',
          error && 'border-red-400 focus:ring-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;

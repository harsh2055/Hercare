// client/src/components/ui/Select.jsx
import React from 'react';
import { cn } from '../../utils/cn';

const Select = ({ className, label, options = [], error, ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={cn(
          'w-full px-4 py-2.5 rounded-xl border border-pink-200 bg-white/70 text-gray-800',
          'focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default Select;

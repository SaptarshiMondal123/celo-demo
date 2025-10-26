import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning';
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon,
  variant = 'default' 
}) => {
  const variantStyles = {
    default: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30',
    accent: 'from-purple-500/10 to-pink-500/10 border-purple-500/30',
    success: 'from-green-500/10 to-emerald-500/10 border-green-500/30',
    warning: 'from-orange-500/10 to-yellow-500/10 border-orange-500/30',
  };

  return (
    <div className={`bg-gradient-to-r ${variantStyles[variant]} border rounded-xl p-6 hover:border-opacity-60 transition-all duration-300`}>
      {icon && (
        <div className="mb-3 text-blue-400">
          {icon}
        </div>
      )}
      <p className="text-xs font-semibold uppercase text-gray-400 mb-2 tracking-wider">
        {label}
      </p>
      <p className="text-4xl font-bold text-white">
        {value}
      </p>
    </div>
  );
};

export default StatCard;

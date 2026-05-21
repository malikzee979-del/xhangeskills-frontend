import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  color: 'blue' | 'emerald' | 'orange' | 'purple';
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200',
  emerald: 'bg-emerald-50 border-emerald-200',
  orange: 'bg-orange-50 border-orange-200',
  purple: 'bg-purple-50 border-purple-200',
};

const iconColorClasses = {
  blue: 'text-blue-600',
  emerald: 'text-emerald-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
};

export default function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className={`p-6 border rounded-lg ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-white flex items-center justify-center ${iconColorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-gray-600 text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

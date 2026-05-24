import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  color: 'blue' | 'emerald' | 'orange' | 'purple';
}

// Map the legacy color prop to themeable token classes.
const accentClasses: Record<StatCardProps['color'], string> = {
  blue: 'text-accent',
  emerald: 'text-success',
  orange: 'text-warning',
  purple: 'text-accent-2',
};

export default function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="card card-hover reveal p-6">
      <div className="mb-4 flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 ${accentClasses[color]}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-content">{value}</p>
    </div>
  );
}

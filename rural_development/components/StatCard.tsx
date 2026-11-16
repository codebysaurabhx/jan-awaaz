// components/StatCard.tsx
import { LucideBarChart2, LucideCheck, LucideClock, LucideAlertTriangle, LucideRefreshCw } from 'lucide-react';

type Stat = {
  label: string;
  value: string | number;
  change?: string; // e.g. "+5%"
  icon?: React.ReactNode;
};

export const StatCard = ({ label, value, change, icon }: Stat) => {
  return (
    <div className="bg-white rounded shadow p-4 flex items-center space-x-4">
      {icon && <div className="text-primary">{icon}</div>}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-text">{value}</p>
        {change && <p className="text-xs text-gray-400">{change}</p>}
      </div>
    </div>
  );
};

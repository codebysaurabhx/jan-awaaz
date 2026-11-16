// app/dashboard/page.tsx
import { Suspense } from 'react';
import { StatCard } from '@/components/StatCard';
import { fetchDashboardStats } from '@/lib/queries';
import dynamic from 'next/dynamic';
import { LucideBarChart2, LucideCheck, LucideClock, LucideAlertTriangle, LucideRefreshCw } from 'lucide-react';

// Dynamically import Recharts components to avoid SSR issues
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then((mod) => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });

export const metadata = {
  title: 'Village Development Dashboard',
};

async function DashboardContent() {
  // For demo we use no filters; in a full version, UI would allow picking village/date etc.
  const stats = await fetchDashboardStats({});
  const data = [
    { name: 'Submitted', value: stats.totalComplaints },
    { name: 'Resolved', value: stats.resolvedComplaints },
    { name: 'Pending', value: stats.pendingComplaints },
    { name: 'In Progress', value: stats.inProgressComplaints },
    { name: 'Overdue', value: stats.overdueComplaints },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary mb-4">Village Development & Public Accountability Dashboard</h1>
      {/* Statistic cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Complaints"
          value={stats.totalComplaints}
          icon={<LucideBarChart2 size={24} />}
        />
        <StatCard
          label="Resolved"
          value={stats.resolvedComplaints}
          icon={<LucideCheck size={24} className="text-success" />}
        />
        <StatCard
          label="Pending"
          value={stats.pendingComplaints}
          icon={<LucideClock size={24} className="text-pending" />}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgressComplaints}
          icon={<LucideRefreshCw size={24} className="text-primary" />}
        />
        <StatCard
          label="Overdue"
          value={stats.overdueComplaints}
          icon={<LucideAlertTriangle size={24} className="text-critical" />}
        />
        <StatCard
          label="Resolution Rate"
          value={`${stats.resolutionRate}%`}
          icon={<LucideCheck size={24} />}
        />
        <StatCard
          label="Avg Resolution Time (days)"
          value={stats.averageResolutionTime}
          icon={<LucideClock size={24} />}
        />
      </div>

      {/* Simple bar chart */}
      <div className="bg-white rounded shadow p-4" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={"#14532D"} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

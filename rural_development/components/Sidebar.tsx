// components/Sidebar.tsx
import Link from 'next/link';
import { LucideHome, LucideFileText, LucideBarChart2, LucideUser, LucideTool, LucideSettings } from 'lucide-react';
import { getUser } from '@/lib/auth';

export const Sidebar = async () => {
  const user = await getUser();
  const role = user?.profile?.role ?? 'guest';
  const menu = [
    { href: '/', label: 'Home', icon: <LucideHome size={20} /> },
    { href: '/dashboard', label: 'Analytics', icon: <LucideBarChart2 size={20} />, roles: ['super_admin', 'district_admin', 'block_officer', 'panchayat_officer'] },
    { href: '/complaint/new', label: 'Raise Complaint', icon: <LucideFileText size={20} />, roles: ['citizen'] },
    { href: '/my-complaints', label: 'My Complaints', icon: <LucideFileText size={20} />, roles: ['citizen'] },
    { href: '/admin', label: 'Admin', icon: <LucideTool size={20} />, roles: ['super_admin', 'district_admin', 'block_officer', 'panchayat_officer'] },
    { href: '/profile', label: 'Profile', icon: <LucideUser size={20} />, roles: ['citizen', 'panchayat_officer', 'block_officer', 'district_admin', 'super_admin'] },
  ];

  return (
    <nav className="w-64 bg-primary text-white h-screen p-4 hidden md:block">
      <ul className="space-y-2">
        {menu.map((item, i) => {
          const allowed = !item.roles || item.roles.includes(role);
          if (!allowed) return null;
          return (
            <li key={i}>
              <Link href={item.href} className="flex items-center space-x-2 p-2 rounded hover:bg-secondary">
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

// lib/requireRole.ts
import { redirect } from 'next/navigation';
import { getUser } from './auth';

export const requireRole = async (allowedRoles: string[], redirectTo = '/login') => {
  const user = await getUser();
  if (!user) redirect(redirectTo);
  const role = user.profile?.role;
  if (!role || !allowedRoles.includes(role)) redirect('/');
  return user;
};

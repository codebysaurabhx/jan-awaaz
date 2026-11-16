// lib/queries.ts
import { supabaseAdmin } from './supabase';
import type { Complaint } from '@/types';

/**
 * Fetch complaints with optional filters.
 */
export const fetchComplaints = async (filters: Record<string, any>) => {
  let query = supabaseAdmin.from('complaints').select('*');
  if (filters.villageId) query = query.eq('village_id', filters.villageId);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.startDate) query = query.gte('created_at', filters.startDate);
  if (filters.endDate) query = query.lte('created_at', filters.endDate);

  const { data, error } = await query;
  if (error) throw error;
  return data as Complaint[];
};

/** Helper to apply common filters to a Supabase query builder. */
const applyFilters = (builder: any, filters: Record<string, any>) => {
  if (filters.villageId) builder = builder.eq('village_id', filters.villageId);
  if (filters.districtId) builder = builder.eq('district_id', filters.districtId);
  if (filters.startDate) builder = builder.gte('created_at', filters.startDate);
  if (filters.endDate) builder = builder.lte('created_at', filters.endDate);
  return builder;
};

/**
 * Fetch dashboard statistics, all derived from live database counts.
 */
export const fetchDashboardStats = async (filters: Record<string, any>) => {
  // Total complaints
  const totalRes = await applyFilters(
    supabaseAdmin.from('complaints').select('id', { count: 'exact', head: true }),
    filters,
  );
  const total = totalRes.count ?? 0;

  // Resolved complaints
  const resolvedRes = await applyFilters(
    supabaseAdmin
      .from('complaints')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'resolved'),
    filters,
  );
  const resolved = resolvedRes.count ?? 0;

  // Pending (submitted)
  const pendingRes = await applyFilters(
    supabaseAdmin
      .from('complaints')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'submitted'),
    filters,
  );
  const pending = pendingRes.count ?? 0;

  // In‑progress
  const inProgressRes = await applyFilters(
    supabaseAdmin
      .from('complaints')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'in_progress'),
    filters,
  );
  const inProgress = inProgressRes.count ?? 0;

  // Reopened
  const reopenedRes = await applyFilters(
    supabaseAdmin
      .from('complaints')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'reopened'),
    filters,
  );
  const reopened = reopenedRes.count ?? 0;

  // Overdue (deadline passed and not resolved)
  const overdueRes = await applyFilters(
    supabaseAdmin
      .from('complaints')
      .select('id', { count: 'exact', head: true })
      .lt('resolution_deadline', new Date().toISOString())
      .neq('status', 'resolved'),
    filters,
  );
  const overdue = overdueRes.count ?? 0;

  const resolutionRate = total ? (resolved / total) * 100 : 0;

  // Average resolution time (days) for resolved complaints
  const { data: resolvedComplaints } = await applyFilters(
    supabaseAdmin.from('complaints').select('created_at, updated_at').eq('status', 'resolved'),
    filters,
  );
  let avgResolutionTime = 0;
  if (resolvedComplaints && resolvedComplaints.length) {
    const totalDays = resolvedComplaints.reduce((sum: number, c: any) => {
      const created = new Date(c.created_at as string);
      const updated = new Date(c.updated_at as string);
      return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    }, 0);
    avgResolutionTime = totalDays / resolvedComplaints.length;
  }

  return {
    totalComplaints: total,
    resolvedComplaints: resolved,
    pendingComplaints: pending,
    inProgressComplaints: inProgress,
    reopenedComplaints: reopened,
    overdueComplaints: overdue,
    resolutionRate: Number(resolutionRate.toFixed(2)),
    averageResolutionTime: Number(avgResolutionTime.toFixed(2)),
  };
};

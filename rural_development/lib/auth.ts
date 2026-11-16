// lib/auth.ts
import { supabase, supabaseAdmin } from './supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const getUser = async () => {
  const supabaseClient = supabase;
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('auth_user_id', user.id).single();
  return { ...user, profile };
};

export const requireAuth = async (redirectUrl = '/login') => {
  const user = await getUser();
  if (!user) redirect(redirectUrl);
  return user;
};

export const signOut = async () => {
  await supabase.auth.signOut();
  redirect('/');
};

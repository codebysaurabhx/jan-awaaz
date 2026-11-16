// app/api/complaints/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { aiFallback } from '@/lib/aiFallback';

export async function POST(request: Request) {
  const formData = await request.formData();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string | null;
  const villageId = formData.get('villageId') as string;
  const wardId = formData.get('wardId') as string | null;
  const isAnonymous = formData.get('isAnonymous') === 'true';
  const user = (await supabaseAdmin.auth.getUser()).data.user;
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

  // AI fallback if category not provided
  let finalCategory = category;
  let department = null;
  let summary = description;
  if (!category) {
    const aiResult = await aiFallback(description);
    finalCategory = aiResult.suggestedCategory;
    department = aiResult.department;
    summary = aiResult.summary;
  }

  // Insert complaint
  const { data: complaint, error } = await supabaseAdmin.from('complaints').insert({
    title,
    description: summary,
    category: finalCategory,
    citizen_id: (await supabaseAdmin.from('profiles').select('id').eq('auth_user_id', user.id).single()).data?.id,
    village_id: villageId,
    ward_id: wardId,
    is_anonymous: isAnonymous,
    status: 'submitted',
  }).single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Handle file uploads (photo/video/voice) – assume they are already in Supabase storage via separate client call; here we just link placeholders.
  // For demo, skip actual upload handling.

  // Create audit log
  await supabaseAdmin.from('audit_logs').insert({
    actor_id: (await supabaseAdmin.from('profiles').select('id').eq('auth_user_id', user.id).single()).data?.id,
    action: 'create_complaint',
    details: { complaint_id: complaint.id, category: finalCategory, is_anonymous: isAnonymous },
  });

  // Create notification for officers (simple demo: all panchayat officers)
  const { data: officers } = await supabaseAdmin.from('profiles')
    .select('id')
    .eq('role', 'panchayat_officer');
  if (officers) {
    const notifications = officers.map((off) => ({
      recipient_id: off.id,
      title: 'New Complaint Submitted',
      body: `A new complaint "${title}" has been submitted.`,
    }));
    await supabaseAdmin.from('notifications').insert(notifications);
  }

  return NextResponse.json({ complaint });
}

// app/api/complaints/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireRole } from '@/lib/requireRole';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  // only officers can update status
  const user = await requireRole(['panchayat_officer', 'block_officer', 'district_admin', 'super_admin'], '/login');
  const { status, comment } = await request.json();
  if (!status) return NextResponse.json({ error: 'Missing status' }, { status: 400 });

  // fetch complaint
  const { data: complaint, error } = await supabaseAdmin
    .from('complaints')
    .select('id, status, citizen_id')
    .eq('id', id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  // update status
  const { error: updError } = await supabaseAdmin
    .from('complaints')
    .update({ status })
    .eq('id', id);
  if (updError) return NextResponse.json({ error: updError.message }, { status: 400 });

  // insert into complaint_updates
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();
  await supabaseAdmin.from('complaint_updates').insert({
    complaint_id: id,
    updater_id: profile!.id,
    status,
    comment: comment ?? null,
  });

  // audit log
  await supabaseAdmin.from('audit_logs').insert({
    actor_id: profile!.id,
    action: 'update_complaint_status',
    details: { complaint_id: id, new_status: status },
  });

  // notify citizen if resolved
  if (status === 'resolved') {
    const { data: citizen } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', complaint.citizen_id)
      .single();
    if (citizen) {
      await supabaseAdmin.from('notifications').insert({
        recipient_id: citizen.id,
        title: 'Your complaint has been resolved',
        body: `Complaint "${complaint.id}" is marked resolved. Please verify the solution.`,
      });
    }
  }

  return NextResponse.json({ success: true });
}

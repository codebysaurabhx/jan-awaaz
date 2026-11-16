// scripts/seed.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Create states, districts, blocks, panchayats, villages, wards
  const state = await supabase.from('states').insert({ name: 'Uttar Pradesh' }).single();
  const stateId = state.data?.id;

  const districts = ['Agra', 'Lucknow', 'Varanasi'];
  const districtIds: string[] = [];
  for (const name of districts) {
    const { data } = await supabase.from('districts').insert({ name, state_id: stateId }).single();
    districtIds.push(data!.id);
  }

  const blocks: string[] = [];
  for (const dId of districtIds) {
    const { data } = await supabase.from('blocks').insert({ name: `Block-${dId.slice(0, 4)}`, district_id: dId }).single();
    blocks.push(data!.id);
  }

  const panchayats: string[] = [];
  for (const bId of blocks) {
    const { data } = await supabase.from('panchayats').insert({ name: `Panchayat-${bId.slice(0, 4)}`, block_id: bId }).single();
    panchayats.push(data!.id);
  }

  const villages: string[] = [];
  for (const pId of panchayats) {
    const { data } = await supabase.from('villages').insert({ name: `Village-${pId.slice(0, 4)}`, panchayat_id: pId }).single();
    villages.push(data!.id);
  }

  const wards: string[] = [];
  for (const vId of villages) {
    const { data } = await supabase.from('wards').insert({ name: `Ward-1`, village_id: vId }).single();
    wards.push(data!.id);
  }

  // Departments
  const deptNames = [
    'Water Supply',
    'Public Works',
    'Energy',
    'Sanitation',
    'Food Supplies',
    'Social Welfare',
    'Education',
    'Health Services',
    'Agriculture',
    'Administration',
    'Women Welfare',
    'General Administration',
  ];
  const deptIds: string[] = [];
  for (const name of deptNames) {
    const { data } = await supabase.from('departments').insert({ name }).single();
    deptIds.push(data!.id);
  }

  // Demo users (profiles are linked to auth users later)
  const demoUsers = [
    { email: 'superadmin@janawaaz.in', password: 'SuperPass123', role: 'super_admin' },
    { email: 'districtadmin@janawaaz.in', password: 'DistPass123', role: 'district_admin' },
    { email: 'blockofficer@janawaaz.in', password: 'BlockPass123', role: 'block_officer' },
    { email: 'panchayatofficer@janawaaz.in', password: 'PanchayatPass123', role: 'panchayat_officer' },
    { email: 'citizen1@janawaaz.in', password: 'CitizenPass123', role: 'citizen' },
  ];

  for (const u of demoUsers) {
    const { data: auth } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });
    const authId = auth!.id;
    // pick a random village for citizen
    const villageId = u.role === 'citizen' ? villages[Math.floor(Math.random() * villages.length)] : null;
    await supabase.from('profiles').insert({
      auth_user_id: authId,
      name: u.email.split('@')[0],
      role: u.role,
      village_id: villageId,
      language: 'en',
    });
  }

  // Generate 100 sample complaints
  const categories = [
    'Drinking Water',
    'Roads and Infrastructure',
    'Electricity',
    'Sanitation and Garbage',
    'Ration and Food Distribution',
    'Pension Issues',
    'Education',
    'Healthcare',
    'Agriculture',
    'Government Schemes',
    'Women Safety',
    'Other',
  ];

  const statuses = ['submitted', 'reviewed', 'assigned', 'in_progress', 'resolved'];

  for (let i = 0; i < 100; i++) {
    const citizenId = (await supabase.from('profiles')
      .select('id')
      .eq('role', 'citizen')
      .limit(1)
      .single()).data!.id;
    const villageId = villages[Math.floor(Math.random() * villages.length)];
    const wardId = wards[Math.floor(Math.random() * wards.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000); // within last 60 days
    const deadline = new Date(createdAt);
    deadline.setDate(deadline.getDate() + 14);
    await supabase.from('complaints').insert({
      title: `${category} issue #${i}`,
      description: `Demo description for ${category} complaint number ${i}.`,
      category,
      status,
      citizen_id: citizenId,
      village_id: villageId,
      ward_id: wardId,
      resolution_deadline: deadline.toISOString(),
      created_at: createdAt.toISOString(),
    });
  }

  console.log('Demo data seeded successfully');
}

main().catch((e) => console.error(e));

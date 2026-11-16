// app/my-complaints/page.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { LucideFileText } from 'lucide-react';
import { Complaint } from '@/types';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      if (!profile) return;
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('citizen_id', profile.id)
        .order('created_at', { ascending: false });
      if (!error) setComplaints(data as Complaint[]);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <p>Loading your complaints...</p>;

  return (
    <section className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-primary">My Complaints</h1>
      {complaints.length === 0 ? (
        <p>No complaints submitted yet.</p>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Title</th>
              <th className="p-2">Category</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="p-2 text-sm">{c.id.slice(0, 8)}</td>
                <td className="p-2">{c.title}</td>
                <td className="p-2">{c.category}</td>
                <td className="p-2 capitalize">{c.status.replace('_', ' ')}</td>
                <td className="p-2 text-sm">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="p-2">
                  <Link href={`/track?complaintId=${c.id}`} className="text-primary hover:underline flex items-center">
                    <LucideFileText size={16} className="mr-1" /> Track
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

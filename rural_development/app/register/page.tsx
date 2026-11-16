// app/register/page.tsx
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [villageId, setVillageId] = useState('');
  const [error, setError] = useState('');
  const [villages, setVillages] = useState<Array<{ id: string; name: string }>>([]);

  // Load villages for selector (demo only – fetch first 20)
  React.useEffect(() => {
    supabase
      .from('villages')
      .select('id, name')
      .limit(20)
      .then(({ data }) => {
        if (data) setVillages(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    // After sign‑up, Supabase creates a user record. We create a profile entry.
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        auth_user_id: user.id,
        name,
        village_id: villageId || null,
        role: 'citizen',
        language: 'en',
      });
      if (profileError) {
        setError(profileError.message);
        return;
      }
    }
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4 text-primary">Register</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <label className="block mb-1">Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border mb-3"
        />
        <label className="block mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border mb-3"
        />
        <label className="block mb-1">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border mb-3"
        />
        <label className="block mb-1">Village (optional)</label>
        <select
          value={villageId}
          onChange={(e) => setVillageId(e.target.value)}
          className="w-full p-2 border mb-4"
        >
          <option value="">Select a village</option>
          {villages.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-secondary">
          Register
        </button>
        <p className="mt-4 text-sm">
          Already have an account? <a href="/login" className="text-primary hover:underline">Login</a>
        </p>
      </form>
    </div>
  );
}

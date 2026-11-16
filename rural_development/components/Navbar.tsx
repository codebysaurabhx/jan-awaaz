import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LucideLogOut } from 'lucide-react';
import { signOut } from '@/lib/auth';

export const Navbar = async () => {
  const user = await supabase.auth.getUser();
  const isLoggedIn = !!(await user).data.user;
  return (
    <nav className="bg-primary text-white flex items-center justify-between px-4 py-2">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold">
          JANAWAAZ
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <form action={signOut}>
            <button type="submit" className="flex items-center space-x-1 text-white hover:opacity-80">
              <LucideLogOut size={18} />
              <span>Logout</span>
            </button>
          </form>
        ) : (
          <Link href="/login" className="hover:opacity-80">Login</Link>
        )}
      </div>
    </nav>
  );
};

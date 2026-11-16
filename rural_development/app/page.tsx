// app/page.tsx
import Link from 'next/link';
import { LucideHome, LucideMegaphone } from 'lucide-react';

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-background text-text p-4">
      <h1 className="text-4xl font-bold text-primary mb-4">JANAWAAZ</h1>
      <p className="text-xl mb-8">Har Gaon Ki Awaaz, Har Insaan Ka Haq.</p>
      <div className="flex space-x-4">
        <Link
          href="/complaint/new"
          className="bg-primary text-white px-6 py-3 rounded hover:bg-secondary flex items-center"
        >
          <LucideMegaphone size={20} className="mr-2" /> Raise Your Voice
        </Link>
        <Link
          href="/track"
          className="bg-secondary text-white px-6 py-3 rounded hover:bg-primary flex items-center"
        >
          Track Your Complaint
        </Link>
      </div>
    </section>
  );
}

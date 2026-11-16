// app/complaint/new/page.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LucideUpload, LucideMic, LucideMapPin } from 'lucide-react';
import { aiFallback } from '@/lib/aiFallback';

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

export default function NewComplaintPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [villageId, setVillageId] = useState('');
  const [wardId, setWardId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [villages, setVillages] = useState<Array<{ id: string; name: string }>>([]);
  const [wards, setWards] = useState<Array<{ id: string; name: string }>>([]);
  const [suggested, setSuggested] = useState<{ category: string; department: string } | null>(null);

  useEffect(() => {
    supabase.from('villages').select('id, name').limit(100).then(({ data }) => data && setVillages(data));
  }, []);

  useEffect(() => {
    if (villageId) {
      supabase.from('wards').select('id, name').eq('village_id', villageId).then(({ data }) => data && setWards(data));
    }
  }, [villageId]);

  // Simple voice capture using Web Speech API (fallback works in Chrome)
  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition not supported in this browser');
    const recognizer = new SpeechRecognition();
    recognizer.lang = 'en-IN'; // default – user can change language manually later
    recognizer.interimResults = false;
    recognizer.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(transcript);
      setDescription((prev) => (prev ? prev + '\n' + transcript : transcript));
    };
    recognizer.start();
  };

  const getLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition((pos) => {
      setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  };

  const handleAIHelp = async () => {
    const result = await aiFallback(description || voiceText);
    setSuggested({ category: result.suggestedCategory, department: result.department });
    setCategory(result.suggestedCategory);
    setDescription(result.summary);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (category) formData.append('category', category);
    formData.append('villageId', villageId);
    if (wardId) formData.append('wardId', wardId);
    formData.append('isAnonymous', String(isAnonymous));
    if (photo) formData.append('photo', photo);
    if (gps) formData.append('gpsLat', String(gps.lat));
    if (gps) formData.append('gpsLng', String(gps.lng));

    const res = await fetch('/api/complaints', { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok) {
      router.push('/my-complaints');
    } else {
      alert(data.error || 'Failed to submit');
    }
  };

  return (
    <section className="max-w-3xl mx-auto p-4 bg-white rounded shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4 text-primary">Raise a Complaint</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block mb-1">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex space-x-2 mb-3">
          <button type="button" onClick={startVoice} className="flex items-center bg-secondary text-white px-3 py-1 rounded hover:bg-primary">
            <LucideMic size={16} className="mr-1" /> Voice Input
          </button>
          <button type="button" onClick={getLocation} className="flex items-center bg-secondary text-white px-3 py-1 rounded hover:bg-primary">
            <LucideMapPin size={16} className="mr-1" /> Capture Location
          </button>
          <button type="button" onClick={handleAIHelp} className="flex items-center bg-secondary text-white px-3 py-1 rounded hover:bg-primary">
            AI Suggest Category
          </button>
        </div>
        {suggested && (
          <p className="text-sm text-gray-600 mb-2">
            AI suggests <strong>{suggested.category}</strong> (Dept: {suggested.department})
          </p>
        )}
        <div className="mb-3">
          <label className="block mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select (optional)</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="block mb-1">Village</label>
          <select
            required
            value={villageId}
            onChange={(e) => setVillageId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select village</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        {wards.length > 0 && (
          <div className="mb-3">
            <label className="block mb-1">Ward / Locality</label>
            <select
              value={wardId}
              onChange={(e) => setWardId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select ward</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-3 flex items-center">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          <span className="ml-2">Submit anonymously</span>
        </div>
        <div className="mb-3">
          <label className="block mb-1">Photo / Video (optional)</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          />
        </div>
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary">
          Submit Complaint
        </button>
      </form>
    </section>
  );
}

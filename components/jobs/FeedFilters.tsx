'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';

export function FeedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ctcBucket = searchParams.get('ctc') || 'All';
  const roleCategory = searchParams.get('role') || 'All';
  const searchQuery = searchParams.get('q') || '';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <section className="mb-6 flex flex-wrap gap-3 items-center sticky top-0 bg-bg-base/80 backdrop-blur-md z-30 py-3 border-b border-white/5">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => updateParam('q', e.target.value)}
          placeholder="Search roles or companies..." 
          className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-accent-500 transition-colors placeholder:text-gray-500"
        />
      </div>
      
      <select 
        value={ctcBucket}
        onChange={(e) => updateParam('ctc', e.target.value)}
        className="bg-white/5 border border-white/10 rounded-md py-2 px-3 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
      >
        <option value="All">CTC: All</option>
        <option value="<5">&lt; 5 LPA</option>
        <option value="5-10">5 - 10 LPA</option>
        <option value="10-20">10 - 20 LPA</option>
        <option value="20+">20+ LPA</option>
      </select>
      
      <select 
        value={roleCategory}
        onChange={(e) => updateParam('role', e.target.value)}
        className="bg-white/5 border border-white/10 rounded-md py-2 px-3 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
      >
        <option value="All">Role: All</option>
        <option value="Frontend">Frontend</option>
        <option value="Backend">Backend</option>
        <option value="Fullstack">Fullstack</option>
        <option value="Data">Data</option>
      </select>
      
      <button className="p-2 rounded-md bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
        <SlidersHorizontal size={16} />
      </button>
    </section>
  );
}

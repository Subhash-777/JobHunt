'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Bell, MapPin, Tag, Briefcase } from 'lucide-react';

interface Watchlist {
  id: string;
  name: string;
  keywords: string[];
  locations: string[];
  employment_type: string;
  active: boolean;
  created_at: string;
}

interface WatchlistClientProps {
  initialWatchlists: Watchlist[];
}

export function WatchlistClient({ initialWatchlists }: WatchlistClientProps) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>(initialWatchlists);
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [locations, setLocations] = useState('');
  const [employmentType, setEmploymentType] = useState('any');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const keywordsArray = keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      const locationsArray = locations
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      const res = await fetch('/api/watchlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          keywords: keywordsArray,
          locations: locationsArray,
          employment_type: employmentType,
        }),
      });

      if (res.ok) {
        const newWatchlist = await res.json();
        setWatchlists((prev) => [newWatchlist, ...prev]);
        setName('');
        setKeywords('');
        setLocations('');
        setEmploymentType('any');
      }
    } catch (err) {
      console.error('Error creating watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/watchlists/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWatchlists((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (err) {
      console.error('Error deleting watchlist:', err);
    }
  };

  return (
    <main className="min-h-screen max-w-4xl mx-auto p-4 pt-10 pb-20 text-gray-200">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 mb-2">
          <Bell className="text-accent-500" />
          Job Watchlists
        </h1>
        <p className="text-gray-400">
          Create watchlists to track matches and get automatic deadline calendar events when new jobs open.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Watchlist creation form */}
        <section className="bg-bg-surface border border-white/5 rounded-xl p-5 h-fit md:col-span-1 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus size={16} className="text-accent-500" />
            Create Watchlist
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-semibold">
                Watchlist Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., SDE Bangalore Interns"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-semibold">
                Keywords (comma separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="React, node, django"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-semibold">
                Locations (comma separated)
              </label>
              <input
                type="text"
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                placeholder="Bangalore, remote"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-semibold">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
              >
                <option value="any">Any Type</option>
                <option value="internship">Internship</option>
                <option value="full_time">Full Time</option>
                <option value="contract">Contract</option>
                <option value="part_time">Part Time</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm py-2.5 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Creating...' : 'Create Watchlist'}
            </button>
          </form>
        </section>

        {/* Watchlist display list */}
        <section className="md:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Active Watchlists ({watchlists.length})
          </h3>

          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {watchlists.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border border-dashed border-white/5 rounded-xl p-10 text-center text-gray-500"
                >
                  No watchlists configured yet. Create one on the left to start tracking match alerts.
                </motion.div>
              ) : (
                watchlists.map((wl) => (
                  <motion.div
                    key={wl.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="job-card bg-bg-surface border border-white/5 p-5 rounded-xl flex justify-between items-start gap-4 transition-all"
                  >
                    <div className="flex-1 flex flex-col gap-3">
                      <div>
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                          {wl.name}
                          <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active" />
                        </h4>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                          Created {new Date(wl.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        {wl.keywords && wl.keywords.length > 0 && (
                          <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md text-gray-300">
                            <Tag size={12} className="text-accent-500" />
                            {wl.keywords.join(', ')}
                          </span>
                        )}
                        {wl.locations && wl.locations.length > 0 && (
                          <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md text-gray-300">
                            <MapPin size={12} className="text-accent-500" />
                            {wl.locations.join(', ')}
                          </span>
                        )}
                        {wl.employment_type && wl.employment_type !== 'any' && (
                          <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md text-gray-300 capitalize">
                            <Briefcase size={12} className="text-accent-500" />
                            {wl.employment_type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(wl.id)}
                      className="p-2 border border-red-500/10 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-lg transition-all flex-shrink-0"
                      title="Delete Watchlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </main>
  );
}

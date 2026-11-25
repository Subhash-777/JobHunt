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
      const keywordsArray = keywords.split(',').map((k) => k.trim()).filter(Boolean);
      const locationsArray = locations.split(',').map((l) => l.trim()).filter(Boolean);

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
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <header className="pb-4 border-b border-border-subtle">
        <h1 className="text-2xl font-display font-extrabold text-text-primary flex items-center gap-2">
          <Bell className="w-6 h-6 text-accent-500" />
          <span>Job Watchlists</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Create keyword & location alerts and automatically sync new matches to Google Calendar.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Watchlist creation form */}
        <section className="bg-bg-surface border border-border-subtle rounded-2xl p-5 h-fit md:col-span-1 shadow-2xs">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus size={16} className="text-accent-500" />
            Create Watchlist
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="wl-name" className="block text-[11px] text-text-secondary font-semibold mb-1.5">
                Watchlist Name
              </label>
              <input
                id="wl-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., SDE Bangalore Interns"
                className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="wl-keywords" className="block text-[11px] text-text-secondary font-semibold mb-1.5">
                Keywords (comma separated)
              </label>
              <input
                id="wl-keywords"
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="React, Node, Python"
                className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label htmlFor="wl-locations" className="block text-[11px] text-text-secondary font-semibold mb-1.5">
                Locations (comma separated)
              </label>
              <input
                id="wl-locations"
                type="text"
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                placeholder="Bengaluru, Remote"
                className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label htmlFor="wl-type" className="block text-[11px] text-text-secondary font-semibold mb-1.5">
                Employment Type
              </label>
              <select
                id="wl-type"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white transition-colors"
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
              className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors shadow-xs"
            >
              {loading ? 'Creating...' : 'Create Watchlist'}
            </button>
          </form>
        </section>

        {/* Watchlist display list */}
        <section className="md:col-span-2 flex flex-col gap-4">
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
            Active Watchlists ({watchlists.length})
          </h2>

          <div className="flex flex-col gap-3.5">
            <AnimatePresence mode="wait">
              {watchlists.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-bg-surface border border-dashed border-border-default rounded-2xl p-10 text-center text-xs text-text-tertiary"
                >
                  No watchlists configured yet. Create one on the left to start tracking matches.
                </motion.div>
              ) : (
                watchlists.map((wl) => (
                  <motion.div
                    key={wl.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="job-card p-5 flex justify-between items-start gap-4"
                  >
                    <div className="flex-1 flex flex-col gap-3">
                      <div>
                        <h3 className="text-base font-display font-bold text-text-primary flex items-center gap-2">
                          {wl.name}
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
                        </h3>
                        <span className="text-[11px] text-text-tertiary">
                          Created {new Date(wl.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        {wl.keywords && wl.keywords.length > 0 && (
                          <span className="flex items-center gap-1.5 bg-bg-elevated border border-border-subtle px-2.5 py-1 rounded-lg text-text-secondary font-medium">
                            <Tag size={12} className="text-accent-500" />
                            {wl.keywords.join(', ')}
                          </span>
                        )}
                        {wl.locations && wl.locations.length > 0 && (
                          <span className="flex items-center gap-1.5 bg-bg-elevated border border-border-subtle px-2.5 py-1 rounded-lg text-text-secondary font-medium">
                            <MapPin size={12} className="text-accent-500" />
                            {wl.locations.join(', ')}
                          </span>
                        )}
                        {wl.employment_type && wl.employment_type !== 'any' && (
                          <span className="flex items-center gap-1.5 bg-bg-elevated border border-border-subtle px-2.5 py-1 rounded-lg text-text-secondary capitalize font-medium">
                            <Briefcase size={12} className="text-accent-500" />
                            {wl.employment_type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(wl.id)}
                      className="p-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all shrink-0"
                      title="Delete Watchlist"
                      aria-label="Delete watchlist"
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
    </div>
  );
}

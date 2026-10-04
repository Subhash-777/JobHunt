'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Plus, Clock, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OATrackerClientProps {
  initialLogs: any[];
  initialPatterns: any[];
}

export default function OATrackerClient({ initialLogs, initialPatterns }: OATrackerClientProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'patterns'>('logs');
  const [logs, setLogs] = useState(initialLogs);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    role_title: '',
    platform: 'HackerRank',
    topics: '',
    difficulty: 'Medium',
    duration_minutes: '60',
    outcome: 'Pending',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/community/oa-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          topics: formData.topics.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setLogs([data.data, ...logs]);
      setShowModal(false);
      toast.success('OA attempt logged successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to log OA');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Code2 className="w-6 h-6 text-accent-500" />
            <span>Online Assessment (OA) Tracker</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Track HackerRank, Mettl, and AMCAT coding assessment rounds and company test patterns.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white text-xs font-bold rounded-xl shadow-md shadow-accent-500/20 transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Log OA Attempt</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-border-subtle pb-3">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === 'logs' ? 'bg-accent-500 text-white' : 'text-text-secondary hover:text-text-primary bg-bg-surface'
          }`}
        >
          My Logs ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === 'patterns' ? 'bg-accent-500 text-white' : 'text-text-secondary hover:text-text-primary bg-bg-surface'
          }`}
        >
          Company Test Patterns ({initialPatterns.length})
        </button>
      </div>

      {activeTab === 'logs' ? (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="py-16 text-center bg-bg-surface border border-border-subtle rounded-2xl p-8 text-xs text-text-tertiary">
              No OA attempts logged yet. Click "Log OA Attempt" to track your test topics and difficulty!
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 bg-bg-surface border border-border-subtle rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-text-primary">{log.company_name}</span>
                    <span className="text-[10px] font-mono text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded border border-accent-500/20">
                      {log.platform}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{log.role_title} · {log.duration_minutes} mins</p>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-mono text-text-tertiary">{log.difficulty}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    log.outcome === 'Passed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {log.outcome}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialPatterns.length === 0 ? (
            <div className="col-span-2 py-16 text-center bg-bg-surface border border-border-subtle rounded-2xl p-8 text-xs text-text-tertiary">
              Company patterns will unlock when 3+ attempts are logged per target company.
            </div>
          ) : (
            initialPatterns.map((pat) => (
              <div key={pat.id} className="p-5 bg-bg-surface border border-border-subtle rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-accent-400">{pat.company_name}</h4>
                <p className="text-xs text-text-secondary">{pat.pattern_summary}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Log Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-text-primary">Log Online Assessment</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-secondary mb-1">Company Name</label>
                <input
                  required
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g. Swiggy"
                  className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-text-secondary mb-1">Role Title</label>
                <input
                  required
                  value={formData.role_title}
                  onChange={e => setFormData({ ...formData, role_title: e.target.value })}
                  placeholder="e.g. Software Engineer Intern"
                  className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-text-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-text-secondary mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={e => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-text-secondary"
                  >
                    <option value="HackerRank">HackerRank</option>
                    <option value="Mettl">Mettl</option>
                    <option value="AMCAT">AMCAT</option>
                    <option value="Cocubes">Cocubes</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary mb-1">Topics Tested (comma separated)</label>
                <input
                  value={formData.topics}
                  onChange={e => setFormData({ ...formData, topics: e.target.value })}
                  placeholder="e.g. Dynamic Programming, Trees, SQL"
                  className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-text-primary"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-bg-elevated text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-500 text-white font-bold"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

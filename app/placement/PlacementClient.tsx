'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, Flame, Building2, Calendar as CalendarIcon, CheckCircle2, ShieldCheck, Sparkles, ExternalLink, Plus, MapPin, DollarSign, AlertCircle, Ban } from 'lucide-react';
import { CalendarQuickAdd } from '@/components/shared/CalendarQuickAdd';
import { toast } from 'sonner';

interface CampusDrive {
  id: string;
  company: string;
  company_logo?: string;
  role_title: string;
  drive_type: string;
  eligible_batches?: number[];
  eligible_degrees?: string[];
  cgpa_cutoff?: number;
  registration_url: string;
  deadline?: string;
  drive_date?: string;
  location?: string;
  stipend_ctc_text?: string;
  bond_flag?: boolean;
}

interface PlacementClientProps {
  profile: any;
  collegeHires: any[];
  eligibleCount: number;
}

export default function PlacementClient({ profile, collegeHires, eligibleCount }: PlacementClientProps) {
  const [placementMode, setPlacementMode] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<number>(profile?.graduation_year || 2026);
  const [drives, setDrives] = useState<CampusDrive[]>([]);
  const [loadingDrives, setLoadingDrives] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  // Report form state
  const [formCompany, setFormCompany] = useState('');
  const [formRole, setFormRole] = useState('Systems Engineer');
  const [formDriveType, setFormDriveType] = useState('off_campus');
  const [formRegUrl, setFormRegUrl] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formLocation, setFormLocation] = useState('Pan-India');
  const [formStipend, setFormStipend] = useState('₹4.5 - 7 LPA');
  const [formCgpa, setFormCgpa] = useState('6.0');
  const [formBond, setFormBond] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userCollege = profile?.college || 'Your College';

  useEffect(() => {
    fetchDrives();
  }, []);

  async function fetchDrives() {
    try {
      setLoadingDrives(true);
      const res = await fetch('/api/placement/drives');
      const data = await res.json();
      if (data.drives) {
        setDrives(data.drives);
      }
    } catch (err) {
      console.error('Failed to fetch drives:', err);
    } finally {
      setLoadingDrives(false);
    }
  }

  async function handleReportDrive(e: React.FormEvent) {
    e.preventDefault();
    if (!formCompany.trim() || !formRegUrl.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/placement/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: formCompany,
          role_title: formRole,
          drive_type: formDriveType,
          registration_url: formRegUrl,
          deadline: formDeadline ? new Date(formDeadline).toISOString() : null,
          location: formLocation,
          stipend_ctc_text: formStipend,
          cgpa_cutoff: formCgpa ? Number(formCgpa) : null,
          bond_flag: formBond,
          eligible_batches: [selectedBatch],
          eligible_degrees: ['B.Tech', 'BE']
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Campus drive submitted!');
        setShowReportModal(false);
        setFormCompany('');
        setFormRegUrl('');
        fetchDrives();
      } else {
        toast.error(data.error || 'Failed to report drive.');
      }
    } catch (err: any) {
      toast.error('Network error submitting drive.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header & Toggle */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-tertiary-50 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-saffron-400" />
              <span>Placement Season Mode</span>
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-saffron-500/10 text-saffron-400 border border-saffron-500/20">
              Active Season
            </span>
          </div>
          <p className="text-xs text-tertiary-400 mt-1">
            Off-campus drive aggregator & campus placement tracker for Indian tech graduates.
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => setShowReportModal(true)}
          className="px-4 py-2.5 bg-saffron-500 hover:bg-saffron-400 text-surface-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report a Drive</span>
        </button>
      </div>

      {/* Batch Selector & Stats Strip */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-tertiary-400">Select Graduation Batch:</span>
          {[2025, 2026, 2027].map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBatch(b)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedBatch === b
                  ? 'bg-saffron-500 text-surface-950 shadow-sm'
                  : 'bg-surface-900 text-tertiary-300 border border-surface-800 hover:text-white'
              }`}
            >
              {b} Batch {profile?.graduation_year === b && '(Yours)'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800 space-y-1">
            <span className="text-[10px] font-semibold text-tertiary-400 uppercase tracking-wider">Active Drives</span>
            <p className="text-2xl font-extrabold font-mono text-tertiary-100">{drives.length || eligibleCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800 space-y-1">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Bond-Free Roles</span>
            <p className="text-2xl font-extrabold font-mono text-emerald-400">
              {drives.filter(d => !d.bond_flag).length || 18}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800 space-y-1">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Off-Campus</span>
            <p className="text-2xl font-extrabold font-mono text-amber-400">
              {drives.filter(d => d.drive_type === 'off_campus').length || 14}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800 space-y-1">
            <span className="text-[10px] font-semibold text-saffron-400 uppercase tracking-wider">PPO Likely</span>
            <p className="text-2xl font-extrabold font-mono text-saffron-400">9</p>
          </div>
        </div>
      </div>

      {/* Off-Campus Drive Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-tertiary-100 uppercase tracking-wider flex items-center gap-2">
          <Flame className="w-4 h-4 text-saffron-400" />
          <span>Active Off-Campus Recruitment Drives</span>
        </h2>

        {loadingDrives ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-44 rounded-2xl bg-surface-900/40 animate-pulse border border-surface-800" />
            ))}
          </div>
        ) : drives.length === 0 ? (
          <div className="text-center py-12 bg-surface-900/30 rounded-2xl border border-surface-800 p-8 text-xs text-tertiary-400">
            No drives submitted for the selected batch. Be the first to report an off-campus drive!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.map((drive) => {
              const deadlineDate = drive.deadline ? new Date(drive.deadline) : null;
              const daysLeft = deadlineDate 
                ? Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div
                  key={drive.id}
                  className="bg-surface-900/70 border border-surface-800 hover:border-surface-700 rounded-2xl p-5 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Company & Type Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center font-bold text-saffron-400 text-sm">
                          {drive.company_logo ? (
                            <img src={drive.company_logo} alt={drive.company} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            drive.company.charAt(0)
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-tertiary-100">{drive.company}</h3>
                          <p className="text-xs font-medium text-tertiary-300">{drive.role_title}</p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 capitalize">
                        🔵 {drive.drive_type.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Eligibility details */}
                    <div className="mt-3 text-xs text-tertiary-400 flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-surface-800 text-tertiary-200 font-mono">
                        {(drive.eligible_batches || [2025, 2026]).join(' · ')} batch
                      </span>
                      <span>·</span>
                      <span>{(drive.eligible_degrees || ['B.Tech', 'BE']).join('/')}</span>
                      {drive.cgpa_cutoff && (
                        <>
                          <span>·</span>
                          <span className="text-tertiary-300 font-medium">CGPA {drive.cgpa_cutoff}+</span>
                        </>
                      )}
                    </div>

                    {/* Location, CTC & Bond */}
                    <div className="mt-2 text-xs text-tertiary-300 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-tertiary-400" />
                        {drive.location || 'Pan-India'}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-saffron-400">
                        💰 {drive.stipend_ctc_text || 'Competitive'}
                      </span>
                      {drive.bond_flag ? (
                        <span className="text-rose-400 flex items-center gap-1 text-[11px]">
                          <AlertCircle className="w-3 h-3" /> Service Bond
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                          🚫 No bond
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Action & Deadline */}
                  <div className="pt-3 border-t border-surface-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    {deadlineDate ? (
                      <span className="text-rose-400 font-medium flex items-center gap-1">
                        🔴 Closes: {deadlineDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        {daysLeft !== null && ` (${daysLeft > 0 ? `${daysLeft} days left` : 'Today'})`}
                      </span>
                    ) : (
                      <span className="text-tertiary-400">Open until filled</span>
                    )}

                    <div className="flex items-center gap-2">
                      {/* Google Calendar Quick Add for drive deadline */}
                      <CalendarQuickAdd
                        job={{
                          title: `Drive Deadline: ${drive.company} (${drive.role_title})`,
                          company: drive.company,
                          deadline: drive.deadline,
                          apply_url: drive.registration_url,
                          source_url: drive.registration_url
                        } as any}
                      />

                      <a
                        href={drive.registration_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-saffron-500 hover:bg-saffron-400 text-surface-950 font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm"
                        aria-label={`Register for drive at ${drive.company}`}
                      >
                        Register <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Report a Drive */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <h3 className="text-lg font-bold text-tertiary-50">Report an Off-Campus Drive</h3>
            <form onSubmit={handleReportDrive} className="space-y-3 text-xs">
              <div>
                <label className="block text-tertiary-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formCompany}
                  onChange={e => setFormCompany(e.target.value)}
                  placeholder="e.g. Infosys, TCS, Wipro"
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-tertiary-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-tertiary-300 mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={formRole}
                  onChange={e => setFormRole(e.target.value)}
                  placeholder="e.g. Systems Engineer / Specialist Programmer"
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-tertiary-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-tertiary-300 mb-1">Registration Link (URL) *</label>
                <input
                  type="url"
                  required
                  value={formRegUrl}
                  onChange={e => setFormRegUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-tertiary-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-tertiary-300 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={e => setFormDeadline(e.target.value)}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-tertiary-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-tertiary-300 mb-1">Package CTC Text</label>
                  <input
                    type="text"
                    value={formStipend}
                    onChange={e => setFormStipend(e.target.value)}
                    placeholder="e.g. ₹3.6 - 5 LPA"
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-tertiary-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-tertiary-400 hover:text-tertiary-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-saffron-500 hover:bg-saffron-400 text-surface-950 font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, Flame, Plus, MapPin, AlertCircle, ExternalLink } from 'lucide-react';
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

export default function PlacementClient({ profile, eligibleCount }: PlacementClientProps) {
  const [selectedBatch, setSelectedBatch] = useState<number>(profile?.graduation_year || 2026);
  const [drives, setDrives] = useState<CampusDrive[]>([]);
  const [loadingDrives, setLoadingDrives] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  const [formCompany, setFormCompany] = useState('');
  const [formRole, setFormRole] = useState('Systems Engineer');
  const [formDriveType, setFormDriveType] = useState('off_campus');
  const [formRegUrl, setFormRegUrl] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formLocation] = useState('Pan-India');
  const [formStipend, setFormStipend] = useState('₹4.5 - 7 LPA');
  const [formCgpa] = useState('6.0');
  const [formBond] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    } catch {
      toast.error('Network error submitting drive.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/50 border border-border-subtle rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-display font-extrabold text-text-primary flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-accent-500" />
              <span>Placement Season & Off-Campus Drives</span>
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Active Season
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Off-campus drive aggregator & campus placement tracker for Indian engineering graduates.
          </p>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report a Drive</span>
        </button>
      </div>

      {/* Batch Selector & Stats Strip */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-text-secondary mr-1">Graduation Batch:</span>
          {[2025, 2026, 2027].map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBatch(b)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedBatch === b
                  ? 'bg-accent-500 text-white border-accent-500 shadow-xs'
                  : 'bg-white text-text-secondary border-border-subtle hover:border-border-default hover:text-text-primary'
              }`}
            >
              {b} Batch {profile?.graduation_year === b && '(Yours)'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-bg-surface border border-border-subtle shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Active Drives</span>
            <p className="text-2xl font-display font-extrabold text-text-primary">{drives.length || eligibleCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-bg-surface border border-border-subtle shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Bond-Free Roles</span>
            <p className="text-2xl font-display font-extrabold text-emerald-700">
              {drives.filter(d => !d.bond_flag).length || 0}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-bg-surface border border-border-subtle shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Off-Campus</span>
            <p className="text-2xl font-display font-extrabold text-amber-700">
              {drives.filter(d => d.drive_type === 'off_campus').length || 0}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-bg-surface border border-border-subtle shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-accent-600 uppercase tracking-wider">PPO Eligible</span>
            <p className="text-2xl font-display font-extrabold text-accent-600">{eligibleCount}</p>
          </div>
        </div>
      </div>

      {/* Off-Campus Drive Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Active Off-Campus Recruitment Drives</span>
        </h2>

        {loadingDrives ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-44 rounded-2xl bg-bg-surface animate-pulse border border-border-subtle" />
            ))}
          </div>
        ) : drives.length === 0 ? (
          <div className="text-center py-12 bg-bg-surface rounded-2xl border border-border-subtle p-8 text-xs sm:text-sm text-text-secondary">
            No drives submitted for the selected batch yet. Click &ldquo;Report a Drive&rdquo; to share one!
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
                  className="job-card p-5 space-y-3.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-accent-50 border border-accent-100 flex items-center justify-center font-display font-bold text-accent-600 text-sm shrink-0">
                          {drive.company_logo ? (
                            <img src={drive.company_logo} alt={drive.company} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            drive.company.charAt(0)
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-display font-bold text-text-primary">{drive.company}</h3>
                          <p className="text-xs font-medium text-text-secondary">{drive.role_title}</p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent-50 text-accent-600 border border-accent-100 capitalize">
                        {drive.drive_type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-text-secondary flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-bg-elevated text-text-primary font-mono font-medium">
                        {(drive.eligible_batches || [2025, 2026]).join(' · ')} batch
                      </span>
                      <span>·</span>
                      <span>{(drive.eligible_degrees || ['B.Tech', 'BE']).join('/')}</span>
                      {drive.cgpa_cutoff && (
                        <>
                          <span>·</span>
                          <span className="font-semibold text-text-primary">CGPA {drive.cgpa_cutoff}+</span>
                        </>
                      )}
                    </div>

                    <div className="mt-2.5 text-xs text-text-secondary flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-text-tertiary" />
                        {drive.location || 'Pan-India'}
                      </span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {drive.stipend_ctc_text || 'Competitive'}
                      </span>
                      {drive.bond_flag ? (
                        <span className="text-rose-600 flex items-center gap-1 text-[11px] font-medium">
                          <AlertCircle className="w-3 h-3" /> Service Bond
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-[11px] font-medium">
                          No Bond
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    {deadlineDate ? (
                      <span className="text-rose-600 font-semibold">
                        Closes: {deadlineDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        {daysLeft !== null && ` (${daysLeft > 0 ? `${daysLeft}d left` : 'Today'})`}
                      </span>
                    ) : (
                      <span className="text-text-tertiary">Open until filled</span>
                    )}

                    <div className="flex items-center gap-2">
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
                        className="px-3.5 py-1.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-all flex items-center gap-1 shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-lg font-display font-bold text-text-primary">Report an Off-Campus Drive</h2>
            <form onSubmit={handleReportDrive} className="space-y-3 text-xs">
              <div>
                <label htmlFor="drv-comp" className="block font-semibold text-text-secondary mb-1">Company Name *</label>
                <input
                  id="drv-comp"
                  type="text"
                  required
                  value={formCompany}
                  onChange={e => setFormCompany(e.target.value)}
                  placeholder="e.g. Infosys, TCS, Wipro"
                  className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="drv-role" className="block font-semibold text-text-secondary mb-1">Role Title *</label>
                <input
                  id="drv-role"
                  type="text"
                  required
                  value={formRole}
                  onChange={e => setFormRole(e.target.value)}
                  placeholder="e.g. Systems Engineer"
                  className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="drv-type" className="block font-semibold text-text-secondary mb-1">Drive Type</label>
                <select
                  id="drv-type"
                  value={formDriveType}
                  onChange={e => setFormDriveType(e.target.value)}
                  className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
                >
                  <option value="off_campus">Off-Campus</option>
                  <option value="pool_campus">Pool Campus</option>
                  <option value="mass_recruitment">Mass Recruitment</option>
                </select>
              </div>

              <div>
                <label htmlFor="drv-url" className="block font-semibold text-text-secondary mb-1">Registration Link (URL) *</label>
                <input
                  id="drv-url"
                  type="url"
                  required
                  value={formRegUrl}
                  onChange={e => setFormRegUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="drv-dl" className="block font-semibold text-text-secondary mb-1">Deadline Date</label>
                  <input
                    id="drv-dl"
                    type="date"
                    value={formDeadline}
                    onChange={e => setFormDeadline(e.target.value)}
                    className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="drv-ctc" className="block font-semibold text-text-secondary mb-1">Package CTC</label>
                  <input
                    id="drv-ctc"
                    type="text"
                    value={formStipend}
                    onChange={e => setFormStipend(e.target.value)}
                    placeholder="e.g. ₹4.5 – 7 LPA"
                    className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-bg-elevated text-text-secondary hover:text-text-primary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl shadow-xs disabled:opacity-50"
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

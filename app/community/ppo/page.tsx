'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2, Search, Plus, TrendingUp, ShieldCheck, CheckCircle2, XCircle,
  Sparkles, Filter, ChevronRight, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanyPPO {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  ppo_rate: number;
  ppo_reports: number;
  industry?: string;
  hq_location?: string;
}

export default function PPOTrackerPage() {
  const [companies, setCompanies] = useState<CompanyPPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [minRateFilter, setMinRateFilter] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);

  const [modalCompany, setModalCompany] = useState('');
  const [modalRole, setModalRole] = useState('SDE Intern');
  const [modalYear, setModalYear] = useState('2025');
  const [modalGotPPO, setModalGotPPO] = useState(true);
  const [modalStipend, setModalStipend] = useState('');
  const [modalCtc, setModalCtc] = useState('');
  const [modalLocation] = useState('Bengaluru');
  const [modalAnonymous, setModalAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetchPPOData();
  }, [minRateFilter]);

  async function fetchPPOData() {
    try {
      setLoading(true);
      const res = await fetch(`/api/community/ppo?minRate=${minRateFilter}`);
      const data = await res.json();
      if (data.companies) {
        setCompanies(data.companies);
      }
    } catch (err) {
      console.error('Failed to fetch PPO data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (modalCompany.trim().length >= 2) {
      fetch(`/api/jobs/search-companies?q=${encodeURIComponent(modalCompany)}`)
        .then(res => res.json())
        .then(data => {
          if (data.companies) setSuggestions(data.companies.slice(0, 5));
        })
        .catch(() => {});
    } else {
      setSuggestions([]);
    }
  }, [modalCompany]);

  async function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!modalCompany.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/community/ppo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: modalCompany.trim(),
          role: modalRole,
          year: modalYear,
          gotPPO: modalGotPPO,
          stipend: modalStipend ? Number(modalStipend) : null,
          ctc: modalCtc ? Number(modalCtc) : null,
          location: modalLocation,
          anonymous: modalAnonymous
        })
      });

      if (res.ok) {
        setSuccessMessage('Thank you! Your PPO outcome report has been recorded.');
        setTimeout(() => {
          setShowReportModal(false);
          setSuccessMessage('');
          fetchPPOData();
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit PPO report:', err);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-subtle pb-5">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent-50 text-accent-600 border border-accent-100 mb-2">
            Community Flywheel
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-text-primary flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-accent-500" />
            PPO Tracker
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">
            Companies known to convert interns to full-time roles — crowdsourced from Indian tech graduates.
          </p>
        </div>

        <button
          onClick={() => {
            setModalCompany('');
            setShowReportModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs"
          aria-label="Report PPO Outcome"
        >
          <Plus className="w-4 h-4" />
          Report PPO Outcome
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-bg-surface p-3.5 rounded-2xl border border-border-subtle shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search company..."
            aria-label="Search company"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-bg-elevated/60 border border-border-subtle rounded-xl text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 bg-bg-elevated/60 px-3 py-2 border border-border-subtle rounded-xl">
          <Filter className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
          <select
            aria-label="Minimum PPO rate"
            value={minRateFilter}
            onChange={(e) => setMinRateFilter(Number(e.target.value))}
            className="w-full bg-transparent text-xs text-text-primary focus:outline-none cursor-pointer"
          >
            <option value={0}>All PPO Rates</option>
            <option value={50}>50%+ Conversion</option>
            <option value={70}>70%+ Conversion</option>
            <option value={85}>85%+ Conversion</option>
          </select>
        </div>

        <div className="col-span-1 sm:col-span-2 flex items-center justify-end gap-3 text-xs text-text-secondary px-2">
          <span>Showing <strong className="text-text-primary">{filteredCompanies.length}</strong> companies</span>
          <span className="w-1.5 h-1.5 rounded-full bg-border-default" />
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Sample-gated (3+ reports)
          </span>
        </div>
      </div>

      {/* Company PPO Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-bg-surface animate-pulse border border-border-subtle" />
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-16 bg-bg-surface rounded-2xl border border-border-subtle p-8 shadow-2xs">
          <Building2 className="w-10 h-10 text-text-tertiary mx-auto mb-3 opacity-60" />
          <h2 className="text-base font-display font-bold text-text-primary">No PPO Reports Found</h2>
          <p className="text-text-secondary text-xs mt-1 max-w-md mx-auto">
            Be the first to share an intern-to-fulltime outcome for your company!
          </p>
          <button
            onClick={() => setShowReportModal(true)}
            className="mt-4 px-4 py-2 bg-accent-50 text-accent-600 border border-accent-200 rounded-xl text-xs font-semibold hover:bg-accent-100 transition-all"
          >
            + Report PPO Outcome
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCompanies.map(comp => {
            const hasReliableSample = comp.ppo_reports >= 3;
            return (
              <div
                key={comp.id}
                className="job-card p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent-50 border border-accent-100 flex items-center justify-center overflow-hidden shrink-0">
                        {comp.logo_url ? (
                          <img src={comp.logo_url} alt={comp.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 text-accent-600" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-base font-display font-bold text-text-primary">
                          {comp.name}
                        </h2>
                        <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-text-tertiary" />
                          {comp.hq_location || 'Pan-India'}
                        </p>
                      </div>
                    </div>

                    {hasReliableSample ? (
                      <div className="text-right">
                        <span className="text-lg font-bold text-emerald-700 font-mono">
                          ~{comp.ppo_rate}%
                        </span>
                        <span className="block text-[11px] text-text-tertiary">
                          PPO Rate ({comp.ppo_reports} {comp.ppo_reports === 1 ? 'report' : 'reports'})
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] px-2.5 py-1 rounded-lg bg-bg-elevated text-text-secondary border border-border-subtle">
                        {comp.ppo_reports} {comp.ppo_reports === 1 ? 'report' : 'reports'} (need 3+)
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="w-full bg-bg-elevated h-2.5 rounded-full overflow-hidden border border-border-subtle">
                      {hasReliableSample ? (
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, comp.ppo_rate))}%` }}
                        />
                      ) : (
                        <div className="bg-slate-300 h-full w-1/4 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-bg-elevated text-text-secondary text-[11px] font-medium">Internship</span>
                    <span className="px-2 py-0.5 rounded-md bg-bg-elevated text-text-secondary text-[11px] font-medium">SDE</span>
                  </div>

                  <button
                    onClick={() => {
                      setModalCompany(comp.name);
                      setShowReportModal(true);
                    }}
                    className="inline-flex items-center gap-1 text-accent-600 hover:text-accent-700 font-semibold transition-colors"
                    aria-label={`Report PPO for ${comp.name}`}
                  >
                    Report yours <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-surface border border-border-subtle rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative"
            >
              <button
                onClick={() => setShowReportModal(false)}
                className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary"
                aria-label="Close modal"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-display font-bold text-text-primary flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-accent-500" />
                Report PPO Outcome
              </h2>
              <p className="text-xs text-text-secondary mb-5">
                Help fellow students gauge internship-to-FTE conversion odds.
              </p>

              {successMessage ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <p className="text-sm font-semibold text-text-primary">{successMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div className="relative">
                    <label htmlFor="ppo-comp" className="block text-xs font-semibold text-text-secondary mb-1">
                      Company Name *
                    </label>
                    <input
                      id="ppo-comp"
                      type="text"
                      required
                      placeholder="e.g. Razorpay, Stripe, Swiggy"
                      value={modalCompany}
                      onChange={(e) => setModalCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-bg-elevated/60 border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-border-subtle rounded-xl mt-1 shadow-lg overflow-hidden">
                        {suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setModalCompany(s);
                              setSuggestions([]);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-text-primary hover:bg-bg-elevated transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ppo-role" className="block text-xs font-semibold text-text-secondary mb-1">
                        Role Title
                      </label>
                      <input
                        id="ppo-role"
                        type="text"
                        value={modalRole}
                        onChange={(e) => setModalRole(e.target.value)}
                        placeholder="e.g. SDE Intern"
                        className="w-full px-3 py-2 bg-bg-elevated/60 border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="ppo-year" className="block text-xs font-semibold text-text-secondary mb-1">
                        Year
                      </label>
                      <select
                        id="ppo-year"
                        value={modalYear}
                        onChange={(e) => setModalYear(e.target.value)}
                        className="w-full px-3 py-2 bg-bg-elevated/60 border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-text-secondary mb-1">
                      PPO / Full-Time Conversion Offered? *
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setModalGotPPO(true)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                          modalGotPPO
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-bg-base border-border-subtle text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Yes (Converted)
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalGotPPO(false)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                          !modalGotPPO
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-bg-base border-border-subtle text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <XCircle className="w-4 h-4" /> No (Not Offered)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ppo-stipend" className="block text-xs font-semibold text-text-secondary mb-1">
                        Monthly Stipend (₹ optional)
                      </label>
                      <input
                        id="ppo-stipend"
                        type="number"
                        placeholder="e.g. 50000"
                        value={modalStipend}
                        onChange={(e) => setModalStipend(e.target.value)}
                        className="w-full px-3 py-2 bg-bg-elevated/60 border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="ppo-ctc" className="block text-xs font-semibold text-text-secondary mb-1">
                        Full-Time CTC (LPA optional)
                      </label>
                      <input
                        id="ppo-ctc"
                        type="number"
                        placeholder="e.g. 28"
                        value={modalCtc}
                        onChange={(e) => setModalCtc(e.target.value)}
                        className="w-full px-3 py-2 bg-bg-elevated/60 border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-text-secondary">Keep my submission anonymous</span>
                    <button
                      type="button"
                      onClick={() => setModalAnonymous(!modalAnonymous)}
                      aria-label="Toggle anonymous submission"
                      className={`w-10 h-5 rounded-full transition-colors relative border ${
                        modalAnonymous ? 'bg-accent-500 border-accent-600' : 'bg-slate-200 border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                          modalAnonymous ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs"
                    >
                      {submitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

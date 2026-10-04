'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, Search, Plus, TrendingUp, ShieldCheck, CheckCircle2, XCircle, 
  Sparkles, Filter, ChevronRight, MapPin, Briefcase, DollarSign
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
  
  // Selected company for modal prefill
  const [modalCompany, setModalCompany] = useState('');
  const [modalRole, setModalRole] = useState('SDE Intern');
  const [modalYear, setModalYear] = useState('2025');
  const [modalGotPPO, setModalGotPPO] = useState(true);
  const [modalStipend, setModalStipend] = useState('');
  const [modalCtc, setModalCtc] = useState('');
  const [modalLocation, setModalLocation] = useState('Bengaluru');
  const [modalAnonymous, setModalAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Company autocomplete suggestions
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

  // Handle autocomplete fetch when typing company in modal
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

      const data = await res.json();
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
    <div className="min-h-screen bg-surface-950 text-tertiary-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-surface-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-saffron-500/10 text-saffron-400 border border-saffron-500/20">
                Community Flywheel
              </span>
              <span className="text-xs text-tertiary-400">Phase 4</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-tertiary-50 flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-saffron-400" />
              PPO Tracker
            </h1>
            <p className="text-tertiary-400 text-sm mt-1">
              Companies known to convert interns to full-time roles — crowdsourced from Indian tech graduates.
            </p>
          </div>

          <button
            onClick={() => {
              setModalCompany('');
              setShowReportModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-400 text-surface-950 font-semibold text-sm transition-all shadow-lg shadow-saffron-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
            aria-label="Report PPO Outcome"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Report PPO Outcome
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-surface-900/60 p-3 rounded-2xl border border-surface-800 backdrop-blur-md">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-tertiary-400" />
            <input
              type="text"
              placeholder="Search company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-950 border border-surface-800 rounded-xl text-xs text-tertiary-100 placeholder-tertiary-500 focus:outline-none focus:border-saffron-500/50"
            />
          </div>

          {/* Min Rate Filter */}
          <div className="flex items-center gap-2 bg-surface-950 px-3 py-2 border border-surface-800 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-tertiary-400" />
            <select
              value={minRateFilter}
              onChange={(e) => setMinRateFilter(Number(e.target.value))}
              className="w-full bg-transparent text-xs text-tertiary-200 focus:outline-none cursor-pointer"
            >
              <option value={0} className="bg-surface-900 text-tertiary-200">All PPO Rates</option>
              <option value={50} className="bg-surface-900 text-tertiary-200">50%+ Conversion</option>
              <option value={70} className="bg-surface-900 text-tertiary-200">70%+ Conversion</option>
              <option value={85} className="bg-surface-900 text-tertiary-200">85%+ Conversion</option>
            </select>
          </div>

          {/* Quick Stats Pill */}
          <div className="col-span-1 sm:col-span-2 md:col-span-2 flex items-center justify-end gap-3 text-xs text-tertiary-400 px-2">
            <span>Showing <strong className="text-tertiary-100">{filteredCompanies.length}</strong> companies</span>
            <span className="w-1.5 h-1.5 rounded-full bg-surface-700" />
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Sample-gated (3+ reports)
            </span>
          </div>
        </div>

        {/* Company PPO Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 rounded-2xl bg-surface-900/40 animate-pulse border border-surface-800" />
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-16 bg-surface-900/30 rounded-2xl border border-surface-800/60 p-8">
            <Building2 className="w-12 h-12 text-tertiary-600 mx-auto mb-3 stroke-1" />
            <h3 className="text-lg font-medium text-tertiary-200">No PPO Reports Found</h3>
            <p className="text-tertiary-400 text-xs mt-1 max-w-md mx-auto">
              Be the first to share an intern-to-fulltime outcome for your company!
            </p>
            <button
              onClick={() => setShowReportModal(true)}
              className="mt-4 px-4 py-2 bg-saffron-500/10 text-saffron-400 border border-saffron-500/30 rounded-xl text-xs font-semibold hover:bg-saffron-500/20 transition-all"
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
                  className="bg-surface-900/70 border border-surface-800 hover:border-surface-700 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Top Row: Logo & Name */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center overflow-hidden shrink-0">
                          {comp.logo_url ? (
                            <img src={comp.logo_url} alt={comp.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-tertiary-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-tertiary-100 group-hover:text-saffron-400 transition-colors">
                            {comp.name}
                          </h3>
                          <p className="text-xs text-tertiary-400 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-tertiary-500" />
                            {comp.hq_location || 'Pan-India'}
                          </p>
                        </div>
                      </div>

                      {/* Badge Rate */}
                      {hasReliableSample ? (
                        <div className="text-right">
                          <span className="text-lg font-bold text-saffron-400 font-mono">
                            ~{comp.ppo_rate}%
                          </span>
                          <span className="block text-[10px] text-tertiary-400">
                            PPO Rate ({comp.ppo_reports} {comp.ppo_reports === 1 ? 'report' : 'reports'})
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] px-2 py-1 rounded-lg bg-surface-800 text-tertiary-400 border border-surface-700">
                          {comp.ppo_reports} {comp.ppo_reports === 1 ? 'report' : 'reports'} (need 3+)
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-surface-950 h-2.5 rounded-full overflow-hidden border border-surface-800">
                        {hasReliableSample ? (
                          <div 
                            className="bg-gradient-to-r from-saffron-500 to-amber-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, comp.ppo_rate))}%` }}
                          />
                        ) : (
                          <div className="bg-surface-700 h-full w-1/4 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action / Meta */}
                  <div className="flex items-center justify-between pt-2 border-t border-surface-800/60 text-xs text-tertiary-400">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-surface-800 text-tertiary-300 text-[11px]">Internship</span>
                      <span className="px-2 py-0.5 rounded bg-surface-800 text-tertiary-300 text-[11px]">SDE</span>
                    </div>

                    <button
                      onClick={() => {
                        setModalCompany(comp.name);
                        setShowReportModal(true);
                      }}
                      className="inline-flex items-center gap-1 text-saffron-400 hover:text-saffron-300 font-medium transition-colors"
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

        {/* Modal: Report PPO Outcome */}
        <AnimatePresence>
          {showReportModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative"
              >
                <button
                  onClick={() => setShowReportModal(false)}
                  className="absolute top-4 right-4 text-tertiary-400 hover:text-tertiary-200"
                  aria-label="Close modal"
                >
                  <XCircle className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-tertiary-50 flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-saffron-400" />
                  Report PPO Outcome
                </h2>
                <p className="text-xs text-tertiary-400 mb-5">
                  Help fellow students gauge internship-to-FTE conversion odds.
                </p>

                {successMessage ? (
                  <div className="py-8 text-center space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <p className="text-sm font-semibold text-tertiary-100">{successMessage}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReport} className="space-y-4">
                    {/* Company input with suggestions */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-tertiary-300 mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Razorpay, Stripe, Swiggy"
                        value={modalCompany}
                        onChange={(e) => setModalCompany(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-950 border border-surface-800 rounded-xl text-xs text-tertiary-100 focus:outline-none focus:border-saffron-500/50"
                      />
                      {suggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-surface-900 border border-surface-800 rounded-xl mt-1 shadow-xl overflow-hidden">
                          {suggestions.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setModalCompany(s);
                                setSuggestions([]);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-tertiary-200 hover:bg-surface-800 transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Role & Year */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-tertiary-300 mb-1">
                          Role Title
                        </label>
                        <input
                          type="text"
                          value={modalRole}
                          onChange={(e) => setModalRole(e.target.value)}
                          placeholder="e.g. SDE Intern"
                          className="w-full px-3 py-2 bg-surface-950 border border-surface-800 rounded-xl text-xs text-tertiary-100 focus:outline-none focus:border-saffron-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-tertiary-300 mb-1">
                          Year
                        </label>
                        <select
                          value={modalYear}
                          onChange={(e) => setModalYear(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-950 border border-surface-800 rounded-xl text-xs text-tertiary-100 focus:outline-none focus:border-saffron-500/50"
                        >
                          <option value="2026">2026</option>
                          <option value="2025">2025</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                        </select>
                      </div>
                    </div>

                    {/* PPO Offered toggle */}
                    <div>
                      <label className="block text-xs font-medium text-tertiary-300 mb-1">
                        PPO / Full-Time Conversion Offered? *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setModalGotPPO(true)}
                          className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                            modalGotPPO 
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                              : 'bg-surface-950 border-surface-800 text-tertiary-400 hover:text-tertiary-200'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Yes (Converted)
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalGotPPO(false)}
                          className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                            !modalGotPPO 
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                              : 'bg-surface-950 border-surface-800 text-tertiary-400 hover:text-tertiary-200'
                          }`}
                        >
                          <XCircle className="w-4 h-4" /> No (Not Offered)
                        </button>
                      </div>
                    </div>

                    {/* Stipend & CTC */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-tertiary-300 mb-1">
                          Monthly Stipend (₹ optional)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 50000"
                          value={modalStipend}
                          onChange={(e) => setModalStipend(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-950 border border-surface-800 rounded-xl text-xs text-tertiary-100 focus:outline-none focus:border-saffron-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-tertiary-300 mb-1">
                          Full-Time CTC (LPA optional)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 28"
                          value={modalCtc}
                          onChange={(e) => setModalCtc(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-950 border border-surface-800 rounded-xl text-xs text-tertiary-100 focus:outline-none focus:border-saffron-500/50"
                        />
                      </div>
                    </div>

                    {/* Anonymous toggle */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-tertiary-400">Keep my submission anonymous</span>
                      <button
                        type="button"
                        onClick={() => setModalAnonymous(!modalAnonymous)}
                        className={`w-10 h-5 rounded-full transition-colors relative border ${
                          modalAnonymous ? 'bg-saffron-500 border-saffron-400' : 'bg-surface-800 border-surface-700'
                        }`}
                      >
                        <div 
                          className={`w-3.5 h-3.5 rounded-full bg-surface-950 absolute top-0.5 transition-transform ${
                            modalAnonymous ? 'translate-x-5' : 'translate-x-0.5'
                          }`} 
                        />
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowReportModal(false)}
                        className="px-4 py-2 text-xs font-medium text-tertiary-400 hover:text-tertiary-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 bg-saffron-500 hover:bg-saffron-400 disabled:opacity-50 text-surface-950 font-semibold text-xs rounded-xl transition-all shadow-md"
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
    </div>
  );
}

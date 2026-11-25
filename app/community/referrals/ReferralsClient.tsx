'use client';

import { useState, useEffect } from 'react';
import { Share2, Plus, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { DMPanel } from '@/components/community/DMPanel';
import { createClient } from '@/lib/supabase/client';

interface ReferralsClientProps {
  initialRequests: any[];
  userWeeklyCount: number;
}

export default function ReferralsClient({ initialRequests, userWeeklyCount }: ReferralsClientProps) {
  const [activeTab, setActiveTab] = useState<'seeking' | 'offering'>('seeking');
  const [requests, setRequests] = useState(initialRequests);
  const [weeklyCount, setWeeklyCount] = useState(userWeeklyCount);
  const [showModal, setShowModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const [activeDM, setActiveDM] = useState<{
    conversationId: string;
    companyName: string;
    roleTitle: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    company_name: '',
    role_title: '',
    message: '',
    is_offering: false
  });

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, [supabase]);

  const filteredRequests = requests.filter(r => (activeTab === 'offering' ? r.is_offering : !r.is_offering));

  const handleStartDM = async (req: any) => {
    if (!currentUserId) {
      toast.error('Please login to send direct messages.');
      return;
    }

    try {
      const res = await fetch('/api/community/dms/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: req.id })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.conversation) {
        setActiveDM({
          conversationId: data.conversation.id,
          companyName: req.company_name,
          roleTitle: req.role_title || 'Referral'
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to start DM.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (weeklyCount >= 3 && !formData.is_offering) {
      toast.error('Weekly rate limit reached (3/3 requests).');
      return;
    }

    try {
      const res = await fetch('/api/community/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRequests([data.data, ...requests]);
      setWeeklyCount(prev => prev + 1);
      setShowModal(false);
      toast.success('Referral post published!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to post referral request');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-text-primary flex items-center gap-2">
            <Share2 className="w-6 h-6 text-accent-500" />
            <span>Referral Exchange Board</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Connect with employees at target companies for verified referrals.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-text-secondary">
            Weekly requests: <strong className="text-accent-600">{weeklyCount}/3</strong> used
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post Request</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-border-subtle pb-3">
        <button
          onClick={() => setActiveTab('seeking')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all ${
            activeTab === 'seeking'
              ? 'bg-accent-500 text-white border-accent-500'
              : 'text-text-secondary hover:text-text-primary bg-white border-border-subtle'
          }`}
        >
          Looking for Referral
        </button>
        <button
          onClick={() => setActiveTab('offering')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all ${
            activeTab === 'offering'
              ? 'bg-accent-500 text-white border-accent-500'
              : 'text-text-secondary hover:text-text-primary bg-white border-border-subtle'
          }`}
        >
          Offering Referral
        </button>
      </div>

      {/* Request Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="col-span-2 py-16 text-center bg-bg-surface border border-border-subtle rounded-2xl p-8 text-xs sm:text-sm text-text-tertiary">
            No active referral posts in this category. Be the first to post!
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="job-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-accent-50 border border-accent-100 flex items-center justify-center font-bold text-accent-600 text-xs">
                    {req.company_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-text-primary">{req.company_name}</h2>
                    <p className="text-xs text-text-secondary">{req.role_title}</p>
                  </div>
                </div>
                <span className="text-[11px] text-text-tertiary">
                  {new Date(req.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>

              <p className="text-xs text-text-secondary line-clamp-3 bg-bg-base p-3 rounded-xl border border-border-subtle">
                {req.message}
              </p>

              <button
                onClick={() => handleStartDM(req)}
                className="w-full py-2 bg-accent-50 hover:bg-accent-100 border border-accent-200 text-accent-600 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5"
                aria-label={`DM author of referral for ${req.company_name}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Directly</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Active DM Panel */}
      {activeDM && (
        <DMPanel
          conversationId={activeDM.conversationId}
          companyName={activeDM.companyName}
          roleTitle={activeDM.roleTitle}
          currentUserId={currentUserId}
          onClose={() => setActiveDM(null)}
        />
      )}

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-base font-display font-bold text-text-primary">Post Referral Request</h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label htmlFor="ref-comp" className="block font-semibold text-text-secondary mb-1">Company Name</label>
                <input
                  id="ref-comp"
                  required
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g. Swiggy, Amazon, Google"
                  className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="ref-role" className="block font-semibold text-text-secondary mb-1">Target Role Title</label>
                <input
                  id="ref-role"
                  value={formData.role_title}
                  onChange={e => setFormData({ ...formData, role_title: e.target.value })}
                  placeholder="e.g. SDE 1"
                  className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="ref-msg" className="block font-semibold text-text-secondary mb-1">Message (max 200 chars)</label>
                <textarea
                  id="ref-msg"
                  required
                  maxLength={200}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Briefly share your skills and profile context..."
                  className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white h-20 resize-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="offering"
                  checked={formData.is_offering}
                  onChange={e => setFormData({ ...formData, is_offering: e.target.checked })}
                />
                <label htmlFor="offering" className="text-text-secondary cursor-pointer">I am offering referrals at this company</label>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-bg-elevated text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

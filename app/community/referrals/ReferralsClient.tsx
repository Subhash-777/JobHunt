'use client';

import { useState, useEffect } from 'react';
import { Share2, Plus, MessageSquare, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
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
  
  // DM state
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
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Share2 className="w-6 h-6 text-accent-500" />
            <span>Referral Exchange Board</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Connect with employees at target companies for employee referrals.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-text-tertiary">
            Weekly requests: <strong className="text-accent-400">{weeklyCount}/3</strong> used
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white text-xs font-bold rounded-xl shadow-md shadow-accent-500/20 transition-all flex items-center space-x-1.5"
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
          className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === 'seeking' ? 'bg-accent-500 text-white' : 'text-text-secondary hover:text-text-primary bg-bg-surface'
          }`}
        >
          Looking for Referral
        </button>
        <button
          onClick={() => setActiveTab('offering')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === 'offering' ? 'bg-accent-500 text-white' : 'text-text-secondary hover:text-text-primary bg-bg-surface'
          }`}
        >
          Offering Referral
        </button>
      </div>

      {/* Request Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="col-span-2 py-16 text-center bg-bg-surface border border-border-subtle rounded-2xl p-8 text-xs text-text-tertiary">
            No active referral posts in this category. Be the first to post!
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="p-4 bg-bg-surface border border-border-subtle rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center font-bold text-accent-400 text-xs">
                    {req.company_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">{req.company_name}</h4>
                    <p className="text-[11px] text-text-secondary">{req.role_title}</p>
                  </div>
                </div>
                <span className="text-[10px] text-text-tertiary">
                  {new Date(req.created_at).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-text-secondary line-clamp-3 bg-bg-elevated p-2.5 rounded-xl border border-border-subtle">
                {req.message}
              </p>

              <button
                onClick={() => handleStartDM(req)}
                className="w-full py-2 bg-saffron-500/10 hover:bg-saffron-500/20 border border-saffron-500/30 text-saffron-400 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5"
                aria-label={`DM author of referral for ${req.company_name}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>DM →</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-text-primary">Post Referral Request</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-secondary mb-1">Company Name</label>
                <input
                  required
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g. Swiggy, Amazon, Google"
                  className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-text-secondary mb-1">Target Role Title</label>
                <input
                  value={formData.role_title}
                  onChange={e => setFormData({ ...formData, role_title: e.target.value })}
                  placeholder="e.g. SDE 1"
                  className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-text-secondary mb-1">Message (max 200 chars)</label>
                <textarea
                  required
                  maxLength={200}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Briefly describe your profile link or qualifications..."
                  className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-text-primary focus:outline-none h-20 resize-none"
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
                  className="px-4 py-2 rounded-xl bg-bg-elevated text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-500 text-white font-bold"
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


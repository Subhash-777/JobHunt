'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Send, MessageSquare, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface DMPanelProps {
  conversationId: string;
  companyName: string;
  roleTitle: string;
  currentUserId: string;
  onClose: () => void;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export function DMPanel({
  conversationId,
  companyName,
  roleTitle,
  currentUserId,
  onClose
}: DMPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom on message updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial messages
  useEffect(() => {
    async function loadMessages() {
      try {
        setLoading(true);
        const res = await fetch(`/api/community/dms/${conversationId}/messages`);
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error('Failed to load DM messages:', err);
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    }

    loadMessages();
  }, [conversationId]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`dm:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dm_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setErrorMsg('');
    const contentToSend = inputText.trim();
    setInputText('');

    try {
      setSending(true);
      const res = await fetch(`/api/community/dms/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToSend })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to send message.');
        setInputText(contentToSend); // restore typed text
      } else if (data.message) {
        setMessages(prev => [...prev, data.message]);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending message.');
      setInputText(contentToSend);
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="fixed bottom-0 right-0 md:right-6 z-50 w-full md:w-96 bg-surface-900 border border-surface-800 rounded-t-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]"
    >
      {/* Header */}
      <div className="bg-surface-950 p-4 border-b border-surface-800 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-saffron-500/10 border border-saffron-500/30 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-saffron-400" />
          </div>
          <div className="truncate">
            <h3 className="text-xs font-bold text-tertiary-100 truncate">
              Referral — {companyName}
            </h3>
            <p className="text-[10px] text-tertiary-400 truncate">{roleTitle}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-tertiary-400 hover:text-tertiary-100 hover:bg-surface-800 transition-colors"
          aria-label="Close DM panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-950/40">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-tertiary-400">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-tertiary-400 space-y-1">
            <MessageSquare className="w-8 h-8 text-tertiary-600 mx-auto stroke-1" />
            <p className="text-xs font-medium text-tertiary-200">Start the Conversation</p>
            <p className="text-[11px] text-tertiary-500">Ask politely about job details or referral requirements.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-saffron-500 text-surface-950 font-medium rounded-br-none'
                      : 'bg-surface-800 text-tertiary-100 border border-surface-700 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] text-tertiary-500 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error alert if rate limited */}
      {errorMsg && (
        <div className="bg-rose-500/10 border-t border-rose-500/20 px-3 py-1.5 text-[11px] text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSendMessage} className="p-3 bg-surface-950 border-t border-surface-800 flex items-center gap-2">
        <input
          type="text"
          maxLength={500}
          placeholder="Type a message (max 500 chars)..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-surface-900 border border-surface-800 rounded-xl px-3 py-2 text-xs text-tertiary-100 placeholder-tertiary-500 focus:outline-none focus:border-saffron-500/50"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="p-2 bg-saffron-500 hover:bg-saffron-400 disabled:opacity-40 text-surface-950 rounded-xl transition-all shadow-md shrink-0"
          aria-label="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}

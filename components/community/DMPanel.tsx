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
      className="fixed bottom-0 right-0 md:right-6 z-50 w-full md:w-96 bg-bg-surface border border-border-subtle rounded-t-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]"
    >
      {/* Header */}
      <div className="bg-bg-base p-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-accent-50 border border-accent-100 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-accent-600" />
          </div>
          <div className="truncate">
            <h3 className="text-xs font-bold text-text-primary truncate">
              Referral — {companyName}
            </h3>
            <p className="text-[11px] text-text-secondary truncate">{roleTitle}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label="Close DM panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-bg-base/60">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-text-secondary">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-text-secondary space-y-1">
            <MessageSquare className="w-8 h-8 text-text-tertiary mx-auto opacity-50" />
            <p className="text-xs font-semibold text-text-primary">Start the Conversation</p>
            <p className="text-[11px] text-text-tertiary">Ask politely about job details or referral requirements.</p>
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
                  className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-accent-500 text-white font-medium rounded-br-none shadow-2xs'
                      : 'bg-white text-text-primary border border-border-subtle rounded-bl-none shadow-2xs'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-text-tertiary mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error alert if rate limited */}
      {errorMsg && (
        <div className="bg-rose-50 border-t border-rose-200 px-3 py-1.5 text-[11px] text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-border-subtle flex items-center gap-2">
        <input
          type="text"
          maxLength={500}
          placeholder="Type a message (max 500 chars)..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-bg-elevated/60 border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-500 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="p-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs shrink-0"
          aria-label="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}

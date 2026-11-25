'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ChevronRight, Play, BookOpen } from 'lucide-react';

interface InterviewClientProps {
  job: any;
}

export function InterviewClient({ job }: InterviewClientProps) {
  const [step, setStep] = useState<'start' | 'active' | 'feedback' | 'end'>('start');
  const [session, setSession] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [lastEval, setLastEval] = useState<any>(null);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/interview`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSession(data);
        setCurrentIndex(0);
        setStep('active');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    const question = session.questions[currentIndex];
    try {
      const res = await fetch(`/api/jobs/${job.id}/interview`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          questionId: question.id,
          questionText: question.text,
          answerText: answer,
        }),
      });

      if (res.ok) {
        const updatedSession = await res.json();
        setSession(updatedSession);
        const latestAnswer = updatedSession.answers.find((a: any) => a.questionId === question.id);
        setLastEval(latestAnswer);
        setStep('feedback');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setAnswer('');
    setLastEval(null);
    if (currentIndex + 1 < session.questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setStep('active');
    } else {
      setStep('end');
    }
  };

  const calculateAverageScore = () => {
    if (!session || !session.answers || session.answers.length === 0) return 0;
    const total = session.answers.reduce((acc: number, curr: any) => acc + curr.score, 0);
    return Math.round(total / session.answers.length);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <header className="border-b border-border-subtle pb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent-600 bg-accent-50 border border-accent-100 px-2.5 py-0.5 rounded-full">
          Mock Interview Prep
        </span>
        <h1 className="text-2xl font-display font-extrabold text-text-primary mt-2">
          {job.title} — {job.company}
        </h1>
      </header>

      <AnimatePresence mode="wait">
        {step === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-bg-surface border border-border-subtle rounded-2xl p-8 shadow-2xs flex flex-col gap-5 text-center items-center"
          >
            <div className="h-16 w-16 bg-accent-50 rounded-2xl flex items-center justify-center border border-accent-100 text-accent-600">
              <BookOpen size={30} />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-text-primary">AI-Tailored Interview Practice</h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-2 max-w-md mx-auto leading-relaxed">
                Generate 10 structured questions tailored to this job: DSA/Technical (3), System Design (2), Domain (3), and HR/Behavioral (2).
              </p>
            </div>
            <button
              onClick={handleStart}
              disabled={starting}
              className="bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-xs"
            >
              {starting ? 'Generating Questions...' : 'Start Interview'}
              <Play size={16} />
            </button>
          </motion.div>
        )}

        {step === 'active' && session && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-2xs flex flex-col gap-4"
          >
            <div className="flex justify-between items-center text-xs border-b border-border-subtle pb-3">
              <span className="text-text-tertiary font-bold uppercase tracking-wider">
                Question {currentIndex + 1} of {session.questions.length}
              </span>
              <span className="text-accent-600 bg-accent-50 border border-accent-100 px-2.5 py-0.5 rounded-full capitalize font-semibold">
                {session.questions[currentIndex].category}
              </span>
            </div>

            <div className="text-base font-display font-bold text-text-primary leading-relaxed">
              {session.questions[currentIndex].text}
            </div>

            <div>
              <label htmlFor="intv-answer" className="block text-[11px] text-text-secondary font-semibold mb-1.5">
                Your Answer
              </label>
              <textarea
                id="intv-answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your structured answer here..."
                rows={6}
                className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white transition-colors"
                required
              />
            </div>

            <button
              onClick={handleAnswerSubmit}
              disabled={submitting || !answer.trim()}
              className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {submitting ? 'Evaluating...' : 'Submit Answer'}
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}

        {step === 'feedback' && lastEval && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-2xs flex flex-col gap-5"
          >
            <div className="flex justify-between items-center text-xs border-b border-border-subtle pb-3">
              <span className="text-text-tertiary font-bold uppercase tracking-wider">
                Question {currentIndex + 1} Feedback
              </span>
              <div className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Score: {lastEval.score}%
              </div>
            </div>

            <div>
              <h3 className="text-[11px] text-text-tertiary uppercase tracking-wider font-semibold mb-1">Question</h3>
              <p className="text-sm text-text-primary font-semibold">{session.questions[currentIndex].text}</p>
            </div>

            <div>
              <h3 className="text-[11px] text-text-tertiary uppercase tracking-wider font-semibold mb-1">Your Answer</h3>
              <p className="text-xs text-text-secondary whitespace-pre-line bg-bg-base p-3 rounded-xl border border-border-subtle">
                {lastEval.answer}
              </p>
            </div>

            <div className="bg-accent-50/70 p-4 rounded-xl border border-accent-100">
              <h3 className="text-[11px] text-accent-600 uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1">
                <Sparkles size={12} />
                AI Evaluation Feedback
              </h3>
              <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                {lastEval.feedback}
              </p>
            </div>

            <button
              onClick={handleNext}
              className="bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              Continue
              <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {step === 'end' && session && (
          <motion.div
            key="end"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-2xs flex items-center gap-6">
              <div className="text-3xl font-display font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-5 py-4 rounded-full flex items-center justify-center h-24 w-24 shrink-0">
                {calculateAverageScore()}%
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-text-primary">Interview Practice Completed!</h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                  Review your full question-by-question breakdown and AI coaching feedback below.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
                Full Response Transcript
              </h3>

              {session.questions.map((q: any, i: number) => {
                const ansObj = session.answers.find((a: any) => a.questionId === q.id) || {};
                return (
                  <div key={q.id} className="bg-bg-surface border border-border-subtle p-5 rounded-2xl shadow-2xs flex flex-col gap-3">
                    <div className="flex justify-between items-center gap-2 text-xs border-b border-border-subtle pb-2">
                      <span className="text-text-secondary font-bold">
                        Q{i + 1}: {q.category}
                      </span>
                      <span className="font-bold text-accent-600">
                        Score: {ansObj.score || 0}%
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] text-text-tertiary uppercase tracking-wider font-semibold mb-1">Question</p>
                      <p className="text-sm text-text-primary font-semibold">{q.text}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-text-tertiary uppercase tracking-wider font-semibold mb-1">Your Response</p>
                      <p className="text-xs text-text-secondary italic bg-bg-base p-3 rounded-xl border border-border-subtle">
                        {ansObj.answer || 'No response.'}
                      </p>
                    </div>
                    <div className="bg-accent-50/70 p-3 rounded-xl border border-accent-100 text-xs">
                      <p className="text-accent-600 font-bold flex items-center gap-1 mb-1">
                        <Sparkles size={12} />
                        Feedback
                      </p>
                      <p className="text-text-primary">{ansObj.feedback || 'No evaluation.'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, ChevronRight, Play, BookOpen } from 'lucide-react';

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
        
        // Find evaluation for this question
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
    <main className="min-h-screen max-w-3xl mx-auto p-4 pt-10 pb-20 text-gray-200">
      <header className="mb-8 border-b border-white/5 pb-4">
        <span className="text-[10px] text-accent-500 bg-accent-500/10 px-2 py-0.5 rounded-full capitalize font-bold">
          Mock Interview Prep
        </span>
        <h1 className="text-2xl font-bold text-white mt-2">
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
            className="bg-bg-surface border border-white/5 rounded-xl p-6 shadow-xl flex flex-col gap-5 text-center items-center"
          >
            <div className="h-16 w-16 bg-accent-500/10 rounded-full flex items-center justify-center border border-accent-500/20 text-accent-500">
              <BookOpen size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI-Tailored Interview Practice</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
                Generate a structured mock interview consisting of 10 questions tailored specifically to this job posting:
                DSA/Technical (3), System Design (2), Domain (3), and HR/Behavioral (2).
              </p>
            </div>
            <button
              onClick={handleStart}
              disabled={starting}
              className="bg-accent-500 hover:bg-accent-600 font-bold text-sm px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mt-2"
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
            className="bg-bg-surface border border-white/5 rounded-xl p-6 shadow-xl flex flex-col gap-4"
          >
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
              <span className="text-gray-400 font-bold uppercase tracking-wider">
                Question {currentIndex + 1} of {session.questions.length}
              </span>
              <span className="text-accent-500 bg-accent-500/10 border border-accent-500/20 px-2.5 py-0.5 rounded-md capitalize font-semibold">
                {session.questions[currentIndex].category}
              </span>
            </div>

            <div className="text-base font-semibold text-white leading-relaxed">
              {session.questions[currentIndex].text}
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-semibold">
                Your Answer
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your detailed answer here..."
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
                required
              />
            </div>

            <button
              onClick={handleAnswerSubmit}
              disabled={submitting || !answer.trim()}
              className="bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/20 font-bold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
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
            className="bg-bg-surface border border-white/5 rounded-xl p-6 shadow-xl flex flex-col gap-5"
          >
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
              <span className="text-gray-400 font-bold uppercase tracking-wider">
                Question {currentIndex + 1} Feedback
              </span>
              <div className="text-sm font-bold text-accent-500 bg-accent-500/10 px-3 py-1 rounded-md border border-accent-500/20">
                Score: {lastEval.score}%
              </div>
            </div>

            <div>
              <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Question</h4>
              <p className="text-sm text-white font-medium">{session.questions[currentIndex].text}</p>
            </div>

            <div>
              <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Your Answer</h4>
              <p className="text-xs text-gray-300 whitespace-pre-line bg-white/5 p-3 rounded-lg border border-white/5">
                {lastEval.answer}
              </p>
            </div>

            <div className="bg-accent-500/5 p-4 rounded-xl border border-accent-500/10">
              <h4 className="text-[10px] text-accent-500 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1">
                <Sparkles size={12} />
                AI Evaluation Feedback
              </h4>
              <p className="text-xs text-gray-200 leading-relaxed font-medium">
                {lastEval.feedback}
              </p>
            </div>

            <button
              onClick={handleNext}
              className="bg-accent-500 hover:bg-accent-600 font-bold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
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
            {/* Final score card */}
            <div className="bg-bg-surface border border-white/5 rounded-xl p-6 shadow-xl flex items-center gap-6">
              <div className="text-4xl font-extrabold text-accent-500 bg-accent-500/10 border border-accent-500/20 px-5 py-4 rounded-full flex items-center justify-center h-24 w-24 flex-shrink-0">
                {calculateAverageScore()}%
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Interview Practice Completed!</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Congratulations on finishing the mock interview. Below is the full section breakdown of your questions and responses.
                </p>
              </div>
            </div>

            {/* Questions breakdown */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Full Response Transcript
              </h4>

              {session.questions.map((q: any, i: number) => {
                const ansObj = session.answers.find((a: any) => a.questionId === q.id) || {};
                return (
                  <div key={q.id} className="bg-bg-surface border border-white/5 p-5 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-center gap-2 text-xs border-b border-white/5 pb-2">
                      <span className="text-gray-400 font-bold">
                        Q{i + 1}: {q.category}
                      </span>
                      <span className="font-bold text-accent-500">
                        Score: {ansObj.score || 0}%
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Question</p>
                      <p className="text-sm text-white font-medium">{q.text}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Your Response</p>
                      <p className="text-xs text-gray-300 italic bg-white/5 p-2 rounded border border-white/5">
                        {ansObj.answer || 'No response.'}
                      </p>
                    </div>
                    <div className="bg-accent-500/5 p-3 rounded-lg border border-accent-500/10 text-xs">
                      <p className="text-accent-500 font-bold flex items-center gap-1 mb-1">
                        <Sparkles size={12} />
                        Feedback
                      </p>
                      <p className="text-gray-200">{ansObj.feedback || 'No evaluation.'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/motion/tokens';
import React from 'react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, children }: DrawerProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          {/* Glass Surface #2: Job Detail Slide-Over Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-lg z-50 glass-overlay shadow-2xl overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={spring.smooth}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

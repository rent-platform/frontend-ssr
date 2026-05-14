'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useToast, ToastContainer } from '@/ux/components/Toast';
import { ModerationQueueTab } from './components/ModerationQueueTab';
import { ComplaintsTab } from './components/ComplaintsTab';
import { ReviewsModerationTab } from './components/ReviewsModerationTab';
import { ActivityLogTab } from './components/ActivityLogTab';
import type { ModeratorTab } from './types';

export function ModeratorPanel({ activeTab = 'queue' as ModeratorTab }: { activeTab?: ModeratorTab }) {
  const toast = useToast();

  return (
    <div>
      <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'queue' && <ModerationQueueTab toast={toast.show} />}
          {activeTab === 'complaints' && <ComplaintsTab toast={toast.show} />}
          {activeTab === 'reviews' && <ReviewsModerationTab toast={toast.show} />}
          {activeTab === 'activity' && <ActivityLogTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

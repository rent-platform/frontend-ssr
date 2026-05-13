'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useToast, ToastContainer } from './components/Toast';
import { DashboardTab } from './tabs/DashboardTab';
import { UsersTab } from './tabs/UsersTab';
import { ListingsTab } from './tabs/ListingsTab';
import { DealsTab } from './tabs/DealsTab';
import { FinanceTab } from './tabs/FinanceTab';
import { SettingsTab } from './tabs/SettingsTab';
import { ActivityLogTab } from './tabs/ActivityLogTab';
import { ComplaintsTab } from './tabs/ComplaintsTab';
import type { AdminTab } from './types';

export function AdminPanel({ activeTab = 'dashboard' as AdminTab }: { activeTab?: AdminTab }) {
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
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'users' && <UsersTab toast={toast.show} />}
          {activeTab === 'listings' && <ListingsTab toast={toast.show} />}
          {activeTab === 'deals' && <DealsTab toast={toast.show} />}
          {activeTab === 'finance' && <FinanceTab toast={toast.show} />}
          {activeTab === 'complaints' && <ComplaintsTab toast={toast.show} />}
          {activeTab === 'activity' && <ActivityLogTab />}
          {activeTab === 'settings' && <SettingsTab toast={toast.show} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

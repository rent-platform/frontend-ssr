'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import type { DealDetailsPageProps } from './types';
import { getSubtitle } from './dealDetailsHelpers';
import { MOCK_DEAL_SCENARIOS, MOCK_SCENARIO_LABELS } from './mockDealDetailsData';
import { DealImage } from './components/DealImage';
import { DealProcessStepper } from './components/DealProcessStepper';
import { DealConditions } from './components/DealConditions';
import { DealParticipant } from './components/DealParticipant';
import { DealActions } from './components/DealActions';
import { DealReasonBlock } from './components/DealReasonBlock';
import styles from './DealDetailsPage.module.scss';

export function DealDetailsPage({ dealId }: DealDetailsPageProps) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const deal = MOCK_DEAL_SCENARIOS[scenarioIndex];

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  const handlePrimary = useCallback(() => {
    // placeholder
  }, []);

  const handleSecondary = useCallback(() => {
    // placeholder
  }, []);

  const handleChat = useCallback(() => {
    // placeholder
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={16} />
          Назад
        </button>
        <span className={styles.headerTitle}>Детали сделки</span>
      </header>

      <motion.div
        key={scenarioIndex}
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <DealImage
          imageUrl={deal.imageUrl}
          title={deal.title}
          status={deal.status}
        />

        <div className={styles.titleSection}>
          <h1 className={styles.dealTitle}>{deal.title}</h1>
          <p className={styles.dealSubtitle}>{getSubtitle(deal.viewMode)}</p>
        </div>

        <hr className={styles.divider} />

        <DealProcessStepper status={deal.status} viewMode={deal.viewMode} />

        <hr className={styles.divider} />

        <DealConditions
          startDate={deal.startDate}
          endDate={deal.endDate}
          rentalPrice={deal.rentalPrice}
          deposit={deal.deposit}
          city={deal.city}
          pickupLocation={deal.pickupLocation}
        />

        <hr className={styles.divider} />

        <DealParticipant participant={deal.participant} />

        <hr className={styles.divider} />

        <DealReasonBlock
          status={deal.status}
          rejectionReason={deal.rejectionReason}
          cancellationReason={deal.cancellationReason}
        />

        <DealActions
          status={deal.status}
          viewMode={deal.viewMode}
          onPrimary={handlePrimary}
          onSecondary={handleSecondary}
          onChat={handleChat}
        />
      </motion.div>

      <div className={styles.demoSwitcher}>
        <span className={styles.demoSwitcherLabel}>Demo: сценарии сделки</span>
        <div className={styles.demoGrid}>
          {MOCK_SCENARIO_LABELS.map((label, i) => (
            <button
              key={i}
              className={clsx(
                styles.demoBtn,
                scenarioIndex === i && styles.demoBtnActive,
              )}
              onClick={() => setScenarioIndex(i)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

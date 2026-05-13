'use client';

import clsx from 'clsx';
import type { UiDealStatus } from '@/ux/types/deal';
import { getDealSteps, getStatusMessage } from '../dealDetailsHelpers';
import type { DealViewMode } from '../types';
import styles from '../DealDetailsPage.module.scss';

interface DealProcessStepperProps {
  status: UiDealStatus;
  viewMode: DealViewMode;
}

export function DealProcessStepper({ status, viewMode }: DealProcessStepperProps) {
  const steps = getDealSteps(status);
  const statusMessage = getStatusMessage(status, viewMode);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Процесс аренды</h3>

      <div className={styles.stepper}>
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const nextCompleted = !isLast && steps[i + 1].completed;

          return (
            <div key={step.number} className={styles.step}>
              <div className={styles.stepIndicator}>
                <div
                  className={clsx(
                    styles.stepCircle,
                    step.completed
                      ? styles['stepCircle--active']
                      : styles['stepCircle--inactive'],
                  )}
                >
                  {step.number}
                </div>
                {!isLast && (
                  <div
                    className={clsx(
                      styles.stepLine,
                      nextCompleted
                        ? styles['stepLine--active']
                        : styles['stepLine--inactive'],
                    )}
                  />
                )}
              </div>

              <div className={styles.stepContent}>
                <p className={styles.stepTitle}>{step.title}</p>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {statusMessage && (
        <p className={styles.statusMessage}>{statusMessage}</p>
      )}
    </div>
  );
}

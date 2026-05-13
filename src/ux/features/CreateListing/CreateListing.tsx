'use client';

import { Fragment } from 'react';
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Eye,
  FileText,
  Plus,
  Save,
  Send,
  Tag,
  X,
} from 'lucide-react';
import type { CreateListingFormData } from './types';
import { StepPhotos, StepInfo, StepPricing, StepReview } from './components';
import clsx from 'clsx';
import { ROUTES } from '@/ux/utils';
import { useCreateListing } from './hooks/useCreateListing';
import styles from './CreateListing.module.scss';

/* ─── Constants ─── */
const STEPS = [
  { id: 'photos', label: 'Фотографии', Icon: Camera },
  { id: 'info', label: 'Описание', Icon: FileText },
  { id: 'pricing', label: 'Стоимость', Icon: Tag },
  { id: 'review', label: 'Проверка', Icon: Eye },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════════
   CreateListing — 4-step wizard
   ═══════════════════════════════════════════════════════════════════════════════ */

export type CreateListingProps = {
  /** Called with form data on publish (sends to moderation). Wire to useCreateAd + useUploadAdPhotos. */
  onSubmit?: (data: CreateListingFormData) => void | Promise<void>;
  /** Called when user saves draft without submitting for moderation. */
  onSaveDraft?: (data: CreateListingFormData) => void | Promise<void>;
  /** True while API is processing the submission. */
  isSubmitting?: boolean;
};

export function CreateListing({
  onSubmit,
  onSaveDraft,
  isSubmitting: externalIsSubmitting = false,
}: CreateListingProps = {}) {
  const {
    step,
    setStep,
    form,
    published,
    draftSaved,
    showExitModal,
    setShowExitModal,
    dragging,
    setDragging,
    dragOverId,
    setDragOverId,
    dragSourceId,
    fileInputRef,
    isSubmitting,
    canAdvance,
    maxImages,
    patch,
    addImages,
    removeImage,
    reorderImages,
    goNext,
    goBack,
    handleExitClick,
    confirmExit,
    handleDrop,
    handlePublish,
    handleSaveDraft,
    handleSaveDraftAndExit,
    resetForm,
  } = useCreateListing({ onSubmit, onSaveDraft, isSubmitting: externalIsSubmitting });

  /* ─── Success screen ─── */
  if (published || draftSaved) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.successOverlay}>
              <div className={styles.successIcon}>
                <Check size={36} />
              </div>
              <h2 className={styles.successTitle}>{draftSaved ? 'Черновик сохранён!' : 'Отправлено на модерацию!'}</h2>
              <p className={styles.successText}>
                {draftSaved
                  ? 'Ваше объявление сохранено как черновик. Вы можете продолжить редактирование и отправить его на модерацию позже.'
                  : 'Ваше объявление отправлено на проверку модератору. После одобрения оно станет доступно в каталоге.'}
              </p>
              <div className={styles.successActions}>
                <a href={ROUTES.catalog} className={styles.navBack}>
                  <ChevronLeft size={16} />
                  Выйти в каталог
                </a>
                <button
                  type="button"
                  className={styles.navNext}
                  onClick={resetForm}
                >
                  <Plus size={16} />
                  Создать ещё
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main render ─── */
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <a href={ROUTES.catalog} className={styles.backLink} onClick={handleExitClick}>
            <ChevronLeft size={16} />
            Выйти в каталог
          </a>
          <h1 className={styles.headerTitle}>Сдать в аренду</h1>
          <p className={styles.headerSubtitle}>
            Заполните информацию о вашей вещи — это займёт пару минут
          </p>
        </div>

        {/* Stepper */}
        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <Fragment key={s.id}>
              {i > 0 && (
                <div
                  className={clsx(styles.stepConnector, i <= step && styles.stepConnectorDone)}
                />
              )}
              <div
                className={clsx(styles.stepItem,
                  i === step
                    ? styles.stepItemActive
                    : i < step
                      ? styles.stepItemCompleted
                      : undefined,
                )}
                onClick={() => {
                  if (i < step) setStep(i);
                }}
              >
                {i < step ? <Check size={15} /> : <s.Icon size={15} />}
                <span>{s.label}</span>
              </div>
            </Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className={styles.card} key={step}>
          {step === 0 && (
            <StepPhotos
              images={form.images}
              dragging={dragging}
              dragOverId={dragOverId}
              fileInputRef={fileInputRef}
              dragSourceId={dragSourceId}
              maxImages={maxImages}
              onAddImages={addImages}
              onRemoveImage={removeImage}
              onReorderImages={reorderImages}
              onSetDragging={setDragging}
              onSetDragOverId={setDragOverId}
              onDrop={handleDrop}
            />
          )}
          {step === 1 && <StepInfo form={form} onPatch={patch} />}
          {step === 2 && <StepPricing form={form} onPatch={patch} />}
          {step === 3 && <StepReview form={form} />}
        </div>

        {/* Navigation */}
        <div className={styles.nav}>
          {step > 0 ? (
            <button type="button" className={styles.navBack} onClick={goBack}>
              <ChevronLeft size={16} />
              Назад
            </button>
          ) : (
            <div className={styles.navSpacer} />
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className={clsx(styles.navNext, !canAdvance && styles.navDisabled)}
              onClick={goNext}
              disabled={!canAdvance}
            >
              Далее
              <ChevronRight size={16} />
            </button>
          ) : (
            <div className={styles.navFinalActions}>
              <button
                type="button"
                className={styles.navDraft}
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                <Save size={16} />
                Сохранить черновик
              </button>
              <button
                type="button"
                className={clsx(styles.navNext, styles.publishBtn)}
                onClick={handlePublish}
                disabled={isSubmitting}
              >
                <Send size={16} />
                {isSubmitting ? 'Отправка…' : 'На модерацию'}
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Exit confirmation modal */}
      {showExitModal && (
        <div className={styles.modalOverlay} onClick={() => setShowExitModal(false)} role="presentation">
          <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Подтверждение выхода" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setShowExitModal(false)}
              aria-label="Закрыть"
            >
              <X size={18} />
            </button>
            <div className={styles.modalIcon}>
              <AlertTriangle size={28} />
            </div>
            <h3 className={styles.modalTitle}>Вы уверены?</h3>
            <p className={styles.modalText}>
              У вас есть несохранённые данные. Сохраните черновик, чтобы продолжить позже.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setShowExitModal(false)}
              >
                Остаться
              </button>
              <button
                type="button"
                className={styles.modalDraft}
                onClick={handleSaveDraftAndExit}
              >
                <Save size={14} />
                Сохранить черновик
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={confirmExit}
              >
                Выйти без сохранения
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

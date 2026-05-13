'use client';

import { Fragment, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertTriangle,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Plus,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { StepPhotos, StepInfo, StepPricing, StepReview } from '../CreateListing/components';
import type { CreateListingFormData, ImagePreview } from '../CreateListing/types';
import { useCreateListing } from '../CreateListing/hooks/useCreateListing';
import { MOCK_LISTINGS } from './mockProfileData';
import { ROUTES } from '@/ux/utils';
import styles from '../CreateListing/CreateListing.module.scss';

/* ─── Constants ─── */
const STEPS = [
  { id: 'photos', label: 'Фотографии', Icon: Camera },
  { id: 'info', label: 'Описание', Icon: FileText },
  { id: 'pricing', label: 'Стоимость', Icon: Tag },
  { id: 'review', label: 'Публикация', Icon: Eye },
] as const;

const CONDITION_MAP: Record<string, CreateListingFormData['condition']> = {
  'Новый': 'new',
  'Новое': 'new',
  'Как новый': 'like_new',
  'Как новое': 'like_new',
  'Отличное': 'like_new',
  'Хорошее': 'good',
  'Б/у': 'used',
};

function listingToFormData(listing: typeof MOCK_LISTINGS[number]): CreateListingFormData {
  const images: ImagePreview[] = listing.images.map((url, i) => ({
    id: `existing-${i}`,
    url,
  }));
  if (!images.length && listing.image) {
    images.push({ id: 'existing-0', url: listing.image });
  }

  return {
    title: listing.title,
    category: listing.category,
    condition: CONDITION_MAP[listing.condition] ?? 'good',
    description: listing.description.join('\n\n'),
    images,
    specs: [],
    pricePerDay: listing.pricePerDay ?? '',
    pricePerHour: listing.pricePerHour ?? '',
    depositAmount: listing.depositAmount ?? '',
    noDeposit: !listing.depositAmount,
    pickupLocation: listing.location,
    city: (listing as any).city ?? '',
  };
}

export function EditListing() {
  const params = useParams<{ id: string }>();

  const listing = useMemo(
    () => MOCK_LISTINGS.find((l) => l.id === params.id) ?? null,
    [params.id],
  );

  const initialData = useMemo(
    () => listing ? listingToFormData(listing) : null,
    [listing],
  );

  const exitRoute = listing ? ROUTES.listing(listing.id) : ROUTES.profile;

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
    resetForm,
  } = useCreateListing({
    initialData: initialData ?? undefined,
    exitRoute,
    onSubmit: async () => { /* wire to API later */ },
  });

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
              <h2 className={styles.successTitle}>Изменения сохранены!</h2>
              <p className={styles.successText}>
                Объявление «{form.title}» обновлено. Изменения вступят в силу после проверки модератором.
              </p>
              <div className={styles.successActions}>
                <a href={exitRoute} className={styles.navBack}>
                  <ChevronLeft size={16} />
                  К объявлению
                </a>
                <button
                  type="button"
                  className={styles.navNext}
                  onClick={resetForm}
                >
                  <Plus size={16} />
                  Продолжить редактирование
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
          <a href={exitRoute} className={styles.backLink} onClick={handleExitClick}>
            <ChevronLeft size={16} />
            Вернуться к объявлению
          </a>
          <h1 className={styles.headerTitle}>Редактирование</h1>
          <p className={styles.headerSubtitle}>
            Внесите изменения в объявление «{listing?.title}» — это займёт пару минут
          </p>
        </div>

        {/* Stepper */}
        <div className={styles.stepper}>
          {STEPS.map((st, i) => (
            <Fragment key={st.id}>
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
                {i < step ? <Check size={15} /> : <st.Icon size={15} />}
                <span>{st.label}</span>
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
            <button
              type="button"
              className={clsx(styles.navNext, styles.publishBtn)}
              onClick={handlePublish}
            >
              <Sparkles size={16} />
              Сохранить изменения
            </button>
          )}
        </div>
      </div>
      {/* Exit confirmation modal */}
      {showExitModal && (
        <div className={styles.modalOverlay} onClick={() => setShowExitModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setShowExitModal(false)}
            >
              <X size={18} />
            </button>
            <div className={styles.modalIcon}>
              <AlertTriangle size={28} />
            </div>
            <h3 className={styles.modalTitle}>Вы уверены?</h3>
            <p className={styles.modalText}>
              Все несохранённые изменения будут потеряны. Это действие нельзя отменить.
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
                className={styles.modalConfirm}
                onClick={confirmExit}
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

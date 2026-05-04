'use client';

import { Fragment, useCallback, useRef, useState } from 'react';
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Plus,
  Sparkles,
  Tag,
} from 'lucide-react';
import type { CreateListingFormData, ImagePreview } from './types';
import { StepPhotos, StepInfo, StepPricing, StepReview } from './components';
import styles from './CreateListing.module.scss';

/* ─── Constants ─── */
const STEPS = [
  { id: 'photos', label: 'Фотографии', Icon: Camera },
  { id: 'info', label: 'Описание', Icon: FileText },
  { id: 'pricing', label: 'Стоимость', Icon: Tag },
  { id: 'review', label: 'Публикация', Icon: Eye },
] as const;

const INITIAL: CreateListingFormData = {
  title: '',
  category: '',
  condition: 'good',
  description: '',
  images: [],
  pricePerDay: '',
  pricePerHour: '',
  depositAmount: '',
  noDeposit: false,
  pickupLocation: '',
};

const MAX_IMAGES = 10;

/* ═══════════════════════════════════════════════════════════════════════════════
   CreateListing — 4-step wizard
   ═══════════════════════════════════════════════════════════════════════════════ */
export function CreateListing() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateListingFormData>(INITIAL);
  const [published, setPublished] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragSourceId = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── Helpers ─── */
  const patch = useCallback(
    (updates: Partial<CreateListingFormData>) => setForm((prev) => ({ ...prev, ...updates })),
    [],
  );

  const addImages = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newImages: ImagePreview[] = Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .slice(0, MAX_IMAGES - form.images.length)
        .map((f) => ({ id: crypto.randomUUID(), url: URL.createObjectURL(f) }));
      if (newImages.length) patch({ images: [...form.images, ...newImages] });
    },
    [form.images, patch],
  );

  const removeImage = useCallback(
    (id: string) => {
      const img = form.images.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      patch({ images: form.images.filter((i) => i.id !== id) });
    },
    [form.images, patch],
  );

  const reorderImages = useCallback(
    (fromId: string, toId: string) => {
      if (fromId === toId) return;
      setForm((prev) => {
        const from = prev.images.findIndex((img) => img.id === fromId);
        const to = prev.images.findIndex((img) => img.id === toId);
        if (from === -1 || to === -1) return prev;
        const next = [...prev.images];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return { ...prev, images: next };
      });
    },
    [],
  );

  const isStepValid = useCallback(
    (s: number): boolean => {
      switch (s) {
        case 0:
          return form.images.length > 0;
        case 1:
          return (
            form.title.trim() !== '' &&
            form.category !== '' &&
            form.description.trim() !== ''
          );
        case 2:
          return (
            form.pricePerDay.trim() !== '' &&
            (form.noDeposit || form.depositAmount.trim() !== '') &&
            form.pickupLocation.trim() !== ''
          );
        default:
          return true;
      }
    },
    [form],
  );

  const canAdvance = isStepValid(step);

  const goNext = () => {
    if (!canAdvance) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addImages(e.dataTransfer.files);
    },
    [addImages],
  );

  const handlePublish = () => setPublished(true);

  /* ─── Success screen ─── */
  if (published) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.successOverlay}>
              <div className={styles.successIcon}>
                <Check size={36} />
              </div>
              <h2 className={styles.successTitle}>Объявление создано!</h2>
              <p className={styles.successText}>
                Ваше объявление опубликовано и уже доступно в каталоге.
                Арендаторы смогут найти его по поиску.
              </p>
              <button
                type="button"
                className={styles.navNext}
                onClick={() => {
                  setPublished(false);
                  setStep(0);
                  setForm(INITIAL);
                }}
              >
                <Plus size={16} />
                Создать ещё
              </button>
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
                  className={`${styles.stepConnector} ${i <= step ? styles.stepConnectorDone : ''}`}
                />
              )}
              <div
                className={`${styles.stepItem} ${
                  i === step
                    ? styles.stepItemActive
                    : i < step
                      ? styles.stepItemCompleted
                      : ''
                }`}
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
              maxImages={MAX_IMAGES}
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
              className={`${styles.navNext} ${!canAdvance ? styles.navDisabled : ''}`}
              onClick={goNext}
              disabled={!canAdvance}
            >
              Далее
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.navNext} ${styles.publishBtn}`}
              onClick={handlePublish}
            >
              <Sparkles size={16} />
              Опубликовать
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

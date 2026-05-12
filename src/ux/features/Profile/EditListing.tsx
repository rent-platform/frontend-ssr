'use client';

import { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

const MAX_IMAGES = 10;

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
  const router = useRouter();

  const listing = useMemo(
    () => MOCK_LISTINGS.find((l) => l.id === params.id) ?? null,
    [params.id],
  );

  const initial = useMemo(
    () => listing ? listingToFormData(listing) : null,
    [listing],
  );

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateListingFormData>(initial ?? {
    title: '', category: '', condition: 'good', description: '',
    images: [], specs: [], pricePerDay: '', pricePerHour: '',
    depositAmount: '', noDeposit: false, pickupLocation: '', city: '',
  });
  const [saved, setSaved] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragSourceId = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => router.push(listing ? ROUTES.listing(listing.id) : ROUTES.profile);

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
      if (img && !img.id.startsWith('existing-')) URL.revokeObjectURL(img.url);
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
        case 0: return form.images.length > 0;
        case 1:
          return (
            form.title.trim() !== '' &&
            form.category !== '' &&
            form.description.trim() !== '' &&
            (form.specs.length === 0 || form.specs.every((sp) => sp.value !== ''))
          );
        case 2:
          return (
            form.pricePerDay.trim() !== '' &&
            (form.noDeposit || form.depositAmount.trim() !== '') &&
            form.pickupLocation.trim() !== ''
          );
        default: return true;
      }
    },
    [form],
  );

  const isFormDirty = useMemo(() => {
    if (!initial) return false;
    return (
      form.title !== initial.title ||
      form.category !== initial.category ||
      form.description !== initial.description ||
      form.pricePerDay !== initial.pricePerDay ||
      form.pricePerHour !== initial.pricePerHour ||
      form.depositAmount !== initial.depositAmount ||
      form.noDeposit !== initial.noDeposit ||
      form.pickupLocation !== initial.pickupLocation ||
      form.images.length !== initial.images.length
    );
  }, [form, initial]);

  const canAdvance = isStepValid(step);
  const goNext = () => {
    if (!canAdvance) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addImages(e.dataTransfer.files);
    },
    [addImages],
  );

  const handleSave = () => {
    setSaved(true);
  };

  const handleExitClick = (e: React.MouseEvent) => {
    if (isFormDirty) {
      e.preventDefault();
      setShowExitModal(true);
    } else {
      handleBack();
    }
  };

  const confirmExit = () => {
    setShowExitModal(false);
    handleBack();
  };

  /* ─── Success screen ─── */
  if (saved) {
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
                <a href={listing ? ROUTES.listing(listing.id) : ROUTES.profile} className={styles.navBack}>
                  <ChevronLeft size={16} />
                  К объявлению
                </a>
                <button
                  type="button"
                  className={styles.navNext}
                  onClick={() => {
                    setSaved(false);
                    setStep(0);
                  }}
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
          <a href={listing ? ROUTES.listing(listing.id) : ROUTES.profile} className={styles.backLink} onClick={handleExitClick}>
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
              onClick={handleSave}
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

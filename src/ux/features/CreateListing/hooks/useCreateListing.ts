import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateListingFormData, ImagePreview } from '../types';
import { ROUTES } from '@/ux/utils';

/* ─── Constants ─── */
const INITIAL: CreateListingFormData = {
  title: '',
  category: '',
  condition: 'good',
  description: '',
  images: [],
  specs: [],
  city: '',
  pricePerDay: '',
  pricePerHour: '',
  depositAmount: '',
  noDeposit: false,
  pickupLocation: '',
};

const MAX_IMAGES = 10;
const STEP_COUNT = 4;

export type UseCreateListingOptions = {
  onSubmit?: (data: CreateListingFormData) => void | Promise<void>;
  onSaveDraft?: (data: CreateListingFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  /** Pre-fill the form for edit mode. When set, isFormDirty compares against this snapshot. */
  initialData?: CreateListingFormData;
  /** Route to navigate on exit. Defaults to ROUTES.catalog. */
  exitRoute?: string;
};

export function useCreateListing({
  onSubmit,
  onSaveDraft,
  isSubmitting = false,
  initialData,
  exitRoute,
}: UseCreateListingOptions = {}) {
  const isEditMode = !!initialData;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateListingFormData>(initialData ?? INITIAL);
  const [published, setPublished] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragSourceId = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  /* ─── Form helpers ─── */
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

  /* ─── Validation ─── */
  const isStepValid = useCallback(
    (s: number): boolean => {
      switch (s) {
        case 0:
          return form.images.length > 0;
        case 1:
          return (
            form.title.trim() !== '' &&
            form.category !== '' &&
            form.city !== '' &&
            form.description.trim() !== '' &&
            (form.specs.length === 0 || form.specs.every((s) => s.value !== ''))
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

  const isFormDirty = useMemo(() => {
    if (initialData) {
      return (
        form.title !== initialData.title ||
        form.category !== initialData.category ||
        form.description !== initialData.description ||
        form.pricePerDay !== initialData.pricePerDay ||
        form.pricePerHour !== initialData.pricePerHour ||
        form.depositAmount !== initialData.depositAmount ||
        form.noDeposit !== initialData.noDeposit ||
        form.pickupLocation !== initialData.pickupLocation ||
        form.images.length !== initialData.images.length
      );
    }
    return (
      form.images.length > 0 ||
      form.title.trim() !== '' ||
      form.category !== '' ||
      form.city !== '' ||
      form.description.trim() !== '' ||
      form.pricePerDay.trim() !== '' ||
      form.pricePerHour.trim() !== '' ||
      form.depositAmount.trim() !== '' ||
      form.pickupLocation.trim() !== '' ||
      form.specs.length > 0 ||
      form.noDeposit !== false
    );
  }, [form, initialData]);

  const canAdvance = isStepValid(step);

  /* ─── Navigation ─── */
  const goNext = useCallback(() => {
    if (!canAdvance) return;
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [canAdvance]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const resolvedExitRoute = exitRoute ?? ROUTES.catalog;

  const handleExitClick = useCallback(
    (e: React.MouseEvent) => {
      if (isFormDirty) {
        e.preventDefault();
        setShowExitModal(true);
      } else if (isEditMode) {
        e.preventDefault();
        router.push(resolvedExitRoute);
      }
    },
    [isFormDirty, isEditMode, resolvedExitRoute, router],
  );

  const confirmExit = useCallback(() => {
    setShowExitModal(false);
    router.push(resolvedExitRoute);
  }, [router, resolvedExitRoute]);

  /* ─── Drop handler ─── */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addImages(e.dataTransfer.files);
    },
    [addImages],
  );

  /* ─── Submit / Draft ─── */
  const handlePublish = useCallback(async () => {
    if (onSubmit) await onSubmit(form);
    setPublished(true);
  }, [form, onSubmit]);

  const handleSaveDraft = useCallback(async () => {
    if (onSaveDraft) await onSaveDraft(form);
    setDraftSaved(true);
  }, [form, onSaveDraft]);

  const handleSaveDraftAndExit = useCallback(async () => {
    await handleSaveDraft();
    setShowExitModal(false);
    router.push(resolvedExitRoute);
  }, [handleSaveDraft, router, resolvedExitRoute]);

  const resetForm = useCallback(() => {
    setPublished(false);
    setDraftSaved(false);
    setStep(0);
    setForm(initialData ?? INITIAL);
  }, [initialData]);

  return {
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
    isFormDirty,
    maxImages: MAX_IMAGES,
    stepCount: STEP_COUNT,
    patch,
    addImages,
    removeImage,
    reorderImages,
    isStepValid,
    goNext,
    goBack,
    handleExitClick,
    confirmExit,
    handleDrop,
    handlePublish,
    handleSaveDraft,
    handleSaveDraftAndExit,
    resetForm,
    isEditMode,
    exitRoute: resolvedExitRoute,
  };
}

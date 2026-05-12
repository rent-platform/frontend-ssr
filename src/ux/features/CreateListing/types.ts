/* ─── Condition ─── */

export type ListingCondition = 'new' | 'like_new' | 'good' | 'used';

/* ─── Image preview (local blob) ─── */

export type ImagePreview = {
  id: string;
  url: string;
};

/* ─── Spec entry (label + value pair) ─── */

export type SpecEntry = {
  label: string;
  value: string;
};

/* ─── Create listing form data ─── */

export type CreateListingFormData = {
  title: string;
  category: string;
  condition: ListingCondition;
  description: string;
  images: ImagePreview[];
  specs: SpecEntry[];
  city: string;
  pricePerDay: string;
  pricePerHour: string;
  depositAmount: string;
  noDeposit: boolean;
  pickupLocation: string;
};

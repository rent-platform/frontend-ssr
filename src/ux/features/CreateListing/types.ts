/* ─── Condition ─── */

export type ListingCondition = 'new' | 'like_new' | 'good' | 'used';

/* ─── Image preview (local blob) ─── */

export type ImagePreview = {
  id: string;
  url: string;
};

/* ─── Create listing form data ─── */

export type CreateListingFormData = {
  title: string;
  category: string;
  condition: ListingCondition;
  description: string;
  images: ImagePreview[];
  pricePerDay: string;
  pricePerHour: string;
  depositAmount: string;
  noDeposit: boolean;
  pickupLocation: string;
};

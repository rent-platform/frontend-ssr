"use client";

import { useCreateAd, useUploadAdPhotos } from "@/business/ads";
import { resetCreateListingDraft, showToast, useAppDispatch } from "@/business/shared";
import { CreateListing } from "@/ux/features";
import type { CreateListingFormData } from "@/ux/features/CreateListing/types";

function toNumber(value: string): number | null {
  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export default function CreateListingPage() {
  const dispatch = useAppDispatch();
  const { createAd, isCreating } = useCreateAd();
  const { uploadPhotos, isUploading } = useUploadAdPhotos();

  const handleSubmit = async (data: CreateListingFormData) => {
    try {
      const createdAd = await createAd({
        categoryId: Number(data.categoryId) || 1,
        title: data.title,
        itemDescription: data.description,
        pricePerDay: toNumber(data.pricePerDay),
        pricePerHour: toNumber(data.pricePerHour),
        depositAmount: data.noDeposit ? 0 : (toNumber(data.depositAmount) ?? 0),
        city: "Новосибирск",
        pickupLocation: data.pickupLocation,
      }).unwrap();

      if (data.images.length > 0) {
        await uploadPhotos(
          createdAd.id,
          data.images.map((image, index) => ({
            photoUrl: image.url,
            sortOrder: index,
          })),
        );
      }

      dispatch(resetCreateListingDraft());
      dispatch(showToast({ type: "success", message: "Объявление создано" }));
    } catch {
      dispatch(showToast({ type: "error", message: "Не удалось создать объявление" }));
      throw new Error("Create listing failed");
    }
  };

  return <CreateListing onSubmit={handleSubmit} isSubmitting={isCreating || isUploading} />;
}

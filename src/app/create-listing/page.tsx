"use client";

import { useAdLifecycle, useCreateAd } from "@/business/ads";
import {
  resetCreateListingDraft,
  showToast,
  useAppDispatch,
} from "@/business/shared";
import { CreateListing } from "@/ux/features";
import type { CreateListingFormData } from "@/ux/features/CreateListing/types";

function toNumber(value: string): number | null {
  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function buildPhotoUrl(data: CreateListingFormData, index: number): string {
  const label = encodeURIComponent(`${data.title || "Listing"} ${index + 1}`);
  return `https://placehold.co/800x600?text=${label}`;
}

export default function CreateListingPage() {
  const dispatch = useAppDispatch();
  const { createAd, isCreating } = useCreateAd();
  const { sendToModeration, isLoading: isLifecycleLoading } = useAdLifecycle();

  const handleSubmit = async (data: CreateListingFormData) => {
    try {
      const payload = {
        categoryId: Number(data.categoryId) || 1,
        title: data.title,
        itemDescription: data.description,
        pricePerDay: toNumber(data.pricePerDay),
        pricePerHour: toNumber(data.pricePerHour),
        depositAmount: data.noDeposit ? 0 : (toNumber(data.depositAmount) ?? 0),
        city: "Новосибирск",
        pickupLocation: data.pickupLocation,
        photos: data.images.map((_, index) => ({
          photoUrl: buildPhotoUrl(data, index),
          sortOrder: index,
        })),
      };

      console.log("[TRACE][CREATE_LISTING][PAGE] create item request prepared", {
        imagesCount: data.images.length,
        photosCount: payload.photos.length,
        sortOrders: payload.photos.map((photo) => photo.sortOrder),
        payload,
      });
      const createdAd = await createAd(payload).unwrap();
      console.log("[TRACE][CREATE_LISTING][PAGE] item created as draft", {
        adId: createdAd.id,
        status: createdAd.status,
        moderationComment: createdAd.moderationComment,
      });

      const moderatedAd = await sendToModeration(createdAd.id);
      console.log("[TRACE][CREATE_LISTING][PAGE] publish flow finished", {
        adId: moderatedAd.id,
        status: moderatedAd.status,
        expectedModeratorAction: "approve_or_reject",
      });

      dispatch(resetCreateListingDraft());
      console.log("[TRACE][CREATE_LISTING][STORE] draft reset after success", {
        adId: moderatedAd.id,
      });
      dispatch(showToast({ type: "success", message: "Объявление отправлено на модерацию" }));
    } catch (error) {
      console.log("[TRACE][CREATE_LISTING][PAGE] submit failed", {
        message: error instanceof Error ? error.message : String(error),
      });
      dispatch(
        showToast({
          type: "error",
          message: "Не удалось отправить объявление на модерацию",
        }),
      );
      throw new Error("Create listing failed");
    }
  };

  return (
    <CreateListing
      onSubmit={handleSubmit}
      isSubmitting={isCreating || isLifecycleLoading}
    />
  );
}

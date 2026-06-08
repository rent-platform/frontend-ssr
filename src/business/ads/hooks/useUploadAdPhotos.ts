"use client";

import { useAddAdPhotoMutation } from "../api";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { AddPhotoRequestDto, PhotoResponseDto } from "../types";

interface UseUploadAdPhotosResult {
  uploadPhotos: (
    adId: string,
    photos: AddPhotoRequestDto[],
  ) => Promise<unknown[]>;
  uploadedPhotos: PhotoResponseDto[];
  isUploading: boolean;
  isError: boolean;
  uploadError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useUploadAdPhotos(): UseUploadAdPhotosResult {
  const [addPhoto, { data, isLoading, isError, isSuccess, error, reset }] =
    useAddAdPhotoMutation();

  return {
    uploadPhotos: async (adId: string, photos: AddPhotoRequestDto[]) => {
      console.log("[TRACE][CREATE_LISTING][HOOK] upload photos mutation start", {
        adId,
        photosCount: photos.length,
        sortOrders: photos.map((photo) => photo.sortOrder),
      });
      try {
        const result = await Promise.all(
          photos.map((photo) => addPhoto({ adId, photo }).unwrap()),
        );
        console.log("[TRACE][CREATE_LISTING][HOOK] upload photos mutation finished success", {
          adId,
          uploadedCount: result.length,
        });
        return result;
      } catch (uploadError) {
        console.log("[TRACE][CREATE_LISTING][HOOK] upload photos mutation finished failed", {
          adId,
          message: uploadError instanceof Error ? uploadError.message : String(uploadError),
        });
        throw uploadError;
      }
    },
    uploadedPhotos: data ? [data] : [],
    isUploading: isLoading,
    isError,
    uploadError: getApiError(error),
    isSuccess,
    reset,
  };
}

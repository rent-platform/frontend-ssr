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
    uploadPhotos: (adId: string, photos: AddPhotoRequestDto[]) =>
      Promise.all(photos.map((photo) => addPhoto({ adId, photo }).unwrap())),
    uploadedPhotos: data ? [data] : [],
    isUploading: isLoading,
    isError,
    uploadError: getApiError(error),
    isSuccess,
    reset,
  };
}

"use client";

import { useUploadAdPhotosMutation } from "@/business/api";
import type { Photo } from "@/business/types/dto/ads.dto";

interface UseUploadAdPhotosResult {
  uploadPhotos: (adId: string, files: File[]) => void;
  uploadedPhotos: Photo[];
  isUploading: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useUploadAdPhotos(): UseUploadAdPhotosResult {
  const [uploadMutation, { data, isLoading, isError, isSuccess, reset }] =
    useUploadAdPhotosMutation();

  return {
    uploadPhotos: (adId: string, files: File[]) =>
      uploadMutation({ adId, files }),
    uploadedPhotos: data?.photos ?? [],
    isUploading: isLoading,
    isError,
    isSuccess,
    reset,
  };
}

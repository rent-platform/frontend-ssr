"use client";

import { useUploadAdPhotosMutation } from "@/business/api";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { Photo } from "@/business/types";

interface UseUploadAdPhotosResult {
  uploadPhotos: (adId: string, files: File[]) => void;
  uploadedPhotos: Photo[];
  isUploading: boolean;
  isError: boolean;
  uploadError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useUploadAdPhotos(): UseUploadAdPhotosResult {
  const [
    uploadMutation,
    { data, isLoading, isError, isSuccess, error, reset },
  ] = useUploadAdPhotosMutation();

  return {
    uploadPhotos: (adId: string, files: File[]) =>
      uploadMutation({ adId, files }),
    uploadedPhotos: data?.photos ?? [],
    isUploading: isLoading,
    isError,
    uploadError: getApiError(error),
    isSuccess,
    reset,
  };
}

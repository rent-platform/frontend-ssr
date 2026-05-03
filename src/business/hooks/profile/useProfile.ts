"use client";

import { useSession } from "@/business/hooks/session/useSession";
import {
  useGetProfileQuery,
  useUpdateUserInfoMutation,
  useUploadAvatarMutation,
} from "@/business/api";
import { mapProfileToVM, mapSessionUserToProfileVM } from "@/business/mappers";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { ProfileUpdateDto, ProfileVM } from "@/business/types";

export interface UseProfileResult {
  profile: ProfileVM | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiUiError | null;
  isUpdating: boolean;
  isUploadingAvatar: boolean;
  updateError: ApiUiError | null;
  uploadError: ApiUiError | null;
  updateProfile: (data: ProfileUpdateDto) => void;
  uploadAvatar: (file: File) => void;
}

export function useProfile(): UseProfileResult {
  const { user } = useSession();
  const userId = user?.id;

  // TODO: убрать skip когда бекенд будет готов
  const { data, isLoading, isError, error } = useGetProfileQuery(userId!, {
    skip: !userId, // запрос падает
  });

  const [updateUserInfo, { isLoading: isUpdating, error: updateProfileError }] =
    useUpdateUserInfoMutation();
  const [
    uploadAvatarMutation,
    { isLoading: isUploadingAvatar, error: uploadAvatarError },
  ] = useUploadAvatarMutation();

  // пока бекенда нет data undefined, берём из сессии
  const profile: ProfileVM | null = data
    ? mapProfileToVM(data)
    : user
      ? mapSessionUserToProfileVM(user) // временная тема
      : null;

  return {
    profile,
    isLoading,
    isError,
    error: getApiError(error),
    isUpdating,
    isUploadingAvatar,
    updateError: getApiError(updateProfileError),
    uploadError: getApiError(uploadAvatarError),
    updateProfile: (data: ProfileUpdateDto) => {
      if (userId) updateUserInfo({ userId, data });
    },
    uploadAvatar: (file: File) => {
      if (userId) uploadAvatarMutation({ userId, file });
    },
  };
}

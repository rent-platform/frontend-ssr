"use client";

import { useSession } from "@/business/hooks/session/useSession";
import {
  useGetProfileQuery,
  useUpdateUserInfoMutation,
  useUploadAvatarMutation,
} from "@/business/api/profile/endpoints";
import { mapProfileToVM, mapSessionUserToProfileVM } from "@/business/mappers";
import type { ProfileUpdateDto } from "@/business/types/dto/profile.dto";
import type { ProfileVM } from "@/business/types/view/profile.view";

export interface UseProfileResult {
  profile: ProfileVM | null;
  isLoading: boolean;
  isError: boolean;
  isUpdating: boolean;
  isUploadingAvatar: boolean;
  updateProfile: (data: ProfileUpdateDto) => void;
  uploadAvatar: (file: File) => void;
}

export function useProfile(): UseProfileResult {
  const { user } = useSession();
  const userId = user?.id;

  // TODO: убрать skip когда бекенд будет готов
  const { data, isLoading, isError } = useGetProfileQuery(userId!, {
    skip: !userId, // запрос падает
  });

  const [updateUserInfo, { isLoading: isUpdating }] =
    useUpdateUserInfoMutation();
  const [uploadAvatarMutation, { isLoading: isUploadingAvatar }] =
    useUploadAvatarMutation();

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
    isUpdating,
    isUploadingAvatar,
    updateProfile: (data: ProfileUpdateDto) => {
      if (userId) updateUserInfo({ userId, data });
    },
    uploadAvatar: (file: File) => {
      if (userId) uploadAvatarMutation({ userId, file });
    },
  };
}

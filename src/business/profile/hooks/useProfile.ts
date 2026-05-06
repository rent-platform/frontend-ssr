"use client";

import { useSession } from "@/business/auth";
import {
  useGetCurrentProfileQuery,
  useUpdateUserInfoMutation,
} from "../api";
import { mapProfileToVM, mapSessionUserToProfileVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { ProfileUpdateDto, ProfileVM } from "../types";

export interface UseProfileResult {
  profile: ProfileVM | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiUiError | null;
  isUpdating: boolean;
  updateError: ApiUiError | null;
  updateProfile: (data: ProfileUpdateDto) => void;
}

export function useProfile(): UseProfileResult {
  const { user } = useSession();
  const userId = user?.id;

  // TODO: убрать skip когда бекенд будет готов
  const { data, isLoading, isError, error } = useGetCurrentProfileQuery(undefined, {
    skip: !userId, // запрос падает
  });

  const [updateUserInfo, { isLoading: isUpdating, error: updateProfileError }] =
    useUpdateUserInfoMutation();

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
    updateError: getApiError(updateProfileError),
    updateProfile: (data: ProfileUpdateDto) => {
      if (userId) updateUserInfo({ userId, data });
    },
  };
}






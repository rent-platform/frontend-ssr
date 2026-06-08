"use client";

import { useCallback } from "react";
import {
  useArchiveAdMutation,
  useRestoreAdMutation,
  useReturnAdToDraftMutation,
  useSendAdToModerationMutation,
} from "../api";
import { getApiError, type ApiUiError } from "@/business/shared";
import type { AdsItemResponseDto } from "../types";

export type UseAdLifecycleResult = {
  sendToModeration: (itemId: string) => Promise<AdsItemResponseDto>;
  returnToDraft: (itemId: string) => Promise<AdsItemResponseDto>;
  archiveAd: (itemId: string) => Promise<AdsItemResponseDto>;
  restoreAd: (itemId: string) => Promise<AdsItemResponseDto>;
  isLoading: boolean;
  error: ApiUiError | null;
};

export function useAdLifecycle(): UseAdLifecycleResult {
  const [sendToModerationMutation, sendState] = useSendAdToModerationMutation();
  const [returnToDraftMutation, returnState] = useReturnAdToDraftMutation();
  const [archiveAdMutation, archiveState] = useArchiveAdMutation();
  const [restoreAdMutation, restoreState] = useRestoreAdMutation();

  const sendToModeration = useCallback(
    async (itemId: string) => {
      console.log("[TRACE][LISTING_LIFECYCLE][FLOW] send to moderation submitted", {
        itemId,
        fromStatus: "DRAFT",
        expectedStatus: "MODERATION",
      });
      const result = await sendToModerationMutation(itemId).unwrap();
      console.log("[TRACE][LISTING_LIFECYCLE][FLOW] listing moved to moderation", {
        itemId: result.id,
        status: result.status,
      });
      return result;
    },
    [sendToModerationMutation],
  );

  const returnToDraft = useCallback(
    async (itemId: string) => {
      console.log("[TRACE][LISTING_LIFECYCLE][FLOW] return to draft submitted", {
        itemId,
        expectedStatus: "DRAFT",
      });
      const result = await returnToDraftMutation(itemId).unwrap();
      console.log("[TRACE][LISTING_LIFECYCLE][FLOW] listing returned to draft", {
        itemId: result.id,
        status: result.status,
      });
      return result;
    },
    [returnToDraftMutation],
  );

  const archiveAd = useCallback(
    async (itemId: string) => {
      console.log("[TRACE][LISTING_LIFECYCLE][FLOW] archive listing submitted", {
        itemId,
        fromStatus: "ACTIVE",
        expectedStatus: "ARCHIVED",
      });
      const result = await archiveAdMutation(itemId).unwrap();
      console.log("[TRACE][LISTING_LIFECYCLE][FLOW] listing archived", {
        itemId: result.id,
        status: result.status,
      });
      return result;
    },
    [archiveAdMutation],
  );

  const restoreAd = useCallback(
    async (itemId: string) => {
      console.log("[TRACE][LISTING_LIFECYCLE][FLOW] restore listing submitted", {
        itemId,
        fromStatus: "ARCHIVED",
        expectedStatus: "DRAFT",
      });
      const result = await restoreAdMutation(itemId).unwrap();
      console.log("[TRACE][LISTING_LIFECYCLE][FLOW] listing restored to draft", {
        itemId: result.id,
        status: result.status,
      });
      return result;
    },
    [restoreAdMutation],
  );

  const activeError =
    sendState.error ?? returnState.error ?? archiveState.error ?? restoreState.error;

  return {
    sendToModeration,
    returnToDraft,
    archiveAd,
    restoreAd,
    isLoading:
      sendState.isLoading ||
      returnState.isLoading ||
      archiveState.isLoading ||
      restoreState.isLoading,
    error: getApiError(activeError),
  };
}

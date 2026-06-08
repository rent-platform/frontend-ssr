"use client";

import { useCallback } from "react";
import { useCreateComplaintMutation } from "../api";
import { getApiError, type ApiUiError } from "@/business/shared";
import type {
  ComplaintResponseDto,
  CreateComplaintRequestDto,
} from "../types";

export type UseCreateComplaintResult = {
  createComplaint: (
    payload: CreateComplaintRequestDto,
  ) => Promise<ComplaintResponseDto>;
  complaint: ComplaintResponseDto | null;
  isCreating: boolean;
  isError: boolean;
  error: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
};

export function useCreateComplaint(): UseCreateComplaintResult {
  const [
    createComplaintMutation,
    { data, isLoading, isError, error, isSuccess, reset },
  ] = useCreateComplaintMutation();

  const createComplaint = useCallback(
    async (payload: CreateComplaintRequestDto) => {
      console.log("[TRACE][COMPLAINT][REST] create complaint start", {
        targetType: payload.targetType,
        targetId: payload.targetId,
        reasonLength: payload.reason.length,
      });
      try {
        const complaint = await createComplaintMutation(payload).unwrap();
        console.log("[TRACE][COMPLAINT][REST] create complaint success", {
          complaintId: complaint.id,
          targetType: complaint.targetType,
          targetId: complaint.targetId,
          status: complaint.status,
        });
        return complaint;
      } catch (error) {
        console.log("[TRACE][COMPLAINT][REST] create complaint failed", {
          targetType: payload.targetType,
          targetId: payload.targetId,
          error,
        });
        throw error;
      }
    },
    [createComplaintMutation],
  );

  return {
    createComplaint,
    complaint: data ?? null,
    isCreating: isLoading,
    isError,
    error: getApiError(error),
    isSuccess,
    reset,
  };
}

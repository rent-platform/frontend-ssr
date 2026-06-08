"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetItemAvailability } from "@/business/ads";
import { useCreateChat } from "@/business/chat";
import {
  setActiveChat,
  setBookingDates,
  setBookingDealId,
  setBookingPriceBreakdown,
  setBookingStep,
  showToast,
  startBookingForItem,
  useAppDispatch,
  useAppSelector,
} from "@/business/shared";
import { useCreateDealRequest } from "./useCreateDealRequest";

const tracedBookingContextItems = new Set<string>();

type RentalBookingItem = {
  id: string;
  title: string;
  ownerId?: string | null;
  isAvailable?: boolean;
  nearestAvailableDate?: string | null;
  pricePerDay?: string | number | null;
  depositAmount?: string | number | null;
};

type UseRentalBookingArgs = {
  item: RentalBookingItem;
  isGuest: boolean;
  onAuthRequired?: () => void;
};

function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseBookingDate(value: string): Date {
  return new Date(value.length === 10 ? `${value}T00:00:00` : value);
}

function getMonthRange(date = new Date()) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    startDate: toDateOnly(monthStart),
    endDate: toDateOnly(monthEnd),
  };
}

function isDateKeyInRange(dateKey: string, startDate: string, endDate: string) {
  return dateKey >= startDate && dateKey <= endDate;
}

function toBackendDateTime(dateKey: string): string {
  return `${dateKey}T00:00:00.000Z`;
}

function toAmount(value: string | number | null | undefined): number {
  return Number(String(value ?? "0").replace(/\s/g, ""));
}

function getScenarioErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      data?: { message?: string; error?: string };
      message?: string;
      error?: string;
      status?: string | number;
    };

    return (
      maybeError.data?.message ??
      maybeError.data?.error ??
      maybeError.message ??
      maybeError.error ??
      (maybeError.status
        ? `Request failed with status ${maybeError.status}`
        : JSON.stringify(error))
    );
  }
  return String(error);
}

export function useRentalBooking({
  item,
  isGuest,
  onAuthRequired,
}: UseRentalBookingArgs) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const booking = useAppSelector((state) => state.booking);
  const { createChat, isCreating: isCreatingChat } = useCreateChat();
  const { createDealRequest, isCreating: isCreatingDeal } =
    useCreateDealRequest();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [availabilityRange, setAvailabilityRange] = useState(() =>
    getMonthRange(),
  );
  const startDate = useMemo(
    () => (booking.startDate ? parseBookingDate(booking.startDate) : null),
    [booking.startDate],
  );
  const endDate = useMemo(
    () => (booking.endDate ? parseBookingDate(booking.endDate) : null),
    [booking.endDate],
  );
  const availability = useGetItemAvailability(
    item.id,
    availabilityRange.startDate,
    availabilityRange.endDate,
  );
  const isCheckingAvailability =
    availability.isLoading || availability.isFetching;
  const isSubmittingRequest = isCreatingDeal || isCheckingAvailability;
  const depositAmount = toAmount(item.depositAmount);
  const dailyPrice = toAmount(item.pricePerDay);
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Math.max(
      1,
      Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
  }, [startDate, endDate]);
  const subtotal = dailyPrice * (rentalDays || 1);

  useEffect(() => {
    dispatch(
      setBookingPriceBreakdown({
        rentAmount: subtotal,
        depositAmount,
        serviceFee: 0,
        total: subtotal + depositAmount,
      }),
    );
  }, [depositAmount, dispatch, subtotal]);

  useEffect(() => {
    if (booking.itemId !== item.id) {
      if (!tracedBookingContextItems.has(item.id)) {
        tracedBookingContextItems.add(item.id);
      }
      dispatch(startBookingForItem(item.id));
    }
  }, [
    booking.itemId,
    dispatch,
    item.id,
    item.isAvailable,
    item.nearestAvailableDate,
    item.title,
  ]);

  const handleDateSelect = useCallback(
    (start: Date | null, end: Date | null) => {
      const nextRentalDays =
        start && end
          ? Math.max(
              1,
              Math.round(
                (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
              ),
            )
          : 0;
      const nextStartDate = start ? toDateOnly(start) : null;
      const nextEndDate = end ? toDateOnly(end) : null;

      dispatch(
        setBookingDates({
          startDate: nextStartDate,
          endDate: nextEndDate,
          rentalDays: nextRentalDays,
        }),
      );
    },
    [dispatch, item.id],
  );

  const handleCalendarConfirm = useCallback(() => {
    setCalendarOpen(false);
    if (startDate && endDate) {
      dispatch(setBookingStep("confirm_request"));
    }
  }, [dispatch, endDate, startDate]);

  const handleProtectedAction = useCallback(() => {
    if (isGuest) {
      onAuthRequired?.();
      return;
    }

    setCalendarOpen(true);
  }, [booking.endDate, booking.startDate, isGuest, item.id, onAuthRequired]);

  const handleOpenChat = useCallback(async () => {
    if (isGuest) {
      onAuthRequired?.();
      return;
    }

    try {
      const chat = await createChat({ itemId: item.id });

      dispatch(setActiveChat(chat.id));
      router.push("/chat");
    } catch (error) {
      dispatch(showToast({ type: "error", message: "Не удалось открыть чат" }));
    }
  }, [
    createChat,
    dispatch,
    isGuest,
    item.id,
    item.ownerId,
    onAuthRequired,
    router,
  ]);

  const handlePayment = useCallback(async () => {
    if (isGuest) {
      onAuthRequired?.();
      return;
    }
    if (!booking.startDate || !booking.endDate) {
      setCalendarOpen(true);
      return;
    }
    const selectedStartDate = booking.startDate;
    const selectedEndDate = booking.endDate;
    try {
      const unavailableSlots = availability.availability.filter(
        (slot) => !slot.isAvailable,
      );
      const selectedUnavailableSlots = unavailableSlots.filter((slot) =>
        isDateKeyInRange(
          slot.availableDate.slice(0, 10),
          selectedStartDate,
          selectedEndDate,
        ),
      );
      if (isCheckingAvailability) {
        dispatch(
          showToast({ type: "info", message: "Проверяем доступность дат" }),
        );
        return;
      }
      if (availability.isError) {
        dispatch(
          showToast({
            type: "error",
            message: "Не удалось проверить доступность дат",
          }),
        );
        return;
      }
      if (selectedUnavailableSlots.length > 0) {
        dispatch(
          showToast({ type: "error", message: "Выбранные даты недоступны" }),
        );
        return;
      }

      const deal = booking.currentDealId
        ? { id: booking.currentDealId }
        : await createDealRequest({
            itemId: item.id,
            startDate: toBackendDateTime(selectedStartDate),
            endDate: toBackendDateTime(selectedEndDate),
            pricingMode: "DAY",
          });
      dispatch(setBookingDealId(deal.id));
      dispatch(setBookingStep("waiting_owner"));
      dispatch(
        showToast({
          type: "success",
          message: "Заявка отправлена владельцу",
        }),
      );
    } catch (error) {
      dispatch(
        showToast({ type: "error", message: "Не удалось создать заявку" }),
      );
    }
  }, [
    availability.availability,
    availability.error,
    availability.isError,
    booking.currentDealId,
    booking.endDate,
    booking.startDate,
    createDealRequest,
    dispatch,
    isCheckingAvailability,
    isGuest,
    item.id,
    onAuthRequired,
  ]);

  const handleMonthChange = useCallback((monthStart: Date, monthEnd: Date) => {
    setAvailabilityRange({
      startDate: toDateOnly(monthStart),
      endDate: toDateOnly(monthEnd),
    });
  }, []);

  return {
    availability: availability.availability,
    calendarOpen,
    dailyPrice,
    depositAmount,
    endDate,
    handleCalendarConfirm,
    handleCloseCalendar: () => setCalendarOpen(false),
    handleDateSelect,
    handleMonthChange,
    handleOpenChat,
    handlePayment,
    handleProtectedAction,
    isCreatingChat,
    isSubmittingRequest,
    rentalDays,
    startDate,
    subtotal,
  };
}

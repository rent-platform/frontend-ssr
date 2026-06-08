"use client";

import { useSession } from "@/business/auth";
import {
  useGetCurrentProfileQuery,
  useUpdateUserInfoMutation,
} from "../api";
import {
  mapProfileDashboardVM,
  mapProfileToVM,
  mapSessionUserToProfileVM,
} from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import { useFetchMyAdsQuery } from "@/business/ads";
import {
  useFetchMyIncomingDealsQuery,
  useFetchMyOutgoingDealsQuery,
} from "@/business/deals";
import { useFetchUserReviewSummaryQuery } from "@/business/reviews";
import type {
  ProfileDashboardStatsVM,
  ProfileDashboardVM,
  ProfileUpdateDto,
  ProfileVM,
} from "../types";

export interface UseProfileResult {
  profile: ProfileVM | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiUiError | null;
  isUpdating: boolean;
  updateError: ApiUiError | null;
  updateProfile: (data: ProfileUpdateDto) => void;
}

export interface UseProfileDashboardResult {
  dashboard: ProfileDashboardVM | null;
  profile: ProfileVM | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiUiError | null;
}

const EMPTY_DASHBOARD_STATS: ProfileDashboardStatsVM = {
  activeListings: 0,
  totalListings: 0,
  totalDeals: 0,
  activeBookings: 0,
  completedBookings: 0,
  rentedCount: 0,
  totalEarnings: "0",
  totalSpent: "0",
  responseRate: 0,
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(value);
}

function sumDealPrices(
  deals: Array<{ totalPrice?: number | null }> | undefined,
): string {
  const total =
    deals?.reduce((sum, deal) => sum + (deal.totalPrice ?? 0), 0) ?? 0;

  return formatMoney(total);
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

export function useProfileDashboard(): UseProfileDashboardResult {
  const { profile, isLoading: isProfileLoading, isError, error } = useProfile();
  const shouldSkip = !profile?.id;
  const ratingSummary = useFetchUserReviewSummaryQuery(profile?.id ?? "", {
    skip: shouldSkip,
  });

  const allListings = useFetchMyAdsQuery(
    {
      pageSize: 1,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    { skip: shouldSkip },
  );
  const activeListings = useFetchMyAdsQuery(
    {
      pageSize: 1,
      status: "ACTIVE",
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    { skip: shouldSkip },
  );
  const allOwnerDeals = useFetchMyIncomingDealsQuery(
    { size: 1, sort: ["createdAt,desc"] },
    { skip: shouldSkip },
  );
  const allRenterDeals = useFetchMyOutgoingDealsQuery(
    { size: 1, sort: ["createdAt,desc"] },
    { skip: shouldSkip },
  );
  const activeOwnerDeals = useFetchMyIncomingDealsQuery(
    { status: "ACTIVE", size: 1 },
    { skip: shouldSkip },
  );
  const activeRenterDeals = useFetchMyOutgoingDealsQuery(
    { status: "ACTIVE", size: 1 },
    { skip: shouldSkip },
  );
  const completedOwnerDeals = useFetchMyIncomingDealsQuery(
    { status: "COMPLETED", size: 50 },
    { skip: shouldSkip },
  );
  const completedRenterDeals = useFetchMyOutgoingDealsQuery(
    { status: "COMPLETED", size: 50 },
    { skip: shouldSkip },
  );

  const stats: ProfileDashboardStatsVM = profile
    ? {
        activeListings:
          activeListings.data?.totalElements ??
          EMPTY_DASHBOARD_STATS.activeListings,
        totalListings:
          allListings.data?.totalElements ?? EMPTY_DASHBOARD_STATS.totalListings,
        totalDeals:
          (allOwnerDeals.data?.totalElements ?? 0) +
          (allRenterDeals.data?.totalElements ?? 0),
        activeBookings:
          (activeOwnerDeals.data?.totalElements ?? 0) +
          (activeRenterDeals.data?.totalElements ?? 0),
        completedBookings:
          completedOwnerDeals.data?.totalElements ??
          EMPTY_DASHBOARD_STATS.completedBookings,
        rentedCount:
          completedRenterDeals.data?.totalElements ??
          EMPTY_DASHBOARD_STATS.rentedCount,
        totalEarnings: sumDealPrices(completedOwnerDeals.data?.content),
        totalSpent: sumDealPrices(completedRenterDeals.data?.content),
        responseRate: EMPTY_DASHBOARD_STATS.responseRate,
      }
    : EMPTY_DASHBOARD_STATS;

  const isDashboardLoading =
    isProfileLoading ||
    allListings.isLoading ||
    activeListings.isLoading ||
    allOwnerDeals.isLoading ||
    allRenterDeals.isLoading ||
    activeOwnerDeals.isLoading ||
    activeRenterDeals.isLoading ||
    completedOwnerDeals.isLoading ||
    completedRenterDeals.isLoading;
  const isReviewsLoading = ratingSummary.isLoading || ratingSummary.isFetching;

  return {
    dashboard: profile ? mapProfileDashboardVM(profile, stats, ratingSummary.data) : null,
    profile,
    isLoading: isDashboardLoading || isReviewsLoading,
    isError:
      isError ||
      allListings.isError ||
      activeListings.isError ||
      allOwnerDeals.isError ||
      allRenterDeals.isError ||
      activeOwnerDeals.isError ||
      activeRenterDeals.isError ||
      completedOwnerDeals.isError ||
      completedRenterDeals.isError ||
      ratingSummary.isError,
    error,
  };
}






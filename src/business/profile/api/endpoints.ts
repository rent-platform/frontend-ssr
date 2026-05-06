import { baseApi } from "@/business/shared";
import type {
  BillingProfileRequestDto,
  BillingProfileResponseDto,
  ProfileResponseDto,
  ProfileUpdateDto,
  PublicProfileResponseDto,
  UpdatePasswordRequestDto,
} from "../types";

const USERS_URL = "api/users";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<ProfileResponseDto, string>({
      query: (userId) => ({ url: `${USERS_URL}/${userId}` }),
      providesTags: (_result, _error, userId) => [
        { type: "Users", id: userId },
      ],
    }),

    getCurrentProfile: build.query<ProfileResponseDto, void>({
      query: () => ({ url: `${USERS_URL}/me` }),
      providesTags: [{ type: "Users", id: "ME" }],
    }),

    getPublicProfile: build.query<PublicProfileResponseDto, string>({
      query: (userId) => ({ url: `${USERS_URL}/${userId}/public` }),
      providesTags: (_result, _error, userId) => [
        { type: "Users", id: `PUBLIC-${userId}` },
      ],
    }),

    updateUserInfo: build.mutation<
      ProfileResponseDto,
      { userId?: string; data: ProfileUpdateDto }
    >({
      query: ({ data }) => ({
        url: `${USERS_URL}/me`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Users", id: "ME" },
        ...(userId ? [{ type: "Users" as const, id: userId }] : []),
      ],
    }),

    updatePassword: build.mutation<void, UpdatePasswordRequestDto>({
      query: (body) => ({
        url: `${USERS_URL}/me/password`,
        method: "PUT",
        body,
      }),
    }),

    getBillingProfile: build.query<BillingProfileResponseDto, void>({
      query: () => ({ url: `${USERS_URL}/me/billing` }),
      providesTags: [{ type: "Users", id: "BILLING" }],
    }),

    updateBillingProfile: build.mutation<
      BillingProfileResponseDto,
      BillingProfileRequestDto
    >({
      query: (body) => ({
        url: `${USERS_URL}/me/billing`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "Users", id: "BILLING" }],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetCurrentProfileQuery,
  useGetPublicProfileQuery,
  useUpdateUserInfoMutation,
  useUpdatePasswordMutation,
  useGetBillingProfileQuery,
  useUpdateBillingProfileMutation,
} = profileApi;

import { baseApi } from "@/business/api/baseApi";
import type {
  ProfileResponseDto,
  ProfileUpdateDto,
} from "@/business/types/dto/profile.dto";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<ProfileResponseDto, string>({
      query: (userId) => ({ url: `users/${userId}` }),
      providesTags: (_result, _error, userId) => [
        { type: "Users", id: userId },
      ],
    }),

    uploadAvatar: build.mutation<
      { avatar_url: string },
      { userId: string; file: File }
    >({
      query: ({ userId, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `users/${userId}/avatar`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Users", id: userId },
      ],
    }),

    updateUserInfo: build.mutation<
      ProfileResponseDto,
      { userId: string; data: ProfileUpdateDto }
    >({
      query: ({ userId, data }) => ({
        url: `users/${userId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Users", id: userId },
      ],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUploadAvatarMutation,
  useUpdateUserInfoMutation,
} = profileApi;

import { baseApi } from "@/business/shared";
import type {
  AdminUserResponseDto,
  BlockUserRequestDto,
  UpdateUserRoleRequestDto,
} from "../types";

const ADMIN_USERS_URL = "api/admin/users";

export const adminUsersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    blockUser: build.mutation<
      AdminUserResponseDto,
      { userId: string; body: BlockUserRequestDto }
    >({
      query: ({ userId, body }) => ({
        url: `${ADMIN_USERS_URL}/${userId}/block`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Users", id: userId },
      ],
    }),

    unblockUser: build.mutation<AdminUserResponseDto, string>({
      query: (userId) => ({
        url: `${ADMIN_USERS_URL}/${userId}/unblock`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: "Users", id: userId },
      ],
    }),

    updateUserRole: build.mutation<
      AdminUserResponseDto,
      { userId: string; body: UpdateUserRoleRequestDto }
    >({
      query: ({ userId, body }) => ({
        url: `${ADMIN_USERS_URL}/${userId}/role`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Users", id: userId },
      ],
    }),
  }),
});

export const {
  useBlockUserMutation,
  useUnblockUserMutation,
  useUpdateUserRoleMutation,
} = adminUsersApi;

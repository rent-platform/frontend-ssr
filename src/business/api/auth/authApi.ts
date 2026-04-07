import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  LoginRequestDTO,
  AuthResponseDTO,
  RegisterRequestDTO,
} from "@/business/types/dto/auth.dto";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
  }),
  tagTypes: ["Session"],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponseDTO, RegisterRequestDTO>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      invalidatesTags: ["Session"],
    }),
  }),
});

export const { useRegisterMutation } = authApi;

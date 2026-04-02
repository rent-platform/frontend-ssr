import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {AuthPayload,AuthResponse, RegisterPayload} from "@/business/types/api-dto";

// login/register/me/sessions/logout.


export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { session: { token: string | null } }).session.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Session"],
  endpoints: (builder) => ({
    /** POST /auth/login */
    login: builder.mutation<AuthResponse, AuthPayload>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["Session"],
    }),
    /** POST /auth/register */
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      invalidatesTags: ["Session"],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;




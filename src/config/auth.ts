import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/business/utils/authShecmas/authSchemas";
import {
  findMockUserByPhone,
  generateMockAccessToken,
  validateMockPassword,
} from "@/business/mocks/auth/mockUsers";
import NextAuth from "next-auth";
import type { User } from "next-auth";
import { fetchApi } from "@/business/api/auth/nextAuthApi";
import { decodeJwt } from "jose";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
const isMockingEnabled = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      async authorize(credentials): Promise<User | null> {
        if (isMockingEnabled) {
          try {
            if (!credentials) throw new Error("Нет данных для входа");
            const parsed = loginSchema.safeParse(credentials);
            if (!parsed.success) throw new Error("Невалидные данные");

            const { tel, password, rememberMe } = parsed.data;
            const mockUser = findMockUserByPhone(tel); // TODO: отправка на серв

            if (!mockUser) {
              throw new Error("Пользователь не найден");
            }

            if (!validateMockPassword(mockUser, password)) return null;

            return {
              id: mockUser.id!,
              email: mockUser.email ?? null,
              phone: mockUser.phone!,
              full_name: mockUser.full_name ?? null,
              nickname: mockUser.nickname ?? null,
              role: mockUser.role!,
              avatar_url: mockUser.avatar_url ?? null,
              rememberMe: rememberMe ?? false,
              accessToken: generateMockAccessToken(mockUser.id!),
              refreshToken: generateMockAccessToken(mockUser.id!), // TODO: другой сделать
            };
          } catch (e) {
            return null;
          }
        }

        try {
          if (!credentials) throw new Error("Нет данных для входа");
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) throw new Error("Невалидные данные");

          const { tel, password, rememberMe } = parsed.data;
          const user = await fetchApi<User>({
            endpoint: "/api/auth/login",
            options: { body: JSON.stringify({ tel, password, rememberMe }) },
          });

          return {
            id: user.id,
            email: user.email ?? null,
            phone: user.phone!,
            full_name: user.full_name ?? null,
            nickname: user.nickname ?? null,
            role: user.role,
            avatar_url: user.avatar_url ?? null,
            rememberMe: rememberMe ?? false,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
          };
        } catch (e) {
          const message = e instanceof Error ? e.message : "Ошибка сервера";
          throw new Error(message);
        }
      },
    }),
  ],

  session: {
    // возможно это для бека, не тут
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: "ilyha-next-auth.session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        try {
          const decoded = decodeJwt(user.accessToken);
          return {
            ...token,
            id: user.id,
            phone: user.phone,
            role: user.role,
            full_name: user.full_name,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
            rememberMe: user.rememberMe,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            exp: decoded.exp,
          };
        } catch (error) {
          console.error("Ошибка декодирования токена Java", error);
        }
      }
      const now = Math.floor(Date.now() / 1000);
      const bufferTime = 300; // 5 min
      if (!token.exp) return token;
      const shouldRefresh = now > token.exp - bufferTime;
      if (!shouldRefresh) return token;
      if (!token.refreshToken) {
        return { ...token, error: "NoRefreshToken" };
      }

      try {
        // Идем на Java бэкенд за новым accessToken
        const data = await fetchApi<{
          accessToken: string;
          refreshToken?: string;
        }>({
          endpoint: `/api/auth/refresh`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
          },
        });
        // async function apiFetch(input, options) {
        //   const res = await fetch(input, options);
        //
        //   if (res.status === 401) {
        //
        //     const refreshed = await refreshToken();
        //
        //     if (!refreshed) {
        //       throw new Error("SESSION_EXPIRED");
        //     }
        //
        //     // 2. повторяем запрос
        //     return fetch(input, options);
        //   }
        //2. reactive refresh
        //
        // ловит 401
        //  делает refresh
        //  повторяет запрос
        //   return res;
        // }

        const newDecoded = decodeJwt(data.accessToken);

        return {
          ...token,
          accessToken: data.accessToken,
          exp: newDecoded.exp ?? token.exp,
          refreshToken: data.refreshToken ?? token.refreshToken,
        };
      } catch (error) {
        console.error("Не удалось обновить токен:", error);
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.phone = token.phone;
      session.user.role = token.role;
      session.user.full_name = token.full_name;
      session.user.nickname = token.nickname;
      session.user.avatar_url = token.avatar_url;
      session.accessToken = token.accessToken;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});

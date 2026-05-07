import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/business/auth";
import NextAuth from "next-auth";
import type { User } from "next-auth";
import { decodeJwt } from "jose";
import { getMeApi, loginApi, logoutApi, refreshApi } from "@/business/auth";
import type { UserRole } from "@/business/auth";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

function normalizeRole(role: string | undefined): UserRole {
  const normalized = role?.toLowerCase();
  if (
    normalized === "user" ||
    normalized === "moderator" ||
    normalized === "admin"
  ) {
    return normalized;
  }

  return "user";
}

function getAccessTokenExpiresAt(accessToken: string): number | undefined {
  try {
    return decodeJwt(accessToken).exp;
  } catch (error) {
    console.error("Не удалось декодировать accessToken:", error);
    return undefined;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      async authorize(credentials): Promise<User | null> {
        try {
          if (!credentials) throw new Error("Нет данных для входа");
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) throw new Error("Невалидные данные");

          const { tel, password, rememberMe } = parsed.data;
          const authResponse = await loginApi({
            login: tel,
            password,
            rememberMe,
          });

          if (!authResponse.accessToken || !authResponse.refreshToken) {
            throw new Error("Backend did not return auth tokens");
          }

          const profile = await getMeApi(authResponse.accessToken);

          return {
            id: profile.id,
            email: profile.email ?? null,
            phone: profile.phone,
            full_name: profile.fullName ?? null,
            nickname: profile.nickname ?? null,
            role: normalizeRole(String(profile.role)),
            avatar_url: profile.avatarUrl ?? null,
            rememberMe: rememberMe ?? false,
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken,
          };
        } catch (e) {
          const message = e instanceof Error ? e.message : "Ошибка сервера";
          throw new Error(message);
        }
      },
    }),
  ],

  session: {
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
          exp: getAccessTokenExpiresAt(user.accessToken),
        };
      }

      const now = Math.floor(Date.now() / 1000);
      const bufferTime = 300;
      if (!token.exp) return token;
      if (now <= token.exp - bufferTime) return token;

      if (!token.refreshToken) {
        return { ...token, error: "NoRefreshToken" };
      }

      try {
        const data = await refreshApi(token.refreshToken);

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
      return session;
    },
  },

  events: {
    async signOut(message) {
      const token = "token" in message ? message.token : null;
      const refreshToken =
        token && typeof token.refreshToken === "string"
          ? token.refreshToken
          : null;

      if (!refreshToken) return;

      try {
        await logoutApi({ refreshToken });
      } catch (error) {
        console.error("Не удалось выполнить backend logout:", error);
      }
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});

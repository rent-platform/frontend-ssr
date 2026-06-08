import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/business/auth";
import NextAuth, { CredentialsSignin } from "next-auth";
import type { User } from "next-auth";
import { decodeJwt } from "jose";
import { getMeApi, loginApi, logoutApi, refreshApi } from "@/business/auth";
import type { UserRole } from "@/business/auth";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

class BlockedCredentialsError extends CredentialsSignin {
  code = "account_blocked";
}

function normalizeRole(role: string | undefined): UserRole {
  const normalized = role?.toLowerCase();
  if (
    normalized === "user" ||
    normalized === "moderator" ||
    normalized === "admin" ||
    normalized === "super_admin"
  ) {
    return normalized;
  }

  return "user";
}

function getAccessTokenExpiresAt(accessToken: string): number | undefined {
  try {
    return decodeJwt(accessToken).exp;
  } catch (error) {
    console.error("Failed to decode accessToken:", error);
    return undefined;
  }
}

function mapAuthorizeError(error: unknown): Error {
  if (error instanceof CredentialsSignin) {
    return error;
  }

  const message = error instanceof Error ? error.message : "";

  if (message === "Invalid login or password") {
    return new InvalidCredentialsError();
  }

  if (message.toLowerCase().includes("account blocked")) {
    return new BlockedCredentialsError();
  }

  return error instanceof Error ? error : new Error("Authentication failed");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials): Promise<User | null> {
        try {
          console.log("[TRACE][AUTH][AUTHJS] authorize start", {
            hasCredentials: Boolean(credentials),
          });
          // Проверка входных данных
          if (!credentials) {
            console.log("[TRACE][AUTH][AUTHJS] missing credentials");
            throw new InvalidCredentialsError();
          }

          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            console.log("[TRACE][AUTH][AUTHJS] credentials schema failed", {
              issues: parsed.error.issues.map((issue) => issue.path.join(".")),
            });
            throw new InvalidCredentialsError();
          }

          const { tel, password, rememberMe } = parsed.data;
          console.log("[TRACE][AUTH][AUTHJS] credentials parsed", {
            tel,
            rememberMe,
          });
          const authResponse = await loginApi({
            login: tel,
            password,
            rememberMe,
          });
          console.log("[TRACE][AUTH][AUTHJS] backend login returned tokens", {
            hasAccessToken: Boolean(authResponse.accessToken),
            hasRefreshToken: Boolean(authResponse.refreshToken),
          });

          if (!authResponse.accessToken || !authResponse.refreshToken) {
            throw new Error("Backend did not return auth tokens");
          }

          const profile = await getMeApi(authResponse.accessToken);
          console.log("[TRACE][AUTH][AUTHJS] profile received", {
            userId: profile.id,
            role: profile.role,
            isActive: profile.isActive,
            blockedAt: profile.blockedAt,
          });
          // Токены сохраняются в JWT cookie, но не пробрасываются в клиентскую часть
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
        } catch (error) {
          console.log("[TRACE][AUTH][AUTHJS] authorize error mapped", {
            message: error instanceof Error ? error.message : String(error),
          });
          throw mapAuthorizeError(error);
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
        console.log("[TRACE][AUTH][AUTHJS] jwt created from authorized user");
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
        console.log(
          "[TRACE][AUTH][AUTHJS] jwt refresh skipped: no refresh token",
        );
        return { ...token, error: "NoRefreshToken" };
      }

      try {
        console.log("[TRACE][AUTH][AUTHJS] jwt refresh start");
        const data = await refreshApi(token.refreshToken);
        const newDecoded = decodeJwt(data.accessToken);
        console.log("[TRACE][AUTH][AUTHJS] jwt refresh success", {
          exp: newDecoded.exp,
        });

        return {
          ...token,
          accessToken: data.accessToken,
          exp: newDecoded.exp ?? token.exp,
          refreshToken: data.refreshToken ?? token.refreshToken,
        };
      } catch (error) {
        console.error("Failed to refresh access token:", error);
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },

    async session({ session, token }) {
      console.log("[TRACE][AUTH][AUTHJS] session callback exposes user", {
        userId: token.id,
        role: token.role,
      });
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
        console.error("Failed to call backend logout:", error);
      }
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});

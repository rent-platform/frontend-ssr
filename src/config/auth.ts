import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/business/utils/authShecmas/authSchemas";
import {
  findMockUserByPhone,
  generateMockAccessToken,
  validateMockPassword,
} from "@/business/mocks/auth/mockUsers";
import NextAuth from "next-auth";
import type { User } from "next-auth";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      async authorize(credentials): Promise<User | null> {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { tel, password, rememberMe } = parsed.data;

        const mockUser = findMockUserByPhone(tel); // TODO: отправка на серв

        if (!mockUser) {
          return null;
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
        };
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
        token.id = user.id as string;
        token.phone = user.phone;
        token.role = user.role;
        token.full_name = user.full_name;
        token.nickname = user.nickname;
        token.avatar_url = user.avatar_url;
        token.rememberMe = user.rememberMe;
        token.accessToken = user.accessToken;
      }

      if (token.rememberMe === false) {
        token.exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
      }

      return token;
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

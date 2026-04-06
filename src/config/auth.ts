import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/business/utils/authShecmas/authSchemas";
import {
  findMockUserByPhone,
  validateMockPassword,
} from "@/business/mocks/auth/mockUsers";
import NextAuth from "next-auth";
import type { User } from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials): Promise<User | null> {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { tel, password } = parsed.data;

        const mockUser = findMockUserByPhone(tel); // TODO: отправка на серв

        console.log(mockUser);
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
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.phone = user.phone;
        token.role = user.role;
        token.full_name = user.full_name;
        token.nickname = user.nickname;
        token.avatar_url = user.avatar_url;
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
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});

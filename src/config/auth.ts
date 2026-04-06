import type { AuthOptions } from "next-auth";
import type { UserUpdate } from "@/business/types/entity/user.types";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/business/utils/authShecmas/authSchemas";
import {
  findMockUserByPhone,
  validateMockPassword,
} from "@/business/mocks/auth/mockUsers";

export const authConfig: AuthOptions = {
  providers: [
    Credentials({
      credentials: {
        tel: { label: "Телефон", type: "tel" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials): Promise<UserUpdate | null> {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { tel, password } = parsed.data;

        const mockUser = findMockUserByPhone(tel);
        if (!mockUser) return null;

        if (!validateMockPassword(mockUser, password)) return null;

        return {
          id: mockUser.id,
          email: mockUser.email,
          phone: mockUser.phone,
          full_name: mockUser.full_name,
          nickname: mockUser.nickname,
          role: mockUser.role,
          avatar_url: mockUser.avatar_url,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.role = user.role;
        token.fullName = user.fullName;
        token.nickname = user.nickname;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.phone = token.phone;
      session.user.role = token.role;
      session.user.full_Name = token.fullName;
      session.user.nickname = token.nickname;
      session.user.avatar_Url = token.avatarUrl;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

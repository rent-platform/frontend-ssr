import type { UserRole } from "@/business/types/entity/user.types";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    phone: string;
    role: UserRole;
    full_name?: string | null;
    nickname?: string | null;
    avatar_url?: string | null;
    rememberMe: boolean;
  }

  interface Session {
    user: {
      id: string;
      phone: string;
      role: UserRole;
      full_name?: string | null;
      nickname?: string | null;
      avatar_url?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    phone: string;
    role: UserRole;
    full_name?: string | null;
    nickname?: string | null;
    avatar_url?: string | null;
    rememberMe?: boolean;
  }
}

import NextAuth from "next-auth";
import { authConfig } from "@/config/auth";

export { handler as GET, handler as POST };
const handler = NextAuth(authConfig);

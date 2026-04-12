import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StoreProvider from "@/business/store/StoreProvider";
import "@/ux/styles/globals.scss";
import {PropsWithChildren} from "react";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Rent Platform",
  description: "Платформа аренды вещей",
};

export default function RootLayout({
  children,
}: PropsWithChildren) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}

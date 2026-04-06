import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "@/ux/styles/globals.scss";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Rent Platform",
  description: "Платформа аренды вещей",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

"use client";
import { PropsWithChildren, useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import StoreProvider from "@/business/store/StoreProvider";

// ── MSW ───────────────────────────────────────────────────────────────────────
// Включается переменной окружения NEXT_PUBLIC_API_MOCKING=enabled
// (задаётся в .env.development.local).
// Dynamic import гарантирует, что код MSW НЕ попадает в production bundle.
const isMockingEnabled = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

async function enableMocking(): Promise<void> {
  if (!isMockingEnabled) return;
  const { worker } = await import("@/business/mocks/msw/browser");
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });
}

export const Providers = ({ children }: PropsWithChildren) => {
  const [ready, setReady] = useState(!isMockingEnabled);

  useEffect(() => {
    enableMocking().then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <SessionProvider>
      <StoreProvider>{children}</StoreProvider>
    </SessionProvider>
  );
};

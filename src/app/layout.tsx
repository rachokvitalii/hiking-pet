import "~/styles/globals.css";

import { type Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { Suspense } from "react";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";
import { defaultLocale } from "~/i18n/request";
import { TooltipProvider } from "~/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Hiking",
  description: "Hiking app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={defaultLocale} className="dark">
      <body>
        <NextIntlClientProvider>
          <Suspense>
            <TooltipProvider>
              <TRPCReactProvider>{children}</TRPCReactProvider>
            </TooltipProvider>
          </Suspense>
        </NextIntlClientProvider>
        <Toaster
          toastOptions={{
            duration: 6000,
            classNames: {
              toast: "!bg-neutral-950",
              title: "!text-white",
              icon: "!text-white",
            },
          }}
        />
      </body>
    </html>
  );
}

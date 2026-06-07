import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";
import { defaultLocale } from "~/i18n/request";
import { TooltipProvider } from "~/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Hiking",
  description: "Hiking app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={defaultLocale} className={`${geist.variable} dark`}>
      <body>
        <NextIntlClientProvider>
          <TooltipProvider>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </TooltipProvider>
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

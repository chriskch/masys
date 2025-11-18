import type { Metadata, Viewport } from "next";
import { PrimeReactProvider } from "primereact/api";

import { Barlow_Condensed, Montserrat } from "next/font/google";
import "./globals.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primeicons/primeicons.css"; // Icons
import { AppShell } from "../components/app-shell";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MASYS Logbook",
  description:
    "Digitale Segel-Logbuch-App für Törnplanung, Tracking und Ranking.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <meta name="apple-mobile-web-app-title" content="MASYS Logbook" />
      </head>
      <body
        className={`${barlowCondensed.variable} ${montserrat.variable} antialiased bg-slate-50`}
      >
        <PrimeReactProvider>
          <AppShell>{children}</AppShell>
        </PrimeReactProvider>
      </body>
    </html>
  );
}

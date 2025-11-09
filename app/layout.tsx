import type { Metadata } from "next";
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
    "Digitale Segel-Logbuch-App für Fahrtenplanung, Tracking und Ranking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
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

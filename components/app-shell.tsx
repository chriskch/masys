"use client";

import { ReactNode, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "primereact/button";

type AppShellProps = {
  children: ReactNode;
};

type NavItem = {
  href: string;
  icon: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", icon: "pi pi-home", label: "Dashboard" },
  { href: "/trips", icon: "pi pi-compass", label: "Törns" },
  { href: "/new-trip", icon: "pi pi-plus-circle", label: "Törn starten" },
  { href: "/ranking", icon: "pi pi-chart-line", label: "Rangliste" },
  { href: "/profile", icon: "pi pi-user", label: "Profil" },
];

const HIDE_NAV_PATHS = ["/auth"];

const isActivePath = (href: string, pathname: string) => {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const hideNavigation = useMemo(
    () =>
      HIDE_NAV_PATHS.some((blockedPath) =>
        pathname === blockedPath
          ? true
          : pathname.startsWith(`${blockedPath}/`),
      ),
    [pathname],
  );

  const mobileNavItems = useMemo(
    () => NAV_ITEMS.filter((item) => item.href !== "/new-trip"),
    [],
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900 md:flex-row">
      {!hideNavigation && (
        <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white px-6 py-8 shadow-sm md:flex">
          <div className="flex flex-col items-center">
            <Image
              src="/icon.png"
              alt="MASYS Logbook icon"
              width={64}
              height={64}
              priority
              className="h-16 w-16"
            />
            <h1 className="mt-4 w-full text-left text-3xl font-semibold leading-none text-slate-900">
              Logbook
            </h1>
            <p className="mt-2 w-full text-left text-sm text-slate-500">
              Digitale Segelabenteuer jederzeit im Blick.
            </p>
          </div>

          <nav className="mt-10 flex flex-1 flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[rgba(1,168,10,0.12)] text-[var(--color-primary)]"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <i
                    className={`${item.icon} text-lg ${
                      active
                        ? "text-[var(--color-primary)]"
                        : "text-slate-500"
                    }`}
                    aria-hidden
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Button
            label="Neuen Törn starten"
            icon="pi pi-plus"
            className="!mt-6 !rounded-full !border-none !bg-[var(--color-primary)] !px-5 !py-3 !text-base !font-semibold !text-white !shadow-lg hover:!bg-[var(--color-primary-strong)]"
            onClick={() => router.push("/new-trip")}
          />
        </aside>
      )}

      <div className="flex-1 md:overflow-y-auto">
        <main
          className={`mx-auto w-full max-w-5xl px-4 transition-all duration-200 md:px-8 ${
            hideNavigation
              ? "py-10"
              : "pb-28 pt-8 md:pb-12 md:pt-12 lg:pb-16 lg:pt-14"
          }`}
        >
          {children}
        </main>
      </div>

      {!hideNavigation && (
        <>
          <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur md:hidden">
            {mobileNavItems.map((item) => {
              const active = isActivePath(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "text-[var(--color-primary)]"
                      : "text-slate-500"
                  }`}
                >
                  <i
                    className={`${item.icon} text-lg ${
                      active
                        ? "text-[var(--color-primary)]"
                        : "text-slate-400"
                    }`}
                    aria-hidden
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Button
            icon="pi pi-plus"
            rounded
            aria-label="Törn starten"
            className="!fixed !bottom-20 !left-1/2 !z-40 !h-16 !w-16 !-translate-x-1/2 !rounded-full !border-none !bg-[var(--color-primary)] !text-xl !text-white !shadow-2xl hover:!bg-[var(--color-primary-strong)] md:!hidden"
            onClick={() => router.push("/new-trip")}
          />
        </>
      )}
    </div>
  );
}

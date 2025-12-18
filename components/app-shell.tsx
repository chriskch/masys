"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { useNavigationStore } from "../lib/stores/navigation-store";
import { useLogbookStore } from "../lib/stores/logbook-store";
import { useSessionStore } from "../lib/stores/session-store";

type AppShellProps = {
  children: ReactNode;
};

const isActivePath = (href: string, pathname: string) => {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { navItems, hideNavPaths } = useNavigationStore((state) => ({
    navItems: state.navItems,
    hideNavPaths: state.hideNavPaths,
  }));
  const { incomingDelegations, accounts } = useLogbookStore((state) => ({
    incomingDelegations: state.incomingDelegations,
    accounts: state.accounts,
  }));
  const { currentAccountId, setAccountId } = useSessionStore((state) => ({
    currentAccountId: state.currentAccountId,
    setAccountId: state.setAccountId,
  }));
  const [profileSwitchVisible, setProfileSwitchVisible] = useState(false);

  const hideNavigation = useMemo(
    () =>
      hideNavPaths.some((blockedPath: string) =>
        pathname === blockedPath ? true : pathname.startsWith(`${blockedPath}/`)
      ),
    [hideNavPaths, pathname]
  );

  const mobileNavItems = useMemo(
    () =>
      navItems.filter((item: { href: string }) => item.href !== "/new-trip"),
    [navItems]
  );

  const profileOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const seen = new Set<string>();
    const addOption = (value: string, label: string) => {
      if (!value || seen.has(value)) return;
      seen.add(value);
      options.push({ value, label });
    };

    const primaryAccount = accounts.find(
      (account) => account.id === currentAccountId
    );
    addOption(
      currentAccountId,
      primaryAccount
        ? `${primaryAccount.name} (Mein Profil)`
        : "Mein Profil"
    );

    incomingDelegations.forEach((access) => {
      const linkedAccount =
        accounts.find((account) => account.id === access.ownerAccountId) ?? null;
      const rights = access.canWrite ? "Lesen & Schreiben" : "Nur Lesen";
      addOption(
        access.ownerAccountId,
        `${linkedAccount?.name ?? "Unbekannt"} (${rights})`
      );
    });

    return options;
  }, [accounts, incomingDelegations, currentAccountId]);

  const currentProfileLabel = useMemo(
    () =>
      profileOptions.find((option) => option.value === currentAccountId)
        ?.label ?? "Profil wählen",
    [profileOptions, currentAccountId]
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register("/service-worker.js", {
          scope: "/",
        });
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    };

    registerServiceWorker();
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900 md:flex-row">
      {!hideNavigation && (
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-6 py-8 shadow-sm md:flex">
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
            {navItems.map(
              (item: { href: string; icon: string; label: string }) => {
                const active = isActivePath(item.href, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[rgba(1,168,10,0.12)] text-(--color-primary)"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <i
                      className={`${item.icon} text-lg ${
                        active ? "text-(--color-primary)" : "text-slate-500"
                      }`}
                      aria-hidden
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              }
            )}
          </nav>

          {profileOptions.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Profil
              </p>
              <Dropdown
                value={currentAccountId}
                onChange={(e) => {
                  if (e.value) setAccountId(e.value);
                }}
                options={profileOptions}
                panelClassName="shadow-xl border border-slate-100 rounded-2xl"
                className="mt-2 w-full"
                pt={{
                  root: {
                    className:
                      "w-full rounded-2xl border border-slate-200/80 bg-white/70 shadow-inner",
                  },
                  input: {
                    className:
                      "px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400",
                  },
                  trigger: {
                    className: "text-slate-400",
                  },
                }}
              />
            </div>
          )}

          <Button
            label="Neuen Törn starten"
            icon="pi pi-plus"
            className="mt-6 rounded-full border-none bg-(--color-primary) px-5 py-3 text-base font-semibold text-white shadow-lg hover:bg-(--color-primary-strong)"
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
          {profileOptions.length > 0 && (
            <Button
              icon="pi pi-user"
              rounded
              aria-label="Profil wechseln"
              className="fixed right-4 top-4 z-40 h-12 w-12 border-none bg-white text-(--color-primary) shadow-xl md:hidden"
              onClick={() => setProfileSwitchVisible(true)}
            />
          )}

          <nav className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-around rounded-full border border-white/80 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur-md md:hidden">
            {mobileNavItems.map(
              (item: { href: string; icon: string; label: string }) => {
                const active = isActivePath(item.href, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                      active ? "text-(--color-primary)" : "text-slate-500"
                    }`}
                  >
                    <i
                      className={`${item.icon} text-lg ${
                        active ? "text-(--color-primary)" : "text-slate-400"
                      }`}
                      aria-hidden
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              }
            )}
          </nav>

          <Button
            icon="pi pi-plus"
            rounded
            aria-label="Törn starten"
            className="fixed bottom-20 left-1/2 z-40 h-16 w-16 -translate-x-1/2 rounded-full border-none bg-(--color-primary) text-xl text-white shadow-2xl hover:bg-(--color-primary-strong) md:hidden"
            onClick={() => router.push("/new-trip")}
          />
        </>
      )}

      <Dialog
        header="Profil wechseln"
        visible={profileSwitchVisible}
        onHide={() => setProfileSwitchVisible(false)}
        className="w-full! sm:w-96!"
        breakpoints={{ "960px": "75vw", "640px": "95vw" }}
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-500">
            Aktives Profil:{" "}
            <span className="font-medium text-slate-900">
              {currentProfileLabel}
            </span>
          </p>
          <Dropdown
            value={currentAccountId}
            onChange={(e) => {
              if (e.value) {
                setAccountId(e.value);
                setProfileSwitchVisible(false);
              }
            }}
            options={profileOptions}
            panelClassName="shadow-xl border border-slate-100 rounded-2xl"
            className="w-full"
            pt={{
              root: {
                className:
                  "w-full rounded-2xl border border-slate-200/80 bg-white/80 shadow-inner",
              },
              input: {
                className:
                  "px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400",
              },
              trigger: {
                className: "text-slate-400",
              },
            }}
          />
          <div className="flex justify-end">
            <Button
              label="Schließen"
              outlined
              severity="secondary"
              size="small"
              onClick={() => setProfileSwitchVisible(false)}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useLogbookStore } from "@/lib/stores/logbook-store";
import { useSessionStore } from "@/lib/stores/session-store";

export default function AuthPage() {
  const router = useRouter();
  const { updateAccount, accounts } = useLogbookStore((state) => ({
    updateAccount: state.updateAccount,
    accounts: state.accounts,
  }));
  const { currentAccountId } = useSessionStore((state) => ({
    currentAccountId: state.currentAccountId,
  }));

  const currentAccount =
    accounts.find((account) => account.id === currentAccountId) ?? null;
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstName = formState.firstName.trim();
    const lastName = formState.lastName.trim();
    const nextErrors: { firstName?: string; lastName?: string } = {};
    if (!firstName) nextErrors.firstName = "Vorname ist erforderlich.";
    if (!lastName) nextErrors.lastName = "Nachname ist erforderlich.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (currentAccount) {
      updateAccount(currentAccount.id, { name: `${firstName} ${lastName}` });
    }
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-none bg-white shadow-xl">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Profil vervollständigen
          </p>
          <div className="flex justify-center">
            <Image
              src="/icon.png"
              alt="MASYS Logbook icon"
              width={80}
              height={80}
              priority
              className="h-20 w-20"
            />
          </div>
          <p className="text-sm text-slate-500">
            Bitte trage Vor- und Nachname ein!
          </p>
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Vorname
            </label>
            <InputText
              value={formState.firstName}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, firstName: e.target.value }))
              }
              placeholder="Vorname"
              className={errors.firstName ? "p-invalid" : ""}
            />
            {errors.firstName && (
              <small className="p-error">{errors.firstName}</small>
            )}
          </div>
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Nachname
            </label>
            <InputText
              value={formState.lastName}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, lastName: e.target.value }))
              }
              placeholder="Nachname"
              className={errors.lastName ? "p-invalid" : ""}
            />
            {errors.lastName && (
              <small className="p-error">{errors.lastName}</small>
            )}
          </div>
          <Button
            type="submit"
            label="Weiter"
            icon="pi pi-arrow-right"
            className="mt-2 w-full rounded-full border-none bg-(--color-primary) px-5 py-3 text-base font-semibold text-white hover:bg-(--color-primary-strong)"
          />
        </form>
      </Card>
    </div>
  );
}

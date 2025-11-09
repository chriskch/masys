"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <Card className="w-full max-w-md border-none !bg-white shadow-xl">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Login
          </p>
          <div className="flex justify-center">
            <Image
              src="/Logo_Black.webp"
              alt="MASYS Logbook"
              width={160}
              height={40}
              priority
              className="h-auto w-36"
            />
          </div>
          <p className="text-sm text-slate-500">
            Melde dich an oder teste den Gastmodus, um das Logbuch auszuprobieren.
          </p>
        </div>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            router.push("/");
          }}
        >
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              E-Mail
            </label>
            <InputText
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="segler@verein.de"
              required
            />
          </div>
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Passwort
            </label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              feedback={false}
              placeholder="********"
              inputClassName="w-full"
              required
            />
          </div>
          <Button
            type="submit"
            label="Anmelden"
            icon="pi pi-sign-in"
            className="!mt-2 !w-full !rounded-full !border-none !bg-sky-600 !px-5 !py-3 !text-base !font-semibold !text-white hover:!bg-sky-700"
          />
        </form>

        <Divider align="center" className="!my-6">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            oder
          </span>
        </Divider>

        <div className="flex flex-col gap-3">
          <Button
            label="Demo-Login"
            icon="pi pi-play"
            className="!rounded-full !border-none !bg-emerald-500 !px-5 !py-3 !font-semibold !text-white hover:!bg-emerald-600"
            onClick={() => router.push("/")}
          />
          <Button
            label="Als Gast fortfahren"
            icon="pi pi-compass"
            className="!rounded-full !border border-slate-200 !bg-white !px-5 !py-3 !font-semibold !text-slate-700 hover:!border-slate-300 hover:!bg-slate-50"
            onClick={() => router.push("/")}
          />
        </div>
      </Card>
    </div>
  );
}

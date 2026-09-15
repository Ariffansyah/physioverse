"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { authenticate, type AuthState } from "../actions";

export default function LoginForm() {
  const [register, setRegister] = useState(false);
  const [state, action, pending] = useActionState<AuthState, FormData>(authenticate, null);

  return (
    <form action={action} className="panel bracket w-full max-w-sm p-9">
      <div className="flex items-center justify-between gap-4">
        <p className="tag">{register ? "Pendaftaran" : "Otentikasi"}</p>
        <span className="chip [--tint:var(--color-quantum)]">Sistem siap</span>
      </div>
      <h1 className="mt-3 text-3xl leading-tight">
        {register ? "Buat nama panggilan" : "Masuk laboratorium"}
      </h1>
      <p className="mt-3 text-sm text-ash">
        {register
          ? "Nama panggilan dipakai di papan rekor. Kalau sudah terpakai, angka ditambahkan otomatis."
          : "Catatan percobaanmu tersimpan di akun ini, termasuk yang gagal."}
      </p>

      <input type="hidden" name="mode" value={register ? "register" : "login"} />

      <div className="mt-8 grid gap-5">
        {register && (
          <Field name="username" label="Nama panggilan" required minLength={3} maxLength={24} />
        )}
        <Field name="email" label="Email" type="email" required autoComplete="email" />
        <Field
          name="password"
          label="Kata sandi"
          type="password"
          required
          minLength={6}
          autoComplete={register ? "new-password" : "current-password"}
        />
      </div>

      {state?.error && (
        <p className="mt-5 border-l border-oxide pl-4 text-sm leading-relaxed text-oxide">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-hot mt-8 w-full"
      >
        {pending ? "Menghubungkan…" : register ? "Daftar dan masuk" : "Masuk"}
      </button>

      <div className="mt-6 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setRegister((v) => !v)}
          className="border-b border-transparent py-1 text-quantum transition-colors duration-500 ease-settle hover:border-quantum"
        >
          {register ? "Sudah punya akun" : "Belum punya akun"}
        </button>
        <Link href="/" className="py-1 text-ashdim transition-colors duration-500 ease-settle hover:text-ash">
          Kembali
        </Link>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  ...props
}: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2">
      <span className="tag">{label}</span>
      <input name={name} className="field px-3.5 py-3 text-[15px] text-starlight" {...props} />
    </label>
  );
}

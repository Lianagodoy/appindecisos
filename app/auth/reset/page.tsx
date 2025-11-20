// app/auth/reset/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [canReset, setCanReset] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Quando o usuário chega aqui pelo e-mail, a SDK detecta a sessão
  // e dispara PASSWORD_RECOVERY; habilitamos o formulário.
  useEffect(() => {
    let mounted = true;

    // tenta obter sessão (algumas vezes já vem pronta pelo hash da URL)
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) setCanReset(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || session) setCanReset(true);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (password.length < 6) {
      setErr("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) return setErr(error.message);

    setOk("Senha atualizada com sucesso! Redirecionando…");
    setTimeout(() => router.replace("/decisoes"), 1200);
  };

  if (!canReset) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <span className="text-blue-700 font-semibold">
          Validando link de recuperação…
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col items-center px-6 py-10">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">
        Definir nova senha
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-3 rounded-xl border border-slate-200 p-4"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Nova senha
          </label>
        </div>
        <input
          className="w-full rounded border px-3 py-2 outline-none focus:ring"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="mínimo 6 caracteres"
        />

        {err && <p className="text-red-600 text-sm">{err}</p>}
        {ok && <p className="text-green-700 text-sm">{ok}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg px-4 py-2 font-semibold text-blue-800 shadow
                     bg-gradient-to-b from-slate-100 to-slate-300 hover:from-slate-200 hover:to-slate-400 active:scale-[0.99]
                     disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Atualizar senha"}
        </button>
      </form>
    </main>
  );
}

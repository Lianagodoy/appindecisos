// app/decisoes/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Tema = {
  label: string;
  slug: string;
};

const TEMAS: Tema[] = [
  { label: "Gastronomia", slug: "gastronomia" },
  { label: "Viagens e Turismo", slug: "viagens" },
  { label: "Conquistas Profissionais", slug: "profissional" },
  { label: "Filmes e Séries", slug: "audiovisual" },
  { label: "Rotina Inteligente", slug: "rotina" },
  { label: "Vida Social e Pessoal", slug: "social" },
];

export default function DecisoesPage() {
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const user = data.user;
      if (!user) {
        window.location.href = "/auth?mode=signin";
        return;
      }
      const name = (user.user_metadata?.name as string) || "";
      setDisplayName(name || user.email || "Usuário");
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <span className="text-blue-700 font-semibold">Carregando…</span>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-6 py-8">
      <div className="border border-blue-300 rounded p-3 inline-flex items-center gap-3">
        <h1 className="text-xl font-bold text-blue-700">
          Bem-vindo, {displayName}!
        </h1>
      </div>

      <h2 className="mt-8 mb-4 text-center text-blue-700 font-bold">
        Escolha o Tema
      </h2>

      <div className="mx-auto max-w-xs space-y-4">
        {TEMAS.map((t) => (
          <Link
            key={t.slug}
            href={`/tema/${t.slug}`}
            className="block w-full rounded-lg px-4 py-3 text-center font-semibold text-blue-800 shadow
                     bg-gradient-to-b from-slate-100 to-slate-300 hover:from-slate-200 hover:to-slate-400 active:scale-[0.99]"
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 space-x-3">
        <button
          onClick={signOut}
          className="rounded-lg px-4 py-2 bg-slate-200 hover:bg-slate-300"
        >
          Sair
        </button>
        <Link href="/" className="rounded-lg px-4 py-2 bg-blue-600 text-white">
          Voltar à inicial
        </Link>
      </div>
    </main>
  );
}

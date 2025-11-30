"use client";

// app/decisoes/page.tsx
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
      <div className="screen screen-decisoes">
        <div className="screen-content font-nunito">
          <span className="text-blue-700 font-semibold">Carregando…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-decisoes">
      <div className="screen-content font-nunito">

        {/* Header */}
        <div className="w-full max-w-xs mx-auto text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700 drop-shadow">
            Bem-vindo, {displayName}!
          </h1>
        </div>

        {/* Título */}
        <h2 className="text-xl text-blue-700 font-bold text-center mb-4 drop-shadow">
          Escolha o Tema
        </h2>

        {/* Lista de temas */}
        <div className="mx-auto max-w-xs space-y-4">
          {TEMAS.map((t) => (
            <Link
              key={t.slug}
              href={`/tema/${t.slug}`}
              className="block w-full rounded-lg px-4 py-3 text-center font-semibold 
                         text-blue-800 shadow bg-gradient-to-b from-slate-100/90 to-slate-300/90
                         hover:from-slate-200 hover:to-slate-400 active:scale-[0.99]
                         backdrop-blur-sm"
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Rodapé com ações */}
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={signOut}
            className="rounded-lg px-4 py-2 bg-slate-200 text-blue-800 hover:bg-slate-300 shadow"
          >
            Sair
          </button>

          <Link
            href="/"
            className="rounded-lg px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}

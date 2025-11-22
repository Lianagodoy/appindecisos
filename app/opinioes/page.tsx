// app/opinioes/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type FriendOpinion = {
  id: string;
  created_at: string;
  question_id: string;
  tema: string;
  amigo_nome: string | null;
  opinion_text: string;
};

export default function OpinioesPage() {
  const [opinions, setOpinions] = useState<FriendOpinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);

      // Garante que tem usuário logado
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(userError);
        setError("Erro ao verificar usuário.");
        setLoading(false);
        return;
      }

      if (!user) {
        setError("Você precisa estar logado(a) para ver as opiniões.");
        setLoading(false);
        return;
      }

      // Busca opiniões do Supabase (RLS já garante user_id = auth.uid())
      const { data, error } = await supabase
        .from("friend_opinions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Erro ao carregar opiniões.");
      } else {
        setOpinions((data || []) as FriendOpinion[]);
      }

      setLoading(false);
    };

    load();
  }, []);

  return (
    <main className="min-h-dvh px-6 py-8 bg-slate-950 text-slate-50">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            AppIndecisos
          </p>
          <h1 className="text-xl font-semibold text-emerald-300">
            Opiniões dos amigos
          </h1>
          <p className="text-xs text-slate-400">
            Aqui você vê o que já foi salvo pelo modo &quot;Opinião dos amigos&quot;.
          </p>
        </div>

        <Link
          href="/decisoes"
          className="text-xs px-3 py-2 rounded-full border border-slate-700 text-slate-200 hover:bg-slate-800"
        >
          Voltar para temas
        </Link>
      </header>

      {loading && (
        <p className="text-sm text-slate-300">Carregando opiniões…</p>
      )}

      {error && !loading && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {!loading && !error && opinions.length === 0 && (
        <p className="text-sm text-slate-400">
          Ainda não há nenhuma opinião salva. Use o botão{" "}
          <span className="text-emerald-300 font-medium">
            &quot;Opinião dos amigos&quot;
          </span>{" "}
          em alguma decisão para começar.
        </p>
      )}

      <section className="space-y-3 mt-2">
        {opinions.map((opinion) => (
          <article
            key={opinion.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm"
          >
            <header className="flex items-center justify-between mb-1">
              <div className="space-y-0.5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {opinion.tema}
                </p>
                <p className="text-sm font-semibold text-slate-100">
                  {opinion.amigo_nome || "Amigo IA"}
                </p>
              </div>
              <p className="text-[10px] text-slate-500">
                {new Date(opinion.created_at).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            </header>

            <div className="mt-2 text-slate-300 whitespace-pre-wrap">
              {opinion.opinion_text}
            </div>

            {opinion.question_id && (
              <p className="mt-2 text-[11px] text-slate-500 border-t border-slate-800 pt-1.5">
                Pergunta relacionada:{" "}
                <span className="text-slate-300">
                  {opinion.question_id}
                </span>
              </p>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

// app/tema/[slug]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const LABELS: Record<string, string> = {
  gastronomia: "Gastronomia",
  viagens: "Viagens e Turismo",
  profissional: "Conquistas Profissionais",
  audiovisual: "Filmes e Séries",
  rotina: "Rotina Inteligente",
  social: "Vida Social e Pessoal",
};

type Mode = "normal" | "genios" | "historia" | "amigos";

export default function TemaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState<string>("");

  const temaValido = useMemo(() => LABELS[slug], [slug]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const n = (data.user?.user_metadata?.name as string) || "";
      setUserName(n);
    });
  }, []);

  if (!temaValido) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-3 px-6">
        <p className="text-red-600 font-semibold">
          Tema inválido: {slug}
        </p>
        <Link href="/decisoes" className="px-4 py-2 rounded bg-blue-600 text-white">
          Voltar
        </Link>
      </main>
    );
  }

  const callAI = async (mode: Mode) => {
    setError(null);
    setAnswer(null);

    const text = question.trim();
    if (text.length < 5) {
      setError("Escreva sua pergunta com um pouco mais de detalhes.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: temaValido,
          question: text,
          name: userName,
          mode,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erro ao falar com a IA.");
      }

      const data = await res.json();
      setAnswer(data.answer);
    } catch (e: any) {
      setError(e.message || "Falha ao gerar resposta.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-dvh px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-700">
          Tema: {temaValido}
        </h1>
        <Link href="/decisoes" className="text-blue-700 underline">
          Trocar tema
        </Link>
      </div>

      <p className="mt-2 text-sm text-slate-600">
        Escreva sua dúvida sobre {temaValido.toLowerCase()} e deixe a IA te ajudar
        a decidir.
      </p>

      <div className="mt-5 space-y-3 max-w-xl">
        <textarea
          className="w-full min-h-28 rounded border px-3 py-2 outline-none focus:ring"
          placeholder={`Escreva sua pergunta sobre ${temaValido}…`}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          onClick={() => callAI("normal")}
          disabled={sending}
          className="rounded-lg px-4 py-2 font-semibold text-blue-800 shadow
                     bg-gradient-to-b from-slate-100 to-slate-300 hover:from-slate-200 hover:to-slate-400
                     disabled:opacity-60"
        >
          {sending ? "Gerando resposta…" : "Enviar"}
        </button>
      </div>

      {answer && (
        <section className="mt-8 max-w-xl rounded-xl border border-slate-200 p-4 bg-white">
          <h2 className="text-blue-700 font-bold mb-2">Resposta</h2>
          <div className="whitespace-pre-wrap leading-relaxed">{answer}</div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <button className="rounded px-3 py-2 bg-green-600 text-white">
              Gostei!
            </button>

            <button
              onClick={() => callAI("normal")}
              disabled={sending}
              className="rounded px-3 py-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-60"
            >
              Sugira algo diferente
            </button>

            <button
              onClick={() => callAI("genios")}
              disabled={sending}
              className="rounded px-3 py-2 bg-blue-600 text-white disabled:opacity-60"
            >
              Perguntar aos gênios
            </button>

            <button
              onClick={() => callAI("amigos")}
              disabled={sending}
              className="rounded px-3 py-2 bg-purple-600 text-white disabled:opacity-60"
            >
              Opinião dos amigos
            </button>

            {/* se quiser, depois adicionamos um botão específico só para mini-história */}
            {/* <button onClick={() => callAI("historia")} ...>Mini-história</button> */}
          </div>
        </section>
      )}
    </main>
  );
}

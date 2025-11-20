// app/tema/[slug]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const KEYWORDS: Record<string, string[]> = {
  gastronomia: [
    "comida","restaurante","cozinhar","receita","prato","ingrediente","cardápio","culinária","jantar","almoço","sobremesa","drink","vinho"
  ],
  viagens: [
    "viagem","turismo","hotel","passagem","avião","destino","roteiro","praia","montanha","mala","hospedagem","tour","passeio","resort"
  ],
  profissional: [
    "trabalho","carreira","emprego","vaga","estágio","salário","promoção","portfólio","currículo","negócio","freelancer","startup","cliente"
  ],
  audiovisual: [
    "filme","série","cinema","netflix","documentário","episódio","elenco","diretor","temporada","streaming","maratonar","roteiro"
  ],
  rotina: [
    "rotina","hábitos","produtividade","organização","agenda","saúde","dormir","exercício","dieta","estudo","foco","app","notificação"
  ],
  social: [
    "amizade","encontro","festa","aniversário","namoro","família","parceria","convite","evento","rede social","mensagem","conviver"
  ],
};

const LABELS: Record<string, string> = {
  gastronomia: "Gastronomia",
  viagens: "Viagens e Turismo",
  profissional: "Conquistas Profissionais",
  audiovisual: "Filmes e Séries",
  rotina: "Rotina Inteligente",
  social: "Vida Social e Pessoal",
};

export default function TemaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState<string>("");

  const temaValido = useMemo(() => LABELS[slug], [slug]);
  const keywords = useMemo(() => KEYWORDS[slug] ?? [], [slug]);

  useEffect(() => {
    // pega nome para enriquecer o prompt
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

  const validateByKeywords = (text: string) => {
    const t = text.toLowerCase();
    return keywords.some((k) => t.includes(k));
  };

  const askAI = async () => {
    setError(null);
    setAnswer(null);

    if (question.trim().length < 8) {
      setError("Escreva sua pergunta com pelo menos 8 caracteres.");
      return;
    }
    if (!validateByKeywords(question)) {
      setError(
        `Sua pergunta precisa mencionar o tema "${LABELS[slug]}". Dica: use palavras como: ${keywords
          .slice(0, 6)
          .join(", ")}…`
      );
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: LABELS[slug],
          question,
          name: userName,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Erro ao falar com a IA.");
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
          Tema: {LABELS[slug]}
        </h1>
        <Link href="/decisoes" className="text-blue-700 underline">
          Trocar tema
        </Link>
      </div>

      <p className="mt-2 text-sm text-slate-600">
        Dica: o texto deve conter palavras do tema. Por exemplo:{" "}
        <em>{keywords.slice(0, 5).join(", ")}</em>.
      </p>

      <div className="mt-5 space-y-3 max-w-xl">
        <textarea
          className="w-full min-h-28 rounded border px-3 py-2 outline-none focus:ring"
          placeholder={`Escreva sua pergunta sobre ${LABELS[slug]}…`}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          onClick={askAI}
          disabled={sending}
          className="rounded-lg px-4 py-2 font-semibold text-blue-800 shadow
                     bg-gradient-to-b from-slate-100 to-slate-300 hover:from-slate-200 hover:to-slate-400
                     disabled:opacity-60"
        >
          {sending ? "Gerando mini-história…" : "Enviar"}
        </button>
      </div>

      {answer && (
        <section className="mt-8 max-w-xl rounded-xl border border-slate-200 p-4 bg-white">
          <h2 className="text-blue-700 font-bold mb-2">Mini-história</h2>
          <div className="whitespace-pre-wrap leading-relaxed">{answer}</div>

          <div className="mt-4 flex gap-2">
            <button className="rounded px-3 py-2 bg-green-600 text-white">
              Gostei!
            </button>
            <button
              onClick={askAI}
              className="rounded px-3 py-2 bg-slate-200 hover:bg-slate-300"
            >
              Sugira algo diferente
            </button>
            <button className="rounded px-3 py-2 bg-blue-600 text-white">
              Perguntar aos gênios
            </button>
            <button className="rounded px-3 py-2 bg-purple-600 text-white">
              Opinião dos amigos
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

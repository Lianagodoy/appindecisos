// app/tema/[slug]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const LABELS: Record<string, string> = {
  gastronomia: "Gastronomia",
  viagens: "Viagens e Turismo",
  profissional: "Conquistas Profissionais",
  audiovisual: "Filmes e Séries",
  rotina: "Rotina Inteligente",
  social: "Vida Social e Pessoal",
};

const SCREEN_CLASSES_TEMA: Record<string, string> = {
  gastronomia: "screen-tema-gastronomia",
  viagens: "screen-tema-viagem",
  profissional: "screen-tema-profissional",
  audiovisual: "screen-tema-filmes",
  rotina: "screen-tema-rotina",
  social: "screen-tema-social",
};

type Mode = "normal" | "genios" | "historia" | "amigos";

async function salvarOpiniaoDoAmigo(params: {
  amigoNome?: string;
  questionId: string;
  tema: string;
  opinionText: string;
}) {
  const res = await fetch("/api/opiniao", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amigo_nome: params.amigoNome ?? null,
      question_id: params.questionId,
      tema: params.tema,
      opinion_text: params.opinionText,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Erro ao salvar opinião:", data);
    throw new Error(data.error || "Erro ao salvar opinião no banco.");
  }

  return data.opinion;
}

export default function TemaPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState<string>("");

  const [usedSuggestion, setUsedSuggestion] = useState(false);
  const [usedGenios, setUsedGenios] = useState(false);
  const [usedAmigosIA, setUsedAmigosIA] = useState(false);
  const [usedAmigosReal, setUsedAmigosReal] = useState(false);
  const [usedHistoria, setUsedHistoria] = useState(false);

  const [lastMode, setLastMode] = useState<Mode | null>(null);

  const temaValido = useMemo(() => LABELS[slug], [slug]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const n = (data.user?.user_metadata?.name as string) || "";
      setUserName(n);
    });
  }, []);

  if (!temaValido) {
    return (
      <div className="screen screen-decisoes">
        <div className="screen-content font-nunito">
          <p className="text-red-600 font-semibold mb-4">
            Tema inválido: {slug}
          </p>
          <Link
            href="/decisoes"
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const callAI = async (mode: Mode): Promise<string | null> => {
    setError(null);

    const text = question.trim();
    if (text.length < 5) {
      setError("Escreva sua pergunta com um pouco mais de detalhes.");
      return null;
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
      setLastMode(mode);
      return data.answer as string;
    } catch (e: any) {
      setError(e.message || "Falha ao gerar resposta.");
      return null;
    } finally {
      setSending(false);
    }
  };

  const handleEnviar = () => {
    void callAI("normal");
  };

  const handleGostei = () => {
    router.push("/decisoes");
  };

  const handleSugiraDiferente = async () => {
    await callAI("normal");
    setUsedSuggestion(true);
  };

  const handleGenios = async () => {
    await callAI("genios");
    setUsedGenios(true);
  };

  const handleAmigosIA = async () => {
    const textoOpiniao = await callAI("amigos");
    setUsedAmigosIA(true);

    if (!textoOpiniao) {
      console.warn("Nenhuma opinião gerada para salvar.");
      return;
    }

    try {
      const questionId = question || "sem-pergunta";
      const tema = temaValido;
      const amigoNome = "Amigo IA";

      await salvarOpiniaoDoAmigo({
        amigoNome,
        questionId,
        tema,
        opinionText: textoOpiniao,
      });

      console.log("Opinião dos amigos (IA) salva com sucesso.");
    } catch (e) {
      console.error("Erro ao salvar opinião dos amigos (IA):", e);
    }
  };

  // 👉 AGORA COM TEMA + PERGUNTA NO LINK
  const handleInviteReal = async () => {
    setError(null);

    const text = question.trim();
    if (text.length < 5) {
      setError("Escreva sua pergunta com um pouco mais de detalhes.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema: temaValido,
          question: text,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Erro ao gerar convite.");
      }

      const inviteId = data.inviteId;

      const link = `${window.location.origin}/opinar/${inviteId}?tema=${encodeURIComponent(
        temaValido
      )}&question=${encodeURIComponent(text)}`;

      setAnswer(
        `Copie o link abaixo e envie para um amigo responder:\n\n${link}`
      );

      setUsedAmigosReal(true);
      setLastMode("amigos");
    } catch (e: any) {
      console.error("Erro ao criar convite real:", e);
      setError(e.message || "Erro ao criar convite real para amigos.");
    } finally {
      setSending(false);
    }
  };

  const handleHistoria = async () => {
    await callAI("historia");
    setUsedHistoria(true);
  };

  const baseThemeClass =
    SCREEN_CLASSES_TEMA[slug] ?? "screen-decisoes";

  let activeScreenClass = baseThemeClass;

  if (answer && lastMode) {
    switch (lastMode) {
      case "genios":
        activeScreenClass = "screen-resposta";
        break;
      case "amigos":
        activeScreenClass = "screen-resposta-amigos";
        break;
      case "historia":
        activeScreenClass = "screen-mini-historia";
        break;
      case "normal":
      default:
        activeScreenClass = baseThemeClass;
        break;
    }
  }

  return (
    <div className={`screen ${activeScreenClass}`}>
      <div className="screen-content font-nunito">
        <div className="w-full max-w-xl mx-auto text-left">
          {/* Cabeçalho com tema e link para trocar */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-extrabold text-blue-700 drop-shadow">
              Tema: {temaValido}
            </h1>
            <Link 
              href="/decisoes" 
              className="text-blue-700 hover:text-blue-800 underline text-sm font-medium transition-colors"
            >
              Trocar tema
            </Link>
          </div>

          {/* Descrição clara do que fazer */}
          <p className="text-base text-slate-700 leading-relaxed mb-5">
            Escreva sua dúvida sobre <span className="font-semibold">{temaValido.toLowerCase()}</span> e deixe o GenIA te ajudar a 
            <span className="font-semibold"> decidir, entender melhor, descobrir possibilidades e aprender rápido.</span>
          </p>

          {/* Bloco de entrada */}
          <div className="space-y-3">
            <textarea
              className="w-full min-h-32 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-white text-base placeholder:text-slate-500 resize-none transition-all"
              placeholder={`Ex.: Sushi ou pasta? Qual é melhor para...`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            
            {/* Mensagem de erro */}
            {error && (
              <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
            )}

            {/* Chips de sugestão (exemplos) */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-100/70 backdrop-blur-sm">
                Qual é a melhor opção?
              </span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-100/70 backdrop-blur-sm">
                Compare prós e contras
              </span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-100/70 backdrop-blur-sm">
                Sugira alternativas
              </span>
            </div>

            {/* CTA principal */}
            <button
              onClick={handleEnviar}
              disabled={sending || question.trim().length < 5}
              className="block w-full rounded-lg px-6 py-3 font-semibold text-white shadow-lg
                         bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
                         text-base transition-all duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {sending ? "⏳ Gerando resposta…" : "Perguntar agora"}
            </button>

            {/* Dica de velocidade */}
            <p className="text-center text-blue-700/70 text-xs">
              ⚡ Resposta chega em ~5–10s
            </p>
          </div>

          {/* Bloco de resposta */}
          {answer && (
            <section className="mt-8 max-w-xl rounded-xl border border-slate-200 p-5 bg-white/95 shadow-md">
              <h2 className="text-xl text-blue-700 font-bold mb-3">
                ✨ Resposta
              </h2>
              <div className="whitespace-pre-wrap leading-relaxed text-base text-slate-800">
                {answer}
              </div>

              {/* Botões de ação */}
              <div className="mt-5 space-y-2">
                {/* Linha 1: Ações rápidas */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleGostei}
                    className="flex-1 min-w-max rounded-lg px-3 py-2 bg-green-600 text-white font-semibold text-sm
                               hover:bg-green-700 transition-colors active:scale-[0.98]"
                  >
                    ⭐ Salvar no histórico
                  </button>

                  <button
                    onClick={handleSugiraDiferente}
                    disabled={sending || usedSuggestion}
                    className="flex-1 min-w-max rounded-lg px-3 py-2 bg-slate-200 text-slate-800 font-semibold text-sm
                               hover:bg-slate-300 transition-colors active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🔄 Gerar alternativa
                  </button>
                </div>

                {/* Linha 2: Aprofundar */}
                <button
                  onClick={handleGenios}
                  disabled={sending || usedGenios}
                  className="w-full rounded-lg px-4 py-2 bg-blue-600 text-white font-semibold text-sm
                             hover:bg-blue-700 transition-colors active:scale-[0.98]
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔍 Aprofundar resposta
                </button>

                {/* Linha 3: Resumo + Comparar */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleHistoria}
                    disabled={sending || usedHistoria}
                    className="flex-1 min-w-max rounded-lg px-3 py-2 bg-purple-600 text-white font-semibold text-sm
                               hover:bg-purple-700 transition-colors active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📝 Resumo em 3 tópicos
                  </button>

                  <button
                    onClick={handleAmigosIA}
                    disabled={sending || usedAmigosIA}
                    className="flex-1 min-w-max rounded-lg px-3 py-2 bg-indigo-600 text-white font-semibold text-sm
                               hover:bg-indigo-700 transition-colors active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ⚖️ Comparar prós e contras
                  </button>
                </div>

                {/* Linha 4:

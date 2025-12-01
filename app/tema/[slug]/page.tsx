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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-blue-700 drop-shadow">
              Tema: {temaValido}
            </h1>
            <Link href="/decisoes" className="text-blue-700 underline text-base">
              Trocar tema
            </Link>
          </div>

          <p className="mt-2 text-base text-slate-700 leading-relaxed">
            Escreva sua dúvida, curiosidade ou situação sobre{" "}
            {temaValido.toLowerCase()} e deixe o AppIndecisos te ajudar a{" "}
            <span className="font-semibold">
              decidir, entender melhor, descobrir possibilidades e aprender rápido.
            </span>
          </p>

          <div className="mt-5 space-y-3">
            <textarea
              className="w-full min-h-36 rounded border px-3 py-3 outline-none focus:ring
                         bg-transparent text-lg placeholder:text-slate-500"
              placeholder={`Escreva sua pergunta, dúvida ou curiosidade sobre ${temaValido}…`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              onClick={handleEnviar}
              disabled={sending}
              className="block w-full max-w-xs mx-auto rounded-lg px-6 py-3 font-semibold text-blue-800 shadow
                         bg-gradient-to-b from-slate-100 to-slate-300 hover:from-slate-200 hover:to-slate-400
                         text-lg
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? "Gerando resposta…" : "Enviar"}
            </button>
          </div>

          {answer && (
            <section className="mt-8 max-w-xl rounded-xl border border-slate-200 p-4 bg-white/90 shadow-sm">
              <h2 className="text-xl text-blue-700 font-bold mb-2">
                Resposta
              </h2>
              <div className="whitespace-pre-wrap leading-relaxed text-base">
                {answer}
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={handleGostei}
                  className="rounded px-3 py-2 bg-green-600 text-white"
                >
                  Gostei!
                </button>

                <button
                  onClick={handleSugiraDiferente}
                  disabled={sending || usedSuggestion}
                  className="rounded px-3 py-2 bg-slate-200 hover:bg-slate-300
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sugira algo diferente
                </button>

                <button
                  onClick={handleGenios}
                  disabled={sending || usedGenios}
                  className="rounded px-3 py-2 bg-blue-600 text-white
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Perguntar aos gênios
                </button>

                <button
                  onClick={handleAmigosIA}
                  disabled={sending || usedAmigosIA}
                  className="rounded px-3 py-2 bg-purple-600 text-white
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Opinião dos amigos (IA)
                </button>

                <button
                  onClick={handleInviteReal}
                  disabled={sending || usedAmigosReal}
                  className="rounded px-3 py-2 bg-yellow-600 text-white
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Opinião dos amigos (REAL)
                </button>

                <button
                  onClick={handleHistoria}
                  disabled={sending || usedHistoria}
                  className="rounded px-3 py-2 bg-pink-600 text-white
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mini-história
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

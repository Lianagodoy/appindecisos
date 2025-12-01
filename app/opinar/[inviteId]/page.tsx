// app/opinar/[inviteId]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

type SentState = "idle" | "sending" | "ok" | "error";

export default function OpinarPage() {
  const { inviteId } = useParams<{ inviteId: string }>();
  const searchParams = useSearchParams();

  const temaFromUrl = searchParams.get("tema") || "";
  const questionFromUrl = searchParams.get("question") || "";

  const [friendName, setFriendName] = useState("");
  const [choice, setChoice] = useState<"sim" | "nao" | "depende" | null>(null);
  const [comment, setComment] = useState("");
  const [sentState, setSentState] = useState<SentState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const temaLabel = temaFromUrl || "decisão do seu amigo";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!choice && !comment.trim()) {
      setErrorMsg("Escolha uma opção ou escreva um comentário.");
      return;
    }

    setSentState("sending");

    try {
      // Monta um texto de opinião amigável para salvar
      const partes: string[] = [];

      if (choice === "sim") partes.push("Opinião: eu faria isso / apoio essa ideia.");
      if (choice === "nao") partes.push("Opinião: eu não faria isso / não apoio essa ideia.");
      if (choice === "depende")
        partes.push("Opinião: depende de alguns detalhes / tenho ressalvas.");

      if (comment.trim()) {
        partes.push(`Comentário: ${comment.trim()}`);
      }

      const opinionText = partes.join("\n");

      // Chamando a mesma rota /api/opiniao que já é usada pelos 'amigos IA'
      const res = await fetch("/api/opiniao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amigo_nome: friendName.trim() || "Amigo convidado",
          question_id: inviteId,
          tema: temaFromUrl || null,
          opinion_text: opinionText,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Erro ao registrar sua opinião.");
      }

      setSentState("ok");
    } catch (err: any) {
      console.error("Erro ao enviar opinião do amigo:", err);
      setErrorMsg(
        err?.message ||
          "Não foi possível registrar sua opinião agora. Tente novamente."
      );
      setSentState("error");
    }
  };

  // Se já enviou com sucesso, mostra tela de agradecimento simples
  if (sentState === "ok") {
    return (
      <div className="screen screen-decisoes">
        <div className="screen-content font-nunito max-w-md mx-auto text-center">
          <h1 className="text-2xl font-extrabold text-blue-700 drop-shadow mb-4">
            Obrigado pela sua opinião! 💙
          </h1>
          <p className="text-base text-slate-700 leading-relaxed mb-4">
            Sua resposta foi registrada e vai ajudar seu amigo a decidir melhor.
          </p>
          <p className="text-sm text-slate-500">
            Você pode fechar esta página agora.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-decisoes">
      <div className="screen-content font-nunito max-w-md mx-auto">
        <h1 className="text-2xl font-extrabold text-blue-700 drop-shadow text-center mb-4">
          Ajude seu amigo a decidir
        </h1>

        {/* Tema / contexto */}
        <p className="text-sm text-slate-600 mb-2 text-center">
          Tema:{" "}
          <span className="font-semibold text-blue-700">
            {temaFromUrl || "não informado"}
          </span>
        </p>

        {/* Pergunta do amigo, se estiver na URL */}
        {questionFromUrl ? (
          <div className="mt-3 mb-4 rounded-xl border border-slate-200 bg-white/90 shadow-sm p-3">
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Pergunta do seu amigo:
            </p>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">
              {questionFromUrl}
            </p>
          </div>
        ) : (
          <p className="mt-3 mb-4 text-sm text-slate-700">
            Seu amigo pediu sua opinião sobre uma decisão importante. Mesmo sem
            ver todos os detalhes, você pode dar um palpite sincero abaixo. 💬
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nome opcional do amigo */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Seu nome (opcional)
            </label>
            <input
              type="text"
              className="w-full rounded border px-3 py-2 outline-none focus:ring"
              placeholder="Pode deixar em branco se preferir anonimato"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
            />
          </div>

          {/* Escolha rápida */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              O que você acha dessa ideia?
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setChoice("sim")}
                className={`w-full rounded-lg px-3 py-2 text-sm font-semibold border
                  ${
                    choice === "sim"
                      ? "bg-green-600 text-white border-green-700"
                      : "bg-white text-green-700 border-green-400"
                  }`}
              >
                👍 Eu faria isso / apoio essa ideia
              </button>

              <button
                type="button"
                onClick={() => setChoice("nao")}
                className={`w-full rounded-lg px-3 py-2 text-sm font-semibold border
                  ${
                    choice === "nao"
                      ? "bg-red-600 text-white border-red-700"
                      : "bg-white text-red-700 border-red-400"
                  }`}
              >
                👎 Eu não faria isso / não apoio
              </button>

              <button
                type="button"
                onClick={() => setChoice("depende")}
                className={`w-full rounded-lg px-3 py-2 text-sm font-semibold border
                  ${
                    choice === "depende"
                      ? "bg-yellow-500 text-white border-yellow-600"
                      : "bg-white text-yellow-700 border-yellow-400"
                  }`}
              >
                🤔 Depende / tenho ressalvas
              </button>
            </div>
          </div>

          {/* Comentário livre */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Quer explicar melhor? (opcional)
            </label>
            <textarea
              className="w-full min-h-24 rounded border px-3 py-2 outline-none focus:ring text-sm"
              placeholder={`Escreva um conselho rápido para seu amigo sobre essa decisão em ${temaLabel}…`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-600">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={sentState === "sending"}
            className="w-full rounded-lg px-4 py-2 font-semibold text-blue-800 shadow
                       bg-gradient-to-b from-slate-100 to-slate-300 hover:from-slate-200 hover:to-slate-400
                       active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sentState === "sending"
              ? "Enviando sua opinião…"
              : "Enviar minha opinião"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-500 text-center">
          Sua resposta será usada apenas para ajudar seu amigo a decidir melhor.
        </p>
      </div>
    </div>
  );
}

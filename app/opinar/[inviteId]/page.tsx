// app/opinar/[inviteId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function OpinarPage() {
  const { inviteId } = useParams<{ inviteId: string }>();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<{
    tema: string;
    question: string;
    user_id: string;
  } | null>(null);

  const [friendName, setFriendName] = useState("");
  const [opinion, setOpinion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1 — Buscar convite direto do Supabase
  useEffect(() => {
    const fetchInvite = async () => {
      const { data, error } = await supabase
        .from("friend_invites")
        .select("tema, question, user_id")
        .eq("id", inviteId)
        .single();

      if (error) {
        console.error(error);
        setError("Convite não encontrado.");
      } else {
        setInvite(data);
      }

      setLoading(false);
    };

    fetchInvite();
  }, [inviteId]);

  // 2 — Salvar opinião real do amigo no Supabase
  const submitOpinion = async () => {
    setError(null);

    if (!friendName.trim()) {
      setError("Digite seu nome.");
      return;
    }

    if (opinion.trim().length < 5) {
      setError("Digite uma opinião com pelo menos 5 caracteres.");
      return;
    }

    const { error } = await supabase.from("friend_opinions").insert({
      amigo_nome: friendName,
      opinion_text: opinion,
      tema: invite?.tema,
      question_id: inviteId, // associando pelo invite
      owner_id: invite?.user_id, // dono original da pergunta
      origem: "amigo_real",
    });

    if (error) {
      console.error(error);
      setError("Erro ao enviar sua opinião.");
      return;
    }

    setSubmitted(true);
  };

  if (loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center text-slate-600">
        Carregando…
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center text-red-600 px-6">
        <p className="font-semibold">{error}</p>
      </main>
    );
  }

  if (!invite) {
    return (
      <main className="min-h-dvh flex items-center justify-center text-slate-600 px-6">
        Convite inválido.
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-bold text-green-600 mb-3">
          Obrigado pela sua opinião! 🎉
        </h1>
        <p className="text-slate-700 max-w-md">
          Sua resposta foi enviada para seu amigo.
        </p>

        <a
          href="/"
          className="mt-6 px-4 py-2 rounded bg-blue-600 text-white font-semibold"
        >
          Conhecer o AppIndecisos
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-6 py-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">
        Ajude seu amigo! 💛
      </h1>

      <p className="text-slate-700 text-center mb-6">
        Seu amigo quer sua opinião sobre:
      </p>

      <div className="bg-white border rounded-xl p-4 mb-6 shadow">
        <p className="text-sm text-slate-500 mb-1">Tema:</p>
        <p className="font-semibold mb-4">{invite.tema}</p>

        <p className="text-sm text-slate-500 mb-1">Pergunta:</p>
        <p className="whitespace-pre-wrap font-medium">{invite.question}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700">
            Seu nome *
          </label>
          <input
            type="text"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            className="w-full mt-1 border rounded px-3 py-2"
            placeholder="Ex: Maria"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">
            Sua opinião *
          </label>
          <textarea
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            className="w-full mt-1 border rounded px-3 py-2 min-h-32"
            placeholder="Escreva sua opinião com sinceridade…"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={submitOpinion}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold"
        >
          Enviar opinião
        </button>
      </div>
    </main>
  );
}

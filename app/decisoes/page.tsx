// app/decisoes/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function DecisoesPage() {
  const [displayName, setDisplayName] = useState<string>(""); // nome ou e-mail
  const [loading, setLoading] = useState(true);

  // estados para editar nome
  const [editOpen, setEditOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const user = data.user;
      if (!user) {
        window.location.href = "/auth?mode=signin";
        return;
      }
      const name =
        (user.user_metadata && (user.user_metadata.name as string)) || "";
      const fallback = user.email || "Usuário";
      setDisplayName(name || fallback);
      setNewName(name); // pré-preenche ao abrir o editor
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

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    const trimmed = newName.trim();
    if (!trimmed) {
      setError("Digite um nome válido.");
      return;
    }

    setSaving(true);
    const { error: upErr } = await supabase.auth.updateUser({
      data: { name: trimmed },
    });
    setSaving(false);

    if (upErr) {
      setError(upErr.message);
      return;
    }

    setDisplayName(trimmed);
    setFeedback("Nome atualizado!");
    setEditOpen(false);
  };

  if (loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <span className="text-blue-700 font-semibold">Carregando…</span>
      </main>
    );
  }

  const temas = [
    "Gastronomia",
    "Viagens e Turismo",
    "Conquistas Profissionais",
    "Filmes e Séries",
    "Rotina Inteligente",
    "Vida Social e Pessoal",
  ];

  return (
    <main className="min-h-dvh px-6 py-8">
      <div className="border border-blue-300 rounded p-3 inline-flex items-center gap-3">
        <h1 className="text-xl font-bold text-blue-700">
          Bem-vindo, {displayName}!
        </h1>
        <button
          onClick={() => {
            setFeedback(null);
            setError(null);
            setEditOpen(true);
          }}
          className="rounded px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700"
        >
          Editar nome
        </button>
      </div>

      {feedback && (
        <p className="mt-3 text-green-700 text-sm font-medium">{feedback}</p>
      )}
      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}

      {/* Editor inline simples */}
      {editOpen && (
        <form
          onSubmit={saveName}
          className="mt-4 max-w-sm rounded-xl border border-slate-200 p-4 space-y-3"
        >
          <label className="text-sm font-medium text-slate-700">
            Atualizar nome
          </label>
          <input
            className="w-full rounded border px-3 py-2 outline-none focus:ring"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Seu nome"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="rounded px-4 py-2 bg-slate-200 hover:bg-slate-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <h2 className="mt-8 mb-4 text-center text-blue-700 font-bold">
        Escolha o Tema
      </h2>

      <div className="mx-auto max-w-xs space-y-4">
        {temas.map((label) => (
          <button
            key={label}
            className="w-full rounded-lg px-4 py-3 text-center font-semibold text-blue-800 shadow
                       bg-gradient-to-b from-slate-100 to-slate-300 hover:from-slate-200 hover:to-slate-400 active:scale-[0.99]"
          >
            {label}
          </button>
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

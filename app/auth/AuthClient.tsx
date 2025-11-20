// app/auth/AuthClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";

export default function AuthClient() {
  const params = useSearchParams();
  const router = useRouter();

  const view = useMemo<"sign_in" | "sign_up">(
    () => (params.get("mode") === "signup" ? "sign_up" : "sign_in"),
    [params]
  );

  // redireciona se já estiver logado
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (data.user) router.replace("/decisoes");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session?.user) router.replace("/decisoes");
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  if (view === "sign_up") {
    return <SignUpWithName />;
  }

  // Sign in – mantém o Auth UI pronto
  return (
    <main className="min-h-dvh flex flex-col items-center px-6 py-10">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Entrar</h1>
      <div className="w-full max-w-sm">
        <Auth
          supabaseClient={supabase}
          view="sign_in"
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: "E-mail",
                password_label: "Senha",
                button_label: "Entrar",
              },
            },
          }}
        />
      </div>
    </main>
  );
}

function SignUpWithName() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!name.trim()) return setErr("Por favor, informe seu nome.");
    if (!email.trim()) return setErr("Informe um e-mail válido.");
    if (password.length < 6) return setErr("A senha deve ter 6+ caracteres.");

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim() }, // salva no user_metadata.name
      },
    });
    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }

    // Dependendo da política do projeto, pode exigir confirmação por e-mail
    if (!data.session) {
      setMsg(
        "Cadastro criado! Verifique seu e-mail para confirmar a conta. Após confirmar, volte e faça login."
      );
      return;
    }

    // Se já logou, segue para Decisões
    router.replace("/decisoes");
  };

  return (
    <main className="min-h-dvh flex flex-col items-center px-6 py-10">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Criar conta</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-3 rounded-xl border border-slate-200 p-4"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Nome</label>
          <input
            className="w-full rounded border px-3 py-2 outline-none focus:ring"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">E-mail</label>
          <input
            className="w-full rounded border px-3 py-2 outline-none focus:ring"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Senha</label>
          <input
            className="w-full rounded border px-3 py-2 outline-none focus:ring"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="mínimo 6 caracteres"
            required
          />
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}
        {msg && <p className="text-green-700 text-sm">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg px-4 py-2 font-semibold text-blue-800 shadow
                     bg-gradient-to-b from-slate-100 to-slate-300 hover:from-slate-200 hover:to-slate-400 active:scale-[0.99]
                     disabled:opacity-60"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </main>
  );
}

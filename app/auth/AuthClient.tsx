// app/auth/AuthClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";

const siteURL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

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

  // Sign in – com link "Forgot password?" funcionando (redirect para /auth/reset)
  return (
    <div className="screen screen-login">
      <div className="screen-content font-nunito">
        <h1 className="text-3xl font-extrabold text-blue-700 drop-shadow mb-4">
          Entrar
        </h1>

        <p className="text-blue-800/90 leading-relaxed mb-4">
          Acesse sua conta e continue decidindo com IA!
        </p>

        <div className="w-full max-w-xs mx-auto bg-white/85 rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <Auth
            supabaseClient={supabase}
            view="sign_in"
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            redirectTo={`${siteURL}/auth/reset`}
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
      </div>
    </div>
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
      options: { data: { name: name.trim() } },
    });
    setLoading(false);

    if (error) return setErr(error.message);

    if (!data.session) {
      setMsg(
        "Cadastro criado! Verifique seu e-mail para confirmar a conta. Depois volte e faça login."
      );
      return;
    }
    router.replace("/decisoes");
  };

  return (
    <div className="screen screen-login">
      <div className="screen-content font-nunito">
        <h1 className="text-3xl font-extrabold text-blue-700 drop-shadow mb-4">
          Criar conta
        </h1>

        <p className="text-blue-800/90 leading-relaxed mb-4">
          Crie sua conta para começar a decidir com IA!
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xs mx-auto space-y-3 rounded-xl bg-white/85 shadow-lg backdrop-blur-sm border border-slate-200 p-4"
        >
          <div className="space-y-1 text-left">
            <label className="text-sm font-medium text-slate-700">Nome</label>
            <input
              className="w-full rounded border px-3 py-2 outline-none focus:ring"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="space-y-1 text-left">
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

          <div className="space-y-1 text-left">
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
                       bg-gradient-to-b from-slate-100 to-slate-300 hover:from-slate-200 hover:to-slate-400
                       active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}

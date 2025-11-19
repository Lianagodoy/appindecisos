// app/auth/page.tsx
"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@supabase/supabase-js";

// Se você já tem lib/supabaseClient.ts com o cliente pronto,
// pode importar de lá. Ex.: import { supabase } from "@/lib/supabaseClient"
// Aqui deixo inline para funcionar imediatamente.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function AuthPage() {
  const params = useSearchParams();
  const mode = params.get("mode"); // "signup" | "signin" | null

  const view = useMemo<"sign_in" | "sign_up">(() => {
    return mode === "signup" ? "sign_up" : "sign_in";
  }, [mode]);

  return (
    <main className="min-h-dvh flex flex-col items-center px-6 py-10">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">
        {view === "sign_up" ? "Criar conta" : "Entrar"}
      </h1>

      <div className="w-full max-w-sm">
        <Auth
          supabaseClient={supabase}
          view={view}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: "E-mail",
                password_label: "Senha",
                button_label: "Entrar",
              },
              sign_up: {
                email_label: "E-mail",
                password_label: "Senha",
                button_label: "Criar conta",
              },
            },
          }}
        />
      </div>
    </main>
  );
}

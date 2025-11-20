// app/auth/AuthClient.tsx
"use client";

import { useEffect, useMemo } from "react";
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

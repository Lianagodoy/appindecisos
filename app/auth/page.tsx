// app/auth/page.tsx
import { Suspense } from "react";
import AuthClient from "./AuthClient";

export const dynamic = "force-dynamic"; // evita problemas de prerender com search params

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center">
          <span className="text-blue-700 font-semibold">Carregando…</span>
        </main>
      }
    >
      <AuthClient />
    </Suspense>
  );
}

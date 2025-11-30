// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md flex flex-col items-center gap-6">

        <img
          src="/asset/imagens-app/saudacao-hero.png"
          alt="Ilustração da tela de saudação"
          className="w-full h-auto"
        />

        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-blue-700 text-center">
          Decida com IA!
        </h1>

        <p className="max-w-xs text-center text-blue-800/90 leading-relaxed">
          O app que vai além do "sim ou não" — descubra, simule e decida com IA!
        </p>

        <div className="mt-4 w-full space-y-4">
          <Link
            href="/auth?mode=signup"
            className="block w-full rounded-lg px-4 py-3 text-center font-semibold text-blue-800 shadow bg-gradient-to-b from-slate-100 to-slate-300 hover:from-slate-200 hover:to-slate-400 active:scale-[0.99]"
          >
            Cadastrar login e senha
          </Link>

          <div className="text-center text-blue-800 font-semibold">
            Ou...
          </div>

          <Link
            href="/auth?mode=signin"
            className="block w-full rounded-lg px-4 py-3 text-center font-semibold text-blue-800 shadow bg-gradient-to-b from-slate-100 to-slate-300 hover:from-slate-200 hover:to-slate-400 active:scale-[0.99]"
          >
            Já tenho uma conta
          </Link>
        </div>
      </div>
    </main>
  );
}

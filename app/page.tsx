// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-10 bg-cover bg-center text-blue-900"
      style={{ backgroundImage: "url(/asset/imagens-app/saudacao-hero.png)" }}
    >
      <h1 className="text-4xl font-extrabold tracking-tight text-blue-700 drop-shadow-lg text-center">
        Decida com IA!
      </h1>

      <p className="max-w-xs text-center text-blue-800/90 leading-relaxed mt-3 drop-shadow">
        O app que vai além do "sim ou não" — descubra, simule e decida com IA!
      </p>

      <div className="w-full max-w-xs space-y-4 mt-6">
        <Link
          href="/auth?mode=signup"
          className="block w-full rounded-lg px-4 py-3 text-center font-semibold text-blue-800 shadow bg-gradient-to-b from-slate-100/90 to-slate-300/90 hover:from-slate-200 hover:to-slate-400 active:scale-[0.99] backdrop-blur-sm"
        >
          Cadastrar login e senha
        </Link>

        <div className="text-center text-blue-800 font-semibold drop-shadow">
          Ou...
        </div>

        <Link
          href="/auth?mode=signin"
          className="block w-full rounded-lg px-4 py-3 text-center font-semibold text-blue-800 shadow bg-gradient-to-b from-slate-100/90 to-slate-300/90 hover:from-slate-200 hover:to-slate-400 active:scale-[0.99] backdrop-blur-sm"
        >
          Já tenho uma conta
        </Link>
      </div>
    </main>
  );
}

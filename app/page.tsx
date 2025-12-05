// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="screen screen-saudacao">
      <div className="screen-content font-nunito flex flex-col items-center">
        {/* Título com GenIA */}
        <h1 className="text-4xl font-extrabold tracking-tight text-blue-700 drop-shadow-lg text-center">
          Bem-vindo ao GenIA
        </h1>

        {/* Subtítulo com proposta de valor clara */}
        <p className="max-w-sm text-center text-blue-800/90 leading-relaxed mt-3 drop-shadow text-base">
          Seu gênio pessoal para perguntas, comparações e decisões — com IA, em segundos.
        </p>

        {/* Chips de sugestão (exemplos de uso) */}
        <div className="w-full max-w-sm mt-6 flex flex-wrap gap-2 justify-center">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium text-blue-700 bg-blue-100/70 backdrop-blur-sm">
            Qual é a melhor opção?
          </span>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium text-blue-700 bg-blue-100/70 backdrop-blur-sm">
            Explique de forma simples
          </span>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium text-blue-700 bg-blue-100/70 backdrop-blur-sm">
            Compare prós e contras
          </span>
        </div>

        {/* Dica de velocidade */}
        <p className="text-center text-blue-700/80 text-sm mt-4 drop-shadow">
          ⚡ Resposta chega em ~5–10s
        </p>

        {/* CTA principal (destaque) */}
        <Link
          href="/auth?mode=signup"
          className="block w-full max-w-xs rounded-lg px-4 py-3 text-center font-semibold 
                     text-white shadow-lg
                     bg-gradient-to-b from-green-500 to-green-600
                     hover:from-green-600 hover:to-green-700
                     active:scale-[0.98] backdrop-blur-sm mt-6
                     transition-all duration-200"
        >
          Começar agora
        </Link>

        {/* Limite grátis + privacidade */}
        <p className="text-center text-blue-700/70 text-xs mt-4 drop-shadow">
          3 perguntas grátis/dia • Suas perguntas são privadas
        </p>

        {/* Link secundário (login) */}
        <Link
          href="/auth?mode=signin"
          className="block w-full max-w-xs rounded-lg px-4 py-3 text-center font-semibold 
                     text-blue-700 shadow
                     bg-gradient-to-b from-slate-100/90 to-slate-200/90
                     hover:from-slate-200 hover:to-slate-300
                     active:scale-[0.98] backdrop-blur-sm mt-3
                     transition-all duration-200"
        >
          Já tenho uma conta
        </Link>

        {/* Link de política (rodapé) */}
        <p className="text-center text-blue-700/60 text-xs mt-6">
          <a href="/privacy" className="underline hover:text-blue-700">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  );
}

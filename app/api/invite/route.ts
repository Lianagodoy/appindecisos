// app/api/invite/route.ts
import { NextRequest, NextResponse } from "next/server";

type InviteBody = {
  tema?: string;
  tema_slug?: string;
  question?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { tema, tema_slug, question }: InviteBody = await req.json();

    const texto = (question || "").trim();

    if (!texto || texto.length < 5) {
      return NextResponse.json(
        {
          error:
            "Pergunta muito curta. Escreva com um pouco mais de detalhes para gerar o convite.",
        },
        { status: 400 }
      );
    }

    // ✅ Versão simples: não depende mais de usuário autenticado nem de Supabase.
    // Geramos apenas um código de convite para montar a URL.
    const rawId = crypto.randomUUID().replace(/-/g, "");
    const inviteId = rawId.slice(0, 10); // ex.: "c4f9a12bde"

    // No futuro, se quiser salvar no Supabase,
    // podemos usar esse mesmo inviteId como chave na tabela friend_invites.
    return NextResponse.json(
      {
        inviteId,
        tema: tema || null,
        tema_slug: tema_slug || null,
        question: texto,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Erro inesperado em /api/invite:", e);
    return NextResponse.json(
      {
        error:
          e?.message ||
          "Erro interno na API de convite. Tente novamente em instantes.",
      },
      { status: 500 }
    );
  }
}

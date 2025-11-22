// app/api/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// se você estiver usando types do banco, pode descomentar e ajustar o caminho:
// import type { Database } from "@/lib/database.types";

export async function POST(req: NextRequest) {
  try {
    // Cria o cliente do Supabase ligado ao usuário logado (via cookies)
    const supabase = createRouteHandlerClient(/*<Database>*/ { cookies });

    // Descobre o usuário atual
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Erro ao obter usuário:", userError.message);
      return NextResponse.json(
        { error: "Erro ao obter usuário autenticado." },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // Lê o corpo da requisição
    const body = await req.json();
    const { tema, question } = body as {
      tema?: string;
      question?: string;
    };

    if (!tema || !question) {
      return NextResponse.json(
        { error: "Campos 'tema' e 'question' são obrigatórios." },
        { status: 400 }
      );
    }

    // Insere o convite na tabela friend_invites
    const { data, error } = await supabase
      .from("friend_invites")
      .insert({
        user_id: user.id,
        tema,
        question,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Erro ao criar convite:", error.message);
      return NextResponse.json(
        { error: "Erro ao criar convite de opinião." },
        { status: 500 }
      );
    }

    const inviteId = data.id as string;

    // Por enquanto, a API devolve só o ID.
    // O frontend vai montar o link final usando window.location.origin.
    return NextResponse.json({ inviteId });
  } catch (e: any) {
    console.error("Erro inesperado em /api/invite:", e);
    return NextResponse.json(
      { error: e?.message || "Erro interno na API de convite." },
      { status: 500 }
    );
  }
}

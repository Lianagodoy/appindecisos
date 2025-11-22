// app/api/opiniao/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase env vars não configuradas.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Body = {
  questionId: string;
  tema: string;
  pergunta: string;
  resposta: string;
  amigoNome?: string;
};

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const { questionId, tema, pergunta, resposta, amigoNome } = body;

    if (!questionId || !tema || !pergunta || !resposta) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("friend_opinions").insert({
      question_id: questionId,
      tema,
      pergunta,
      resposta_amigo: resposta,
      amigo_nome: amigoNome || null,
    });

    if (error) {
      console.error("Erro ao salvar opinião:", error);
      return NextResponse.json(
        { error: "Erro ao salvar opinião no banco." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Erro na rota /api/opiniao:", e);
    return NextResponse.json(
      { error: e.message || "Erro inesperado." },
      { status: 500 }
    );
  }
}

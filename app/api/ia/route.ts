// app/api/ia/route.ts
export const runtime = "nodejs";

type Body = {
  theme: string;
  question: string;
  name?: string;
  mode?: string; // "normal", "genios", "historia", "amigos"
};

export async function POST(req: Request) {
  try {
    const { theme, question, name, mode = "normal" }: Body = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY ausente nas variáveis." }),
        { status: 500 }
      );
    }

    // --------- ESTILOS --------- //

    const systemNormal = `
Você é um especialista em "${theme}".
Responda de forma clara, objetiva, prática e útil.
Nada de mini-história ou romance: apenas orientação direta, explicando prós e contras quando fizer sentido.
Presuma que a pergunta faz sentido para o tema, a menos que seja claramente sobre outro assunto (política, finanças, programação etc.).
Se realmente estiver fora do tema, responda:
"Ops! Sua pergunta não parece ser sobre ${theme}. Tente reformular usando palavras do tema."
`;

    const systemGenios = `
Você é um painel de "gênios" históricos discutindo o tema "${theme}".
Responda em 2–3 opiniões curtas, com perspectivas diferentes (por exemplo: um pensador mais racional, outro mais emocional, outro criativo).
Cada opinião deve ter 2–3 frases.
Seja criativo, mas ainda direto e útil. Nada de mini-história longa.
`;

    const systemHistoria = `
Você é um roteirista criativo. Gere uma mini-história envolvente (120–180 palavras)
relacionada ao tema "${theme}", conectando-a à pergunta do usuário.
Aqui você pode usar narrativa, clima, cenas e metáforas.
`;

    const systemAmigos = `
Você vai ajudar o usuário a pedir opinião dos amigos sobre o tema "${theme}".
Crie uma mensagem curta e pronta para copiar e colar em um app de conversa (WhatsApp, Telegram, etc.).
Estrutura:
- 1º parágrafo: contexto bem curto (o que a pessoa está tentando decidir)
- 2º parágrafo (opcional): explique rapidamente as opções ou dúvidas principais
- Última frase: pergunte de forma direta "O que você faria no meu lugar?" ou similar.
Tom: leve, amigável, natural. Sem mini-história, é só um textinho de mensagem mesmo.
`;

    const system =
      mode === "historia"
        ? systemHistoria
        : mode === "genios"
        ? systemGenios
        : mode === "amigos"
        ? systemAmigos
        : systemNormal;

    const userPrompt = `
Usuário: ${name || "sem nome"}
Tema: ${theme}
Pergunta ou situação:
"""${question}"""
`;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: mode === "normal" ? 0.5 : 0.9,
        messages: [
          { role: "system", content: system.trim() },
          { role: "user", content: userPrompt.trim() },
        ],
      }),
    });

    if (!r.ok) {
      return new Response(JSON.stringify({ error: await r.text() }), {
        status: 500,
      });
    }

    const data = await r.json();
    const content =
      data.choices?.[0]?.message?.content ||
      "Não consegui gerar uma resposta agora.";

    return Response.json({ answer: content });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

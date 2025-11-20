// app/api/ia/route.ts
export const runtime = "nodejs"; // usa Node na Vercel

type Body = {
  theme: string;
  question: string;
  name?: string;
};

export async function POST(req: Request) {
  try {
    const { theme, question, name }: Body = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY ausente nas variáveis." }),
        { status: 500 }
      );
    }

    const system = `
Você é um roteirista criativo e conciso. Gere uma mini-história envolvente (120–180 palavras) 
que ajude a decidir algo no tema "${theme}". 
Regras:
- Só responda se a pergunta bater com o tema.
- Estrutura: título curto, 2–3 parágrafos, 1 alternativa criativa no final.
- Linguagem natural, brasileira, positiva e prática.
- Se o texto do usuário não condizer com o tema, responda: 
  "Ops! Sua pergunta não parece ser sobre ${theme}. Tente reformular com palavras do tema."`;

    const userPrompt = `
Usuário: ${name || "sem nome"}
Tema: ${theme}
Pergunta: """${question}"""`;

    // Chamada simples: Chat Completions
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.9,
        messages: [
          { role: "system", content: system.trim() },
          { role: "user", content: userPrompt.trim() },
        ],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return new Response(JSON.stringify({ error: text }), { status: 500 });
    }

    const data = await r.json();
    const content =
      data.choices?.[0]?.message?.content?.trim() ||
      "Não consegui gerar a mini-história agora.";

    return Response.json({ answer: content });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

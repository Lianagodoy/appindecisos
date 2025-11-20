// app/api/ia/route.ts
export const runtime = "nodejs";

type Body = {
  theme: string;
  question: string;
  name?: string;
  mode: "normal" | "genios" | "historia" | "amigos";
};

export async function POST(req: Request) {
  try {
    const { theme, question, name, mode }: Body = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY ausente nas variáveis." }),
        { status: 500 }
      );
    }

    // 🎯 DEFINIÇÃO DO ESTILO POR MODO
    let system = "";

    if (mode === "normal") {
      system = `
Você é um assistente direto, claro e objetivo.
Explique de forma prática, útil e curta.
Nada de mini-história. Nada de fantasia.
Apenas responda a pergunta relacionada ao tema: "${theme}".
Se fizer sentido, personalize pelo nome: ${name || "usuário"}.
`;
    }

    if (mode === "genios") {
      system = `
Você irá responder como se fosse um grupo de gênios históricos (Einstein, Da Vinci, Tesla, Aristóteles).
Cada um deve dar UM ponto de vista curto e brilhante em 2–3 frases.
Nada de historinha. Apenas conselhos inteligentes.
Tema atual: ${theme}.
Nome do usuário: ${name || "usuário"}.
`;
    }

    if (mode === "historia") {
      system = `
Você é um roteirista criativo.
Gere uma mini-história envolvente (120–180 palavras) relacionada ao tema "${theme}".
Dê um título curto.
Crie 2–3 parágrafos + 1 sugestão criativa no final.
`;
    }

    if (mode === "amigos") {
      system = `
Responda como se fossem **3 amigos próximos** do usuário: Ana, Bruno e Carla.
Cada um dá sua opinião sobre a decisão.
Tons diferentes:  
- Ana: prática e objetiva  
- Bruno: divertido e espontâneo  
- Carla: reflexiva e emocional  

Nada de mini-história.
Tema: ${theme}.
Nome do usuário: ${name || "usuário"}.
Formato:

Ana: ...
Bruno: ...
Carla: ...
`;
    }

    const userPrompt = `
Tema: ${theme}
Usuário: ${name || "sem nome"}
Pergunta: """${question}"""
`;

    // 🔥 CHAMADA OPENAI
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
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
      "Não consegui gerar resposta agora.";

    return Response.json({ answer: content });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

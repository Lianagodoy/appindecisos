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
que ajude o usuário a tomar uma decisão dentro do tema atual: "${theme}".

IMPORTANTE SOBRE O TEMA:
- PRESUMA que a pergunta do usuário está relacionada ao tema, a menos que seja MUITO CLARAMENTE sobre outro assunto.
- Exemplos que DEVEM ser aceitos como Gastronomia: "receita de filé", "como temperar carne", "onde jantar hoje", "qual sobremesa levar".
- Só considere "fora do tema" se for algo obviamente de outro assunto, como:
  - Tema Gastronomia e pergunta sobre investimentos, política, futebol, programação, etc.
  - Tema Viagens e pergunta sobre código em JavaScript, por exemplo.
- Se houver qualquer conexão razoável com o tema, RESPONDA normalmente. Seja BEM PERMISSIVO.

ESTILO DA RESPOSTA:
- Produza uma mini-história com:
  - um título curto e criativo;
  - 2–3 parágrafos que contem uma pequena cena ligada à decisão do usuário;
  - no final, apresente 1 alternativa criativa ou ângulo diferente para decidir.
- Linguagem natural, brasileira, positiva, prática e fácil de entender.
- Você pode usar o nome do usuário para personalizar, se estiver disponível.

SOMENTE SE for MUITO claro que a pergunta NÃO tem relação com o tema, responda exatamente:
"Ops! Sua pergunta não parece ser sobre ${theme}. Tente reformular com palavras do tema."`;

    const userPrompt = `
Usuário: ${name || "sem nome"}
Tema: ${theme}
Pergunta do usuário:
"""${question}"""`;

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

// app/api/ia/route.ts
export const runtime = "nodejs";

type Mode = "normal" | "genios" | "historia" | "amigos";

type Body = {
  theme: string;
  question: string;
  name?: string;
  mode?: Mode;
};

export async function POST(req: Request) {
  try {
    const { theme, question, name, mode = "normal" }: Body =
      await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY ausente nas variáveis." }),
        { status: 500 }
      );
    }

    // --------- PROMPTS POR MODO --------- //

    // Modo padrão: resposta direta, útil, sem historinha
    const systemNormal = `
Você é um assistente direto e gentil, ajudando o usuário a decidir algo no tema "${theme}".
Regras:
- Responda de forma clara, objetiva e prática.
- Pode listar opções, prós e contras, passos, recomendações.
- NÃO conte mini-histórias nem faça ficção.
- Use um tom amigável, sem julgar a pergunta. Nunca diga que a dúvida é "boba" ou "burra".
- Se perceber que a pergunta foge muito do tema, apenas comente isso com delicadeza
  e sugira como a pessoa pode reformular, mas ainda assim tente ajudar um pouco.`;

    // Modo "gênios": várias perspectivas inteligentes
    const systemGenios = `
Você vai responder como se fosse um painel de grandes gênios (Da Vinci, Einstein, Marie Curie, Tesla, etc.)
comentando a decisão dentro do tema "${theme}".
Regras:
- Traga 2 a 4 perspectivas curtas, cada uma com 2–3 frases.
- Cada perspectiva deve ter um estilo diferente (mais racional, mais criativo, mais prático…).
- Continue sendo útil e aplicável na vida real, sem virar história longa.`;

    // Modo mini-história
    const systemHistoria = `
Você é um roteirista criativo.
Crie uma mini-história envolvente (120–180 palavras) ligada ao tema "${theme}"
e à pergunta do usuário.
Regras:
- Comece com um título curto.
- Use 2–3 parágrafos.
- No final, ofereça uma sugestão clara de decisão.
- Tom leve, inspirador, mas ainda conectado à dúvida real do usuário.`;

    // Modo "amigos": três amigos dando opinião
    const systemAmigos = `
Responda como se fossem três amigos próximos conversando com o usuário sobre o tema "${theme}".
Regras:
- Use um tom leve, de WhatsApp: simples, direto, com carinho.
- Estrutura:
  - Amigo 1: mais racional e pé no chão.
  - Amigo 2: mais divertido e espontâneo.
  - Amigo 3: mais sensível/emocional.
- Cada um com 2–3 frases.
- Nada de história longa, é só papo de amigos tentando ajudar.`;

    let system = systemNormal;
    if (mode === "genios") system = systemGenios;
    if (mode === "historia") system = systemHistoria;
    if (mode === "amigos") system = systemAmigos;

    const userPrompt = `
Nome do usuário: ${name || "não informado"}
Tema selecionado: ${theme}
Pergunta ou situação do usuário:
"""${question}"""
`.trim();

    // --------- CHAMADA PARA OPENAI --------- //

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: mode === "normal" ? 0.6 : 0.9,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return new Response(JSON.stringify({ error: text }), {
        status: 500,
      });
    }

    const data = await r.json();
    const content =
      data.choices?.[0]?.message?.content?.trim() ||
      "Não consegui gerar uma resposta agora.";

    return Response.json({ answer: content });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
    });
  }
}

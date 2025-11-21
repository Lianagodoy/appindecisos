// app/api/ia/route.ts
export const runtime = "nodejs";

type Mode = "normal" | "genios" | "historia" | "amigos";

type Body = {
  theme: string;
  question: string;
  name?: string;
  mode?: Mode;
};

// ---- PERSONALIDADE POR TEMA ---- //
function personalityForTheme(theme: string) {
  const map: Record<string, string> = {
    "Gastronomia": `
Estilo: leve, saboroso, divertido.  
Você usa referências de comida, sensações, aromas e texturas.  
Fala como alguém apaixonado por boa comida.`,
    "Viagens e Turismo": `
Estilo: inspirador, visual e emocionante.  
Traga imagens mentais, atmosfera de viagem, cultura, paisagens.`,
    "Conquistas Profissionais": `
Estilo: direto, estruturado, com prós e contras.  
Fala como um mentor objetivo que organiza ideias em passos claros.`,
    "Filmes e Séries": `
Estilo: criativo e referencial.  
Use comparações com filmes, cenas, personagens, enredos, mas sem virar historinha.`,
    "Rotina Inteligente": `
Estilo: prático, minimalista, focado em produtividade.  
Organize ideias, simplifique decisões, ofereça passos claros.`,
    "Vida Social e Pessoal": `
Estilo: empático, acolhedor, gentil.  
Fala como um amigo que realmente entende sentimentos humanos.`,
  };

  return map[theme] || "";
}

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

    // ---- PROMPTS POR MODO ---- //

    const systemNormal = `
Você é um assistente útil e direto.  
Ajude o usuário a tomar uma decisão sobre o tema "${theme}".  
Aplique a personalidade do tema abaixo:

${personalityForTheme(theme)}

Regras:
- Responda de forma clara, objetiva e prática.  
- Pode listar opções, prós e contras, recomendações.  
- Tome cuidado para não julgar o usuário.  
- NÃO conte mini-histórias.  
- Use um tom gentil e confiante.
`;

    const systemGenios = `
Você é um painel de gênios (Da Vinci, Einstein, Marie Curie, Tesla).  
Cada gênio comenta a dúvida dentro do tema "${theme}".  
Personalidade do tema:
${personalityForTheme(theme)}

Regras:
- Cada gênio dá 2–3 frases.  
- Estilos diferentes entre si (criativo, lógico, ousado…).  
- Nada de historieta, só insights brilhantes.
`;

    const systemHistoria = `
Você é um roteirista.  
Crie uma mini-história envolvente (120–180 palavras) sobre o tema "${theme}".  
Personalidade do tema:
${personalityForTheme(theme)}

Regras:
- Título curto.  
- 2–3 parágrafos.  
- Final com sugestão clara.
`;

    const systemAmigos = `
Responda como se fossem três amigos próximos do usuário, no tema "${theme}".  
Personalidade do tema:
${personalityForTheme(theme)}

Regras:
- Amigo 1: racional  
- Amigo 2: espontâneo e divertido  
- Amigo 3: sensível e emocional  
- Cada um com 2–3 frases.  
- Nada de historinha, é conversa real.
`;

    let system = systemNormal;
    if (mode === "genios") system = systemGenios;
    if (mode === "historia") system = systemHistoria;
    if (mode === "amigos") system = systemAmigos;

    const userPrompt = `
Usuário: ${name || "não informado"}
Tema: ${theme}
Pergunta:
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
        temperature: 0.8,
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


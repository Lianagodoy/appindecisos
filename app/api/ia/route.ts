// app/api/ia/route.ts
export const runtime = "nodejs";

type Mode = "normal" | "genios" | "historia" | "amigos";

type Body = {
  theme: string;
  question: string;
  name?: string;
  mode?: Mode;
};

// ---- PERSONALIDADE POR TEMA (enxuta) ---- //
function personalityForTheme(theme: string) {
  const map: Record<string, string> = {
    Gastronomia: `
Estilo: leve, saboroso e divertido.
Use imagens rápidas de comida, sensações, aromas e texturas.`,

    "Viagens e Turismo": `
Estilo: visual e inspirador.
Crie imagens mentais breves de lugares, cultura e clima.`,

    "Conquistas Profissionais": `
Estilo: direto e estruturado.
Mostre prós e contras com clareza, sem rodeios.`,

    "Filmes e Séries": `
Estilo: criativo e referencial.
Use comparações rápidas com filmes e personagens, sem virar historinha.`,

    "Rotina Inteligente": `
Estilo: prático e minimalista.
Foque em passos simples e objetivos para organizar a rotina.`,

    "Vida Social e Pessoal": `
Estilo: empático e acolhedor.
Fale como um amigo que entende sentimentos, mas sem textão.`,
  };

  return map[theme] || "";
}

// ---- REGRAS DE TAMANHO POR MODO (para evitar textão) ---- //
function sizeRules(mode: Mode) {
  const rules: Record<Mode, string> = {
    normal: `
- Máximo 2 parágrafos curtos.
- No máximo 8 frases no total.
- Nada de textão ou explicações longas.`,

    genios: `
- 3 perspectivas: Gênio Lógico, Sábio Cultural e Mentor Emocional.
- Cada um com até 3 frases curtas.
- No máximo 10 frases no total.
- Nada de nomes reais de pessoas famosas.`,

    historia: `
- Mini-história com no máximo 8 frases.
- Foco em um único momento marcante.
- Narrativa leve, divertida, sem descrição longa.`,

    amigos: `
- 3 amigos (racional, divertido, emocional).
- Cada amigo com no máximo 3 frases curtas.
- Evite qualquer parágrafo longo.`,
  };

  return rules[mode];
}

// ---- INSTRUÇÕES ADICIONAIS POR MODO ---- //
function extraModeInstructions(mode: Mode) {
  if (mode === "genios") {
    return `
Você está no modo "gênios".

Use EXATAMENTE esta estrutura:

Gênio Lógico:
- Análise lógica.
- Decisão racional.
- Fatos e clareza.

Sábio Cultural:
- Perspectiva divertida e curiosa.
- Referências culturais amplas (sem citar pessoas reais).
- Olhar criativo e leve.

Mentor Emocional:
- Foco em sentimentos, bem-estar e impacto emocional.
- Conselhos gentis e empáticos.

Regras importantes:
- NÃO use nomes reais de pessoas famosas.
- NÃO use rótulos "Gênio 1", "Gênio 2" ou "Gênio 3".
- Use APENAS os títulos: "Gênio Lógico", "Sábio Cultural" e "Mentor Emocional".`.trim();
  }

  if (mode === "historia") {
    return `
Você está no modo "mini-história".

- Transforme a dúvida do usuário em uma pequena cena narrada (em 1ª ou 3ª pessoa).
- Crie um começo, um pequeno conflito e um desfecho simples.
- Use tom leve, próximo, como uma micro crônica.
- NÃO use a estrutura dos gênios.
- NÃO use os rótulos "Gênio Lógico", "Sábio Cultural" ou "Mentor Emocional".
- NÃO liste opiniões; apenas conte a história de forma contínua.`.trim();
  }

  if (mode === "amigos") {
    return `
Você está no modo "opinião dos amigos (IA)".

- Crie 3 vozes diferentes:
  Amigo racional:
    - Fala de forma analítica, ponderando prós e contras.
  Amigo divertido:
    - Traz leveza, humor e ideias criativas.
  Amigo emocional:
    - Foca em sentimentos, bem-estar e impacto pessoal.

- Use rótulos como:
  "Amigo racional:", "Amigo divertido:", "Amigo emocional:".
- NÃO use a palavra "gênio" aqui.`.trim();
  }

  // normal
  return `
Você está no modo "resposta objetiva normal".

- Foque em clareza na decisão, próximos passos e explicação curta.
- Se fizer sentido, apresente rapidamente 2 ou 3 caminhos principais,
  mas sem texto longo.`.trim();
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

    // ---- SYSTEM PROMPT: decidir + entender + descobrir + aprender ---- //
    const system = `
Você é a IA do aplicativo AppIndecisos.

Seu papel é ajudar o usuário a:
- decidir entre opções,
- entender melhor uma situação,
- descobrir possibilidades,
- aprender algo prático ou ter novas perspectivas
sobre o tema "${theme}".

Personalidade do tema:
${personalityForTheme(theme)}

Regras gerais:
- Responda em português do Brasil.
- Use frases curtas e objetivas.
- Evite textos extensos, explicações longas ou muitos detalhes.
- Tom leve, prático, gentil e criativo.
- Traga clareza, não confusão.

Modo atual: "${mode}".

Regras específicas de tamanho para este modo:
${sizeRules(mode)}

Instruções adicionais específicas do modo:
${extraModeInstructions(mode)}
`.trim();

    const userPrompt = `
Usuário: ${name || "não informado"}
Tema: ${theme}

Pergunta ou situação:
"${question}"
`.trim();

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
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

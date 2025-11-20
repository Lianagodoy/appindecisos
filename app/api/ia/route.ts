// app/api/ia/route.ts
export const runtime = "nodejs";

type Body = {
  theme: string;
  question: string;
  name?: string;
  mode?: "normal" | "genios" | "historia" | "amigos";
};

// Palavras super abrangentes por tema
const KEYWORDS: Record<string, string[]> = {
  "Gastronomia": [
    "comida","cozinhar","receita","prato","forno","fritar","assar",
    "restaurante","jantar","almoço","sobremesa","ingrediente","doces",
    "salada","carne","massa","sushi","pasta","macarrão","culinária",
    "bebida","vinho","hambúrguer","pizza","tempero","chef"
  ],
  "Viagens e Turismo": [
    "viagem","turismo","hotel","avião","passagem","destino","praia",
    "montanha","roteiro","trilha","hospedagem","resort","mochila",
    "passaporte","bagagem","turista","cidade","cultura"
  ],
  "Conquistas Profissionais": [
    "trabalho","carreira","profissão","emprego","currículo",
    "entrevista","promoção","salário","gestão","empresa","networking",
    "negócio","objetivo","produtividade"
  ],
  "Filmes e Séries": [
    "filme","série","cinema","ator","atriz","netflix","documentário",
    "temporada","episódio","streaming","ação","drama","comédia",
    "terror","investigação","policial"
  ],
  "Rotina Inteligente": [
    "organização","rotina","hábitos","produtividade","agenda",
    "saúde","academia","treino","estudo","planejamento","meditação",
    "aplicativo","controle","tempo"
  ],
  "Vida Social e Pessoal": [
    "amizade","relacionamento","namoro","família","convite","aniversário",
    "decisão pessoal","vida social","encontro","conversa","evento"
  ]
};

// ----------------------------------------------------------

export async function POST(req: Request) {
  try {
    const { theme, question, name, mode }: Body = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY ausente nas variáveis." }),
        { status: 500 }
      );
    }

    // --- DETECÇÃO FLEXÍVEL DO TEMA ---
    const q = question.toLowerCase();

    const themeKeywords = KEYWORDS[theme] || [];
    const match = themeKeywords.some((k) => q.includes(k));

    // Só bloqueia se for MUITO fora do tema
    if (!match) {
      return Response.json({
        answer: `Ops! Sua pergunta não parece ser sobre ${theme}.  
Tente reformular usando alguma palavra relacionada ao tema.`
      });
    }

    // -------- SISTEMA: muda conforme o modo ---------
    let system = "";

    if (mode === "normal") {
      system = `
Você é um assistente objetivo e claro. Responda de forma prática,
direta e útil sobre o tema "${theme}".
Estilo: explicação simples + sugestão final.
Sem fantasia, sem mini-história.`;
    }

    if (mode === "genios") {
      system = `
Você é uma mistura de Da Vinci, Tesla e Einstein criando conselhos criativos.
Use metáforas inteligentes, exemplos brilhantes e insights inesperados.
Nada de história fofa — só genialidade aplicada ao tema "${theme}".`;
    }

    if (mode === "amigos") {
      system = `
Responda como um(a) amigo(a) sincero(a), leve, casual e bem humorado.
Nada muito técnico. Como um papo real sobre o tema "${theme}".`;
    }

    if (mode === "historia") {
      system = `
Crie uma mini-história curta e envolvente (100–150 palavras)
sobre a dúvida dentro do tema "${theme}".
Somente neste modo você usa narrativa.`;
    }

    // fallback
    if (!system) {
      system = `
Você é um assistente claro e objetivo. Responda de forma útil sobre o tema "${theme}".`;
    }

    const userPrompt = `
Usuário: ${name || "sem nome"}
Tema: ${theme}
Pergunta: """${question}"""`
      .trim();

    // -------- CHAMADA AO MODELO ---------
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
          { role: "system", content: system },
          { role: "user", content: userPrompt },
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

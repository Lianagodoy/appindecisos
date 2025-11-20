export const runtime = "nodejs"; // Vercel

type Body = {
  theme: string;
  question: string;
  name?: string;
  mode?: "default" | "story" | "genius" | "friends";
};

export async function POST(req: Request) {
  try {
    const { theme, question, name, mode = "default" }: Body = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY ausente nas variáveis." }),
        { status: 500 }
      );
    }

    // 🔥 1) PROMPT PRINCIPAL – RESPOSTA NORMAL, SEM HISTÓRIA
    const defaultPrompt = `
Responda de forma direta, objetiva e realmente útil.
Tema atual: ${theme}.
Pergunta: "${question}".

Regras:
- Seja claro e prático.
- Pode dar lista de opções, recomendações, prós/contras.
- Não conte histórias.
- Não invente cenas fictícias.
`;

    // 🔥 2) PROMPT PARA MINI-HISTÓRIA (botão "Sugira algo diferente")
    const storyPrompt = `
Gere uma mini-história criativa (120–180 palavras), com título curto,
2–3 parágrafos e uma alternativa criativa ao final.
Linguagem leve, natural e inspiradora.
Tema: ${theme}
Pergunta: "${question}"
`;

    // 🔥 3) PROMPT "Perguntar a

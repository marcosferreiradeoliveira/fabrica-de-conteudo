import { GoogleGenAI, Type } from "@google/genai";

const MODEL = "gemini-2.0-flash";

export const config = { runtime: "nodejs" };

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey?.trim()) {
    return Response.json(
      { error: "GEMINI_API_KEY não configurada no servidor." },
      { status: 500 }
    );
  }

  let body: { idea: string; config: any };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body JSON inválido." }, { status: 400 });
  }

  const { idea, config: cfg } = body;
  if (!idea || typeof idea !== "string" || !cfg) {
    return Response.json(
      { error: "Envie 'idea' e 'config' no body." },
      { status: 400 }
    );
  }

  const systemInstruction = `
    Você é um estrategista de conteúdo sênior.
    Seu objetivo é transformar uma ideia/tema em um pacote de conteúdo completo para o seguinte contexto:
    
    PRODUTO/SERVIÇO: ${cfg.productContext ?? ""}
    PÚBLICO-ALVO: ${cfg.targetAudience ?? ""}
    DIFERENCIAIS (USP): ${cfg.usp ?? ""}
    DORES/PROBLEMAS: ${cfg.painPoints ?? ""}
    RESTRIÇÕES: ${cfg.restrictions ?? ""}
    PILAR DE CONTEÚDO: ${cfg.contentPillar ?? ""}
    
    Siga RIGOROSAMENTE as configurações de tom, formato e objetivos definidas abaixo.
    
    ESTRUTURA DO OUTPUT (Responda em JSON rigoroso conforme o esquema):
    
    1. ebookResearch: Pesquisa para ebook.
       - TOM: ${cfg.ebook?.tone ?? ""}
       - FORMATO: ${cfg.ebook?.format ?? ""}
       - REF. ESTILO: ${cfg.ebook?.styleReferences ?? ""}
       - OBJETIVO: ${cfg.ebook?.campaignGoal ?? ""}
       
    2. podcastScript: Roteiro de podcast.
       - TOM: ${cfg.podcast?.tone ?? ""}
       - FORMATO: ${cfg.podcast?.format ?? ""}
       - ESTRUTURA: ${cfg.podcast?.scriptStructure ?? ""}
       - REF. ESTILO: ${cfg.podcast?.styleReferences ?? ""}
       - OBJETIVO: ${cfg.podcast?.campaignGoal ?? ""}
       
    3. videoScriptJson: Um JSON dentro de uma string, representando um roteiro de vídeo CURTO.
       - TOM: ${cfg.video?.tone ?? ""}
       - FORMATO: ${cfg.video?.format ?? ""}
       - HOOK (GANCHO): ${cfg.video?.hook ?? ""}
       - REF. ESTILO: ${cfg.video?.styleReferences ?? ""}
       - OBJETIVO: ${cfg.video?.campaignGoal ?? ""}
       - ESTRUTURA: O JSON deve conter 'scene', 'script' e 'b-roll_suggestions'.
       
    4. socialMedia: Posts para Instagram e LinkedIn.
       DIRETRIZES INSTAGRAM:
       - TOM: ${cfg.instagram?.tone ?? ""}
       - FORMATO: ${cfg.instagram?.format ?? ""}
       - HASHTAGS/KEYWORDS: ${cfg.instagram?.hashtags ?? ""}
       - REF. ESTILO: ${cfg.instagram?.styleReferences ?? ""}
       - OBJETIVO: ${cfg.instagram?.campaignGoal ?? ""}
       
       DIRETRIZES LINKEDIN:
       - TOM: ${cfg.linkedin?.tone ?? ""}
       - FORMATO: ${cfg.linkedin?.format ?? ""}
       - CTA: ${cfg.linkedin?.cta ?? ""}
       - REF. ESTILO: ${cfg.linkedin?.styleReferences ?? ""}
       - OBJETIVO: ${cfg.linkedin?.campaignGoal ?? ""}
       
    5. emailMarketing: Email para a base.
       - TOM: ${cfg.email?.tone ?? ""}
       - FORMATO: ${cfg.email?.format ?? ""}
       - LINHA DE ASSUNTO: ${cfg.email?.subjectLine ?? ""}
       - REF. ESTILO: ${cfg.email?.styleReferences ?? ""}
       - OBJETIVO: ${cfg.email?.campaignGoal ?? ""}
  `;

  const prompt = `Gere o pacote de conteúdo para o seguinte tema: "${idea}"`;

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ebookResearch: { type: Type.STRING },
            podcastScript: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                introduction: { type: Type.STRING },
                segments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      notes: { type: Type.STRING },
                    },
                    required: ["title", "notes"],
                  },
                },
                conclusion: { type: Type.STRING },
              },
              required: ["title", "introduction", "segments", "conclusion"],
            },
            videoScriptJson: { type: Type.STRING },
            socialMedia: {
              type: Type.OBJECT,
              properties: {
                instagram: { type: Type.STRING },
                linkedin: { type: Type.STRING },
              },
              required: ["instagram", "linkedin"],
            },
            emailMarketing: { type: Type.STRING },
          },
          required: [
            "ebookResearch",
            "podcastScript",
            "videoScriptJson",
            "socialMedia",
            "emailMarketing",
          ],
        },
      },
    });

    const text = response.text ?? "";
    const result = JSON.parse(text);
    return Response.json(result);
  } catch (err) {
    console.error("Erro Gemini na API:", err);
    return Response.json(
      { error: "Não foi possível gerar o conteúdo. Tente novamente." },
      { status: 500 }
    );
  }
}

import { GoogleGenAI, Type } from "@google/genai";
import type { ContentPackage, ContentConfig } from "../types";

const API_PATH = "/api/generate-content";

/** Em produção usa a API (chave só no servidor). Em dev usa a chave local se existir. */
export async function generateContentPackage(
  idea: string,
  config: ContentConfig
): Promise<ContentPackage> {
  const isProd = import.meta.env.PROD;

  if (isProd) {
    const res = await fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, config }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data?.detail ? `${data.error} (${data.detail})` : (data?.error || "Não foi possível gerar o conteúdo. Tente novamente.");
      throw new Error(msg);
    }
    return res.json();
  }

  // Desenvolvimento: chave só no .env local (não vai para o build de produção)
  const apiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (typeof process !== "undefined" && (process.env?.GEMINI_API_KEY ?? process.env?.API_KEY)) ||
    "";
  if (!apiKey?.trim()) {
    throw new Error(
      "Em desenvolvimento: adicione GEMINI_API_KEY ou VITE_GEMINI_API_KEY no .env. Em produção a chave fica só no servidor (Vercel)."
    );
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  const model = "gemini-2.0-flash";

  const systemInstruction = `
    Você é um estrategista de conteúdo sênior.
    Seu objetivo é transformar uma ideia/tema em um pacote de conteúdo completo para o seguinte contexto:
    
    PRODUTO/SERVIÇO: ${config.productContext}
    PÚBLICO-ALVO: ${config.targetAudience}
    DIFERENCIAIS (USP): ${config.usp}
    DORES/PROBLEMAS: ${config.painPoints}
    RESTRIÇÕES: ${config.restrictions}
    PILAR DE CONTEÚDO: ${config.contentPillar}
    
    Siga RIGOROSAMENTE as configurações de tom, formato e objetivos definidas abaixo.
    
    ESTRUTURA DO OUTPUT (Responda em JSON rigoroso conforme o esquema):
    
    1. ebookResearch: Pesquisa para ebook.
       - TOM: ${config.ebook.tone}
       - FORMATO: ${config.ebook.format}
       - REF. ESTILO: ${config.ebook.styleReferences}
       - OBJETIVO: ${config.ebook.campaignGoal}
       
    2. podcastScript: Roteiro de podcast.
       - TOM: ${config.podcast.tone}
       - FORMATO: ${config.podcast.format}
       - ESTRUTURA: ${config.podcast.scriptStructure}
       - REF. ESTILO: ${config.podcast.styleReferences}
       - OBJETIVO: ${config.podcast.campaignGoal}
       
    3. videoScriptJson: Um JSON dentro de uma string, representando um roteiro de vídeo CURTO.
       - TOM: ${config.video.tone}
       - FORMATO: ${config.video.format}
       - HOOK (GANCHO): ${config.video.hook}
       - REF. ESTILO: ${config.video.styleReferences}
       - OBJETIVO: ${config.video.campaignGoal}
       - ESTRUTURA: O JSON deve conter 'scene', 'script' e 'b-roll_suggestions'.
       
    4. socialMedia: Posts para Instagram e LinkedIn.
       DIRETRIZES INSTAGRAM:
       - TOM: ${config.instagram.tone}
       - FORMATO: ${config.instagram.format}
       - HASHTAGS/KEYWORDS: ${config.instagram.hashtags}
       - REF. ESTILO: ${config.instagram.styleReferences}
       - OBJETIVO: ${config.instagram.campaignGoal}
       
       DIRETRIZES LINKEDIN:
       - TOM: ${config.linkedin.tone}
       - FORMATO: ${config.linkedin.format}
       - CTA: ${config.linkedin.cta}
       - REF. ESTILO: ${config.linkedin.styleReferences}
       - OBJETIVO: ${config.linkedin.campaignGoal}
       
    5. emailMarketing: Email para a base.
       - TOM: ${config.email.tone}
       - FORMATO: ${config.email.format}
       - LINHA DE ASSUNTO: ${config.email.subjectLine}
       - REF. ESTILO: ${config.email.styleReferences}
       - OBJETIVO: ${config.email.campaignGoal}
  `;

  const prompt = `Gere o pacote de conteúdo para o seguinte tema: "${idea}"`;

  try {
    const response = await ai.models.generateContent({
      model,
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
          required: ["ebookResearch", "podcastScript", "videoScriptJson", "socialMedia", "emailMarketing"],
        },
      },
    });

    const result = JSON.parse(response.text ?? "{}");
    return result;
  } catch (error) {
    console.error("Erro na geração do Gemini:", error);
    throw new Error("Não foi possível gerar o conteúdo. Tente novamente.");
  }
}

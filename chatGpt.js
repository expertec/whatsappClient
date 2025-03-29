// server/chatGpt.js
import dotenv from 'dotenv';
dotenv.config();
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Genera una estrategia mensual de marketing en redes sociales usando GPT-4,
 * basada en el giro del negocio.
 *
 * @param {string} giro - Giro del negocio (ej: "Restaurante")
 * @returns {Promise<string|null>}
 */
export async function generarEstrategia(giro) {
  const prompt = `Genera una estrategia mensual de marketing en redes sociales para un negocio del giro: ${giro}. 
Incluye ideas de contenido, frecuencia de publicación y objetivos.`;
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error al llamar a ChatGPT:", error);
    return null;
  }
}

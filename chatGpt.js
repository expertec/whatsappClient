// server/chatGpt.js
require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // En Render debes configurar esta variable
});
const openai = new OpenAIApi(configuration);

/**
 * Genera una estrategia mensual de marketing en redes sociales
 * usando la API de ChatGPT, basada en el giro del negocio.
 *
 * @param {string} giro - El giro del negocio (ej: "Restaurante", "Moda", etc.)
 * @returns {Promise<string|null>} - Retorna el texto de la estrategia o null si falla
 */
async function generarEstrategia(giro) {
  const prompt = `Genera una estrategia mensual de marketing en redes sociales para un negocio del giro: ${giro}. 
Incluye ideas de contenido, frecuencia de publicación, y objetivos.`;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error al llamar a ChatGPT:", error);
    return null;
  }
}

module.exports = { generarEstrategia };

// server/chatGpt.js
import dotenv from 'dotenv';
dotenv.config();
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Genera una estrategia de Facebook y Facebook Ads y un calendario de contenido
 * a partir de la información del lead.
 * @param {object} lead - Objeto con datos del lead: negocio, giro, descripcion, etc.
 * @returns {Promise<string|null>} - Texto de la estrategia (idealmente en formato JSON) o null en caso de error.
 */
export async function generarEstrategia(lead) {
  // Construir un objeto con la información detallada del negocio
  const promptData = {
    businessName: lead.negocio,
    businessType: lead.giro,
    description: lead.descripcion,
    objectives:
      "Incrementar ventas, fidelizar clientes y aumentar la presencia en línea a través de campañas efectivas en Facebook y Facebook Ads.",
    targetAudience:
      "Clientes potenciales que interactúan en Facebook, interesados en productos o servicios de alta calidad y excelente atención.",
    contentCalendar: [
      {
        day: "Lunes",
        topic: "Presentación de productos",
        description:
          "Publicar una imagen o video en Facebook mostrando el producto estrella, resaltando sus beneficios y características.",
        callToAction: "Compra ahora",
      },
      {
        day: "Miércoles",
        topic: "Testimonios de clientes",
        description:
          "Compartir reseñas y experiencias positivas de clientes para generar confianza y fomentar la interacción.",
        callToAction: "Conoce más",
      },
      {
        day: "Viernes",
        topic: "Promociones y ofertas",
        description:
          "Anunciar ofertas especiales y promociones en Facebook Ads para incentivar la acción inmediata.",
        callToAction: "Aprovecha la oferta",
      },
    ],
  };

  const prompt = `Utiliza la siguiente información en formato JSON para generar una estrategia de marketing enfocada en Facebook y Facebook Ads, junto con un calendario de contenido detallado para el negocio:

${JSON.stringify(promptData, null, 2)}

Asegúrate de que el plan incluya fechas específicas, ideas de contenido, descripciones y acciones concretas, adaptadas a campañas en Facebook y Facebook Ads. Devuélvelo en formato JSON estructurado.`;

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


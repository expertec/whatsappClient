import dotenv from 'dotenv';
dotenv.config();
import { Configuration, OpenAIApi } from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Falta la variable de entorno OPENAI_API_KEY");
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Genera un plan de ventas para Facebook en formato de texto plano,
 * personalizado según los datos del lead y que incluya un calendario de contenidos
 * de 15 días con ejemplos específicos, adaptado al giro y la descripción real del negocio.
 *
 * @param {object} lead - Objeto con datos del lead, por ejemplo:
 *   {
 *     negocio: "Refacciones Rafa",
 *     giro: "Venta de refacciones para autos",
 *     descripcion: "Vendemos refacciones para automóviles con garantía y asesoría personalizada.",
 *     nombre: "Rafa Soto",
 *     telefono: "8311760335"
 *   }
 * @returns {Promise<string|null>} - El plan generado en texto plano o null en caso de error.
 */
export async function generarEstrategia(lead) {
  console.log("Datos del lead:", lead); // Verifica que llegan los datos correctos

  const promptData = {
    businessName: lead.negocio || "Nombre no proporcionado",
    businessType: lead.giro || "General",
    description: lead.descripcion || "Descripción no proporcionada",
    contactName: lead.nombre || "Sin nombre de contacto",
    phone: lead.telefono || "Sin teléfono"
  };

  // Prompt modificado para que todo el plan se adapte al giro y descripción reales, sin respuestas genéricas.
  const prompt = `Genera un plan de ventas para Facebook personalizado para el negocio "${promptData.businessName}".
Información del negocio:
  - Giro: ${promptData.businessType}
  - Descripción: ${promptData.description}
  - Contacto: ${promptData.contactName}
  - Teléfono: ${promptData.phone}

Por favor, asegúrate de que todo el plan esté específicamente adaptado al giro y la descripción del negocio, y no uses respuestas genéricas (no uses "General" si hay un valor específico). El plan debe incluir las siguientes secciones numeradas:

1. Objetivos del plan: Define objetivos específicos orientados al giro "${promptData.businessType}" y basado en la descripción "${promptData.description}".
2. Público objetivo: Describe un público objetivo segmentado y adaptado a un negocio de "${promptData.businessType}".
3. Estrategias de marketing en Facebook: Detalla estrategias concretas y específicas para el nicho de "${promptData.businessType}" y considerando la propuesta de valor "${promptData.description}".
4. Calendario de contenidos (15 días) con ejemplos personalizados. Para cada día, en la sección "Contenido Orgánico" debes incluir:
    - Si se usará una imagen o un video.
    - El estilo de diseño o si el video debe ser tipo reel.
    - Un copy sugerido y estrategias VSL que reflejen el giro "${promptData.businessType}" y la descripción "${promptData.description}".
   En la sección "Anuncio", describe un ejemplo de campaña adaptada al negocio, por ejemplo: "Dirige una campaña de retargeting a usuarios que hayan interactuado con publicaciones anteriores, utilizando un video corto y un CTA 'Conocer Más', adaptado a este negocio."
5. Presupuesto y KPIs: Define un presupuesto y KPIs orientados a los objetivos del negocio de "${promptData.businessType}".
6. Herramientas e integración: Menciona herramientas específicas que se puedan utilizar para optimizar la estrategia de un negocio en el sector de "${promptData.businessType}".

Genera el plan completo en texto plano, con secciones claras y numeradas, sin respuestas genéricas.`;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error al llamar a ChatGPT:", error.response ? error.response.data : error);
    return null;
  }
}

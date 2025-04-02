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
 * personalizado con los datos "giro" y "descripcion" del negocio.
 *
 * @param {object} lead - Objeto con datos del lead, por ejemplo:
 *   {
 *     negocio: "SP Playeras",
 *     giro: "Venta de Ropa",
 *     descripcion: "Venta de ropa al mayoreo con énfasis en calidad y moda.",
 *     nombre: "Michel Perez",
 *     telefono: "8311760335"
 *   }
 * @returns {Promise<string|null>} - Plan de ventas en texto plano o null en caso de error.
 */
export async function generarPlanVentas(lead) {
  const promptData = {
    businessName: lead.negocio || "Nombre no proporcionado",
    businessType: lead.giro || "General",
    description: lead.descripcion || "Descripción no proporcionada",
    contactName: lead.nombre || "Sin nombre de contacto",
    phone: lead.telefono || "Sin teléfono"
  };

  // Construir el prompt para que ChatGPT genere un plan en texto claro, no en formato JSON.
  const prompt = `Genera un plan de ventas para Facebook, personalizado para el negocio "${promptData.businessName}".
Usa los siguientes datos:
  - Giro: ${promptData.businessType}
  - Descripción: ${promptData.description}
  - Contacto: ${promptData.contactName}
  - Teléfono: ${promptData.phone}

El plan debe incluir las siguientes secciones, adaptadas al negocio:
  1. Objetivos del plan
  2. Público objetivo
  3. Estrategias de marketing en Facebook
  4. Calendario de contenidos (15 días) con ejemplos personalizados
  5. Presupuesto y KPIs
  6. Herramientas e integración

Genera el plan en formato de texto plano, con secciones claras y numeradas, sin formato JSON.`;

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

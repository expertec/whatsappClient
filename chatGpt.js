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
 * personalizado según los datos del lead ("giro" y "descripcion") y que
 * incluya un calendario de contenidos de 15 días con ejemplos específicos.
 *
 * @param {object} lead - Objeto con datos del lead, por ejemplo:
 *   {
 *     negocio: "SP Playeras",
 *     giro: "Venta de Ropa",
 *     descripcion: "Venta de ropa al mayoreo con énfasis en calidad y moda.",
 *     nombre: "Michel Perez",
 *     telefono: "8311760335"
 *   }
 * @returns {Promise<string|null>} - El plan generado en texto plano o null en caso de error.
 */
export async function generarEstrategia(lead) {
  // Mostrar el objeto lead para verificar que tenga los datos correctos
  console.log("Datos del lead:", lead);

  // Asegurarse de que se tengan los campos necesarios
  const promptData = {
    businessName: lead.negocio || "Nombre no proporcionado",
    businessType: lead.giro || "General",
    description: lead.descripcion || "Descripción no proporcionada",
    contactName: lead.nombre || "Sin nombre de contacto",
    phone: lead.telefono || "Sin teléfono"
  };

  // Prompt actualizado para que ChatGPT incluya personalización en cada sección, especialmente en el calendario
  const prompt = `Genera un plan de ventas para Facebook personalizado para el negocio "${promptData.businessName}".
Utiliza la siguiente información del negocio:
  - Giro: ${promptData.businessType}
  - Descripción: ${promptData.description}
  - Contacto: ${promptData.contactName}
  - Teléfono: ${promptData.phone}

El plan debe estar en formato de texto plano y debe incluir las siguientes secciones numeradas:

1. Objetivos del plan.
2. Público objetivo.
3. Estrategias de marketing en Facebook.
4. Calendario de contenidos (15 días) con ejemplos personalizados. En cada día, en la sección "Contenido Orgánico", especifica:
     - Si se usará una imagen o un video.
     - El estilo de diseño o si el video debe ser tipo reel.
     - Un copy sugerido y estrategias de VSL, personalizando el mensaje según el giro ("${promptData.businessType}") y la descripción ("${promptData.description}") del negocio.
   En la sección "Anuncio", describe un ejemplo de campaña, por ejemplo: "Dirige una campaña de retargeting a usuarios que hayan interactuado con publicaciones anteriores, utilizando un video corto y un CTA que invite a 'Conocer Más', adaptado al giro y la propuesta del negocio."
5. Presupuesto y KPIs.
6. Herramientas e integración.

Asegúrate de que cada sección esté personalizada de acuerdo a la información anterior. Genera el plan completo en texto plano, con secciones claras y numeradas.`;

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

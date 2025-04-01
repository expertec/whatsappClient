import dotenv from 'dotenv';
dotenv.config();
import { Configuration, OpenAIApi } from 'openai';

// Verificar que se haya proporcionado la API key de OpenAI
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Falta la variable de entorno OPENAI_API_KEY");
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Genera un plan de marketing detallado en formato JSON basado en la información del lead.
 * El JSON generado incluye campos como objetivos, ideas de marketing, audiencia, posicionamiento,
 * plan estratégico (timeline y estrategia de comunicación) e información adicional.
 *
 * @param {object} lead - Objeto con datos del lead: negocio, giro, descripción, etc.
 * @returns {Promise<string|null>} - Plan de marketing en formato JSON o null en caso de error.
 */
export async function generarEstrategia(lead) {
  // Datos básicos del negocio con valores por defecto
  const promptData = {
    businessName: lead.negocio || "Nombre no proporcionado",
    businessType: lead.giro || "General",
    description: lead.descripcion || "Descripción no proporcionada",
  };

  // Definir la estructura JSON esperada para el plan de marketing
  const jsonStructure = {
    titulo: `Plan de Marketing para ${promptData.businessName}`,
    instrucciones: "Completa el siguiente plan de acuerdo a los objetivos de tu proyecto.",
    nombreProyecto: "[NOMBRE/LOGO DEL PROYECTO]",
    objetivosCuantitativos: [
      "Ejemplo: Incrementar ventas en un 20%",
      "Ejemplo: Aumentar tráfico web en un 30%"
    ],
    objetivosCualitativos: [
      "Ejemplo: Mejorar la percepción de marca",
      "Ejemplo: Fidelizar clientes actuales"
    ],
    keyMarketingIdeas: "Describe el paso a paso de tu plan de marketing, incluyendo estrategias online y offline.",
    audienciaObjetivo: "Definir la audiencia objetivo considerando género, edad, ubicación y estilo de vida.",
    conceptosTeoricos: "Valores de marca y diferenciadores del negocio.",
    posicionamiento: "Análisis de la competencia y posicionamiento en el mercado.",
    planEstrategico: {
      timeline: [
        {
          fase: "Campaña Expectativa",
          acciones: [
            { fecha: "dd/mm/aa", actividad: "Inicio de expectativa en redes." },
            { fecha: "dd/mm/aa", actividad: "Envío de boletín de prensa." }
          ]
        },
        {
          fase: "Campaña Lanzamiento",
          acciones: [
            { fecha: "dd/mm/aa", actividad: "Lanzamiento del producto/servicio." },
            { fecha: "dd/mm/aa", actividad: "Activación de redes sociales." }
          ]
        },
        {
          fase: "Campaña Sostenimiento",
          acciones: [
            { fecha: "dd/mm/aa", actividad: "Publicación de resultados y seguimiento." }
          ]
        }
      ],
      estrategiaComunicacion: "Desarrollar un mensaje de comunicación claro y coherente con la marca."
    },
    informacionAdicional: "Incluir cualquier otra información relevante para el plan."
  };

  // Construir el prompt que se enviará a ChatGPT
  const prompt = `Utilizando la siguiente información del negocio en formato JSON:

${JSON.stringify(promptData, null, 2)}

Genera un plan de marketing detallado en formato JSON siguiendo la siguiente estructura:

${JSON.stringify(jsonStructure, null, 2)}

Asegúrate de adaptar la información según el giro del negocio y la descripción proporcionada. El resultado debe ser un JSON válido.`;

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

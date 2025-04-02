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
 * Genera un plan de ventas para Facebook en formato JSON, personalizado para cada negocio
 * utilizando los campos "giro" y "descripcion" del lead.
 *
 * @param {object} lead - Objeto con datos del lead:
 *   {
 *     negocio: "SP Playeras",
 *     giro: "Venta de Ropa",
 *     descripcion: "Venta de ropa al mayoreo con énfasis en calidad y moda.",
 *     nombre: "Michel Perez",
 *     telefono: "8311760335",
 *     ...
 *   }
 * @returns {Promise<string|null>} - Plan de ventas en formato JSON o null en caso de error.
 */
export async function generarEstrategia(lead) {
  // Datos básicos del negocio con valores por defecto
  const promptData = {
    businessName: lead.negocio || "Nombre no proporcionado",
    businessType: lead.giro || "General",
    description: lead.descripcion || "Descripción no proporcionada",
    contactName: lead.nombre || "Sin nombre de contacto",
    phone: lead.telefono || "Sin teléfono"
  };

  // Instrucciones genéricas que incorporan "giro" y "descripcion"
  const personalizedInstructions = `Personaliza las siguientes secciones del plan basándote en la naturaleza del negocio y su propuesta: 
  - Giro: "${promptData.businessType}"
  - Descripción: "${promptData.description}"`;

  // Estructura JSON personalizada para el plan de ventas en Facebook
  const jsonStructure = {
    titulo: `Plan de Ventas para Facebook para ${promptData.businessName}`,
    objetivosPlan: {
      incrementarVentas: `Incrementar las ventas de ${promptData.businessName} en el sector ${promptData.businessType}, aprovechando sus fortalezas: ${promptData.description}.`,
      fortalecerMarca: `Fortalecer la marca de ${promptData.businessName} en Facebook, destacando su propuesta única en ${promptData.businessType} basada en ${promptData.description}.`,
      fidelizarClientes: `Crear una comunidad comprometida para ${promptData.businessName} en el nicho de ${promptData.businessType}, aprovechando el enfoque: ${promptData.description}.`,
      generarLeads: `Generar leads calificados interesados en las propuestas de ${promptData.businessName} en ${promptData.businessType} según su propuesta: ${promptData.description}.`
    },
    publicoObjetivo: [
      `Clientes que buscan productos/servicios de ${promptData.businessType} que valoren ${promptData.description}.`,
      `Empresas y particulares interesados en la calidad y personalización en ${promptData.businessType}.`,
      `Segmentos de mercado específicos relacionados con ${promptData.businessType} y la propuesta de ${promptData.description}.`
    ],
    estrategiasMarketing: {
      contenidoOrganicoMultimedia: `Crear contenido visual y audiovisual que demuestre cómo ${promptData.businessName} ofrece ${promptData.description} en el sector ${promptData.businessType}.`,
      publicidadPagadaSegmentacion: `Desarrollar campañas en Facebook dirigidas a audiencias interesadas en ${promptData.businessType} y que valoren ${promptData.description}.`,
      integracionHerramientasAutomatizacion: `Implementar herramientas y automatización (chatbots, CRM) adaptadas a las necesidades de ${promptData.businessType} y la propuesta de ${promptData.description}.`,
      tendenciasClave: `Adoptar tendencias e innovaciones que potencien el posicionamiento en ${promptData.businessType} basándose en ${promptData.description}.`
    },
    calendarioContenidos: [
      {
        dia: "Día 1 (Lunes)",
        contenidoOrganico: `Publica una imagen inspiradora que refleje la esencia de ${promptData.businessName} y cómo se destaca en ${promptData.businessType}: ${promptData.description}.`,
        anuncio: `Inicia una campaña de bienvenida resaltando las ventajas de ${promptData.businessName} en ${promptData.businessType}.`
      },
      {
        dia: "Día 2 (Martes)",
        contenidoOrganico: `Comparte un carrusel de imágenes que muestren diferentes aspectos y aplicaciones de los productos/servicios de ${promptData.businessName}.`,
        objetivo: `Generar interacción preguntando: "¿Cuál de estas opciones refleja mejor tu estilo?"`
      },
      {
        dia: "Día 3 (Miércoles)",
        contenidoOrganico: `Publica un video corto mostrando el proceso detrás de ${promptData.businessName} y cómo se implementa ${promptData.description}.`,
        anuncio: `Lanza una campaña para que los interesados soliciten más información sobre ${promptData.businessType}.`
      },
      {
        dia: "Día 4 (Jueves)",
        contenidoOrganico: `Publica un testimonio en carrusel de un cliente satisfecho que resalte la calidad de ${promptData.businessName}.`,
        objetivo: `Reforzar la confianza y credibilidad destacando los valores de ${promptData.description}.`
      },
      {
        dia: "Día 5 (Viernes)",
        contenidoOrganico: `Comparte un reel dinámico que muestre el empaque, la personalización y el servicio de ${promptData.businessName}.`,
        anuncio: `Anuncia una promoción especial con un CTA "Cotizar Ahora" para atraer nuevos clientes.`
      },
      {
        dia: "Día 6 (Sábado)",
        contenidoOrganico: `Utiliza historias para realizar una encuesta interactiva sobre preferencias relacionadas con ${promptData.businessType}.`,
        objetivo: `Fomentar la participación y recopilar feedback sobre ${promptData.description}.`
      },
      {
        dia: "Día 7 (Domingo)",
        contenidoOrganico: `Publica un resumen semanal en infografía que muestre logros y comentarios destacados sobre ${promptData.businessName}.`,
        anuncio: `Lanza un anuncio recordatorio con un CTA "Solicitar Cotización Hoy".`
      },
      {
        dia: "Día 8 (Lunes)",
        contenidoOrganico: `Realiza un Facebook Live para presentar al equipo y mostrar el proceso de ${promptData.businessName} en acción.`,
        objetivo: `Humanizar la marca y crear una conexión directa con la audiencia.`
      },
      {
        dia: "Día 9 (Martes)",
        contenidoOrganico: `Publica una imagen creativa que demuestre cómo los productos/servicios de ${promptData.businessName} se utilizan en situaciones reales.`,
        objetivo: `Inspirar a los potenciales clientes a imaginar el producto en su entorno.`
      },
      {
        dia: "Día 10 (Miércoles)",
        contenidoOrganico: `Comparte una infografía educativa sobre tendencias y datos relevantes del sector ${promptData.businessType}.`,
        anuncio: `Dirige una campaña de retargeting con un CTA "Conocer Más".`
      },
      {
        dia: "Día 11 (Jueves)",
        contenidoOrganico: `Publica un video testimonial de un cliente que resalte cómo ${promptData.businessName} ha marcado la diferencia en ${promptData.businessType}.`,
        objetivo: `Validar socialmente mediante experiencias reales.`
      },
      {
        dia: "Día 12 (Viernes)",
        contenidoOrganico: `Comparte un reel demostrativo que muestre cómo se personaliza o utiliza el producto/servicio de ${promptData.businessName}.`,
        anuncio: `Lanza un anuncio promocional con un descuento especial y CTA "Aprovecha Ahora".`
      },
      {
        dia: "Día 13 (Sábado)",
        contenidoOrganico: `Publica una imagen "antes y después" que ilustre el impacto de la personalización o mejora en ${promptData.businessName}.`,
        objetivo: `Demostrar el valor añadido basado en ${promptData.description}.`
      },
      {
        dia: "Día 14 (Domingo)",
        contenidoOrganico: `Comparte una historia mostrando el día a día en la empresa, resaltando la filosofía de ${promptData.businessName}.`,
        anuncio: `Publica un anuncio recordatorio con CTA "Solicitar Cotización o Asesoría".`
      },
      {
        dia: "Día 15 (Lunes)",
        contenidoOrganico: `Publica un resumen quincenal en infografía o video con datos de interacción y feedback sobre ${promptData.businessName}.`,
        anuncio: `Anuncia un CTA final invitando a suscribirse al boletín para obtener beneficios exclusivos.`
      }
    ],
    presupuestoKPIs: {
      presupuestoPublicitario: `Definir una inversión que refleje el potencial de crecimiento en el sector ${promptData.businessType} y la propuesta de ${promptData.businessName}: ${promptData.description}.`,
      KPIs: [
        "Alcance e impresiones",
        "Tasa de interacción (likes, comentarios, compartidos)",
        "CTR (Click Through Rate)",
        "Costo por Lead (CPL)",
        "Retorno de Inversión (ROI)",
        "Conversiones específicas del sector"
      ]
    },
    herramientasIntegracion: {
      metaBusinessSuite: `Utilizar Meta Business Suite para analizar la audiencia interesada en ${promptData.businessType}.`,
      crmAutomatizacion: `Emplear un CRM adaptado a las necesidades de empresas en ${promptData.businessType}, considerando la propuesta de ${promptData.description}.`,
      estrategiaOmnicanal: `Integrar Facebook, Instagram, WhatsApp y Messenger para una experiencia coherente en el sector ${promptData.businessType}.`,
      socialListening: `Monitorear el feedback y tendencias del mercado en ${promptData.businessType} para ajustar la estrategia basada en ${promptData.description}.`
    }
  };

  // Construir el prompt completo a enviar a ChatGPT
  const prompt = `Utilizando la siguiente información del negocio en formato JSON:

${JSON.stringify(promptData, null, 2)}

${personalizedInstructions}

Genera un plan de ventas para Facebook en formato JSON, siguiendo la estructura a continuación:

${JSON.stringify(jsonStructure, null, 2)}

Asegúrate de adaptar cada sección según el giro ("${promptData.businessType}") y la descripción ("${promptData.description}") proporcionadas. El resultado debe ser un JSON válido.`;

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

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
 * Genera un plan de ventas para Facebook en formato JSON, adaptado al negocio.
 * El plan incluye:
 *  - Título dinámico
 *  - Objetivos del Plan
 *  - Público Objetivo
 *  - Estrategias de Marketing (Contenido Orgánico, Publicidad, Integración y Tendencias)
 *  - Calendario de Contenidos (15 días) con ejemplos
 *  - Presupuesto y KPIs
 *  - Herramientas e Integración
 *
 * @param {object} lead - Objeto con datos del lead tal como se guarda en la BD:
 *   {
 *     negocio: "SP Playeras",
 *     giro: "Venta de Ropa",
 *     descripcion: "Venta de ropa al mayoreo",
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
    phone: lead.telefono || "Sin teléfono",
  };

  // Estructura JSON esperada para el plan de ventas en Facebook
  const jsonStructure = {
    titulo: `Plan de Ventas para Facebook: Estrategias y Calendario de Contenidos (15 Días) para ${promptData.businessName}`,
    objetivosPlan: {
      incrementarVentas: "Aumentar los pedidos al por mayor mediante estrategias de conversión optimizadas.",
      fortalecerMarca: `Posicionar la marca en Facebook como referente de calidad, innovación y servicio en el sector ${promptData.businessType}.`,
      fidelizarClientes: "Crear una comunidad comprometida y generar confianza a largo plazo.",
      generarLeads: "Obtener datos de potenciales clientes interesados en compras a gran escala y personalización."
    },
    publicoObjetivo: [
      "Mayoristas y Distribuidores: Tiendas, boutiques y distribuidores.",
      "Empresas y Organizaciones: Compañías que requieren productos para uniformes, eventos o promociones.",
      "Organizadores de Eventos y Marcas Emergentes: Negocios que buscan soluciones integrales de personalización y merchandising."
    ],
    estrategiasMarketing: {
      contenidoOrganicoMultimedia: "Publicaciones visuales y videos cortos, historias y live streaming, contenido educativo y user-generated content.",
      publicidadPagadaSegmentacion: "Campañas de conversión y tráfico, segmentación con IA, retargeting dinámico y anuncios interactivos.",
      integracionHerramientasAutomatizacion: "Uso de chatbots y messenger marketing, análisis en tiempo real y colaboración con influencers.",
      tendenciasClave: "Personalización y experiencias hiper-relevantes, sostenibilidad y responsabilidad social, interacción omnicanal."
    },
    calendarioContenidos: [
      // Se deja el calendario de 15 días como ejemplo base
      {
        dia: "Día 1 (Lunes)",
        contenidoOrganico: "Publica una imagen de un producto con fondo inspirador y el texto: '¡Nueva semana, nuevos estilos!'",
        anuncio: "Inicia una campaña 'Oferta de Bienvenida' con un anuncio gráfico que incluya un cupón de descuento del 10%."
      },
      // ... Continúa con el resto de días
      {
        dia: "Día 15 (Lunes)",
        contenidoOrganico: "Publica un resumen quincenal en formato infografía o video, con datos de interacción y feedback de clientes.",
        anuncio: "Invita a suscribirse al boletín para obtener beneficios exclusivos, descuentos y novedades."
      }
    ],
    presupuestoKPIs: {
      presupuestoPublicitario: "Inversión mensual distribuida: 30-40% para conversión y retargeting, 20-30% para anuncios de engagement y 30-40% para branding.",
      KPIs: [
        "Alcance e impresiones",
        "Tasa de interacción (likes, comentarios, compartidos)",
        "CTR (Click Through Rate)",
        "Costo por Lead (CPL)",
        "Retorno de Inversión (ROI)",
        "Métricas de conversión (solicitudes de catálogo, cotizaciones, ventas)"
      ]
    },
    herramientasIntegracion: {
      metaBusinessSuite: "Para gestionar y analizar campañas en tiempo real.",
      crmAutomatizacion: "Uso de CRM para seguimiento de leads y personalización de mensajes.",
      estrategiaOmnicanal: "Integración de Facebook, Instagram, WhatsApp y Messenger para una experiencia unificada.",
      socialListening: "Empleo de herramientas para monitorear feedback y ajustar la estrategia."
    }
  };

  // Construir el prompt que se enviará a ChatGPT
  const prompt = `Utilizando la siguiente información del negocio en formato JSON:

${JSON.stringify(promptData, null, 2)}

Genera un plan de ventas para Facebook en formato JSON, siguiendo la estructura a continuación:

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

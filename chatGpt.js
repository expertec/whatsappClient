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
 * Se personaliza la estrategia utilizando los campos "descripcion" y "giro".
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

  // Instrucciones genéricas para personalizar la estrategia según la descripción y giro
  const personalizedInstructions = `Personaliza las estrategias de acuerdo a la naturaleza del negocio y la siguiente descripción: "${promptData.description}". Considera el giro del negocio: "${promptData.businessType}".`;

  // Estructura JSON esperada para el plan de ventas en Facebook con 15 días de calendario
  const jsonStructure = {
    titulo: `Plan de Ventas para Facebook: Estrategias y Calendario de Contenidos (15 Días) para ${promptData.businessName}`,
    objetivosPlan: {
      incrementarVentas: "Aumentar los pedidos al por mayor mediante estrategias de conversión optimizadas.",
      fortalecerMarca: `Posicionar la marca en Facebook como referente de calidad, innovación y servicio en el sector ${promptData.businessType}.`,
      fidelizarClientes: "Crear una comunidad comprometida y generar confianza a largo plazo.",
      generarLeads: "Obtener datos de potenciales clientes interesados en compras a gran escala y personalización."
    },
    publicoObjetivo: [
      "Segmento 1: Describe el perfil del cliente ideal.",
      "Segmento 2: Describe otro perfil relevante.",
      "Segmento 3: Describe un tercer perfil si aplica."
    ],
    estrategiasMarketing: {
      contenidoOrganicoMultimedia: "Publicaciones visuales y videos cortos, historias y live streaming, contenido educativo y contenido generado por usuarios.",
      publicidadPagadaSegmentacion: "Campañas de conversión y tráfico, segmentación inteligente, retargeting dinámico y anuncios interactivos.",
      integracionHerramientasAutomatizacion: "Uso de chatbots, messenger marketing, análisis en tiempo real y colaboración con influencers.",
      tendenciasClave: "Personalización, innovación, sostenibilidad y estrategias omnicanal."
    },
    calendarioContenidos: [
      {
        dia: "Día 1 (Lunes)",
        contenidoOrganico: "Publica una imagen inspiradora del producto o servicio con un mensaje motivador.",
        anuncio: "Inicia una campaña de bienvenida con un cupón de descuento o promoción."
      },
      {
        dia: "Día 2 (Martes)",
        contenidoOrganico: "Comparte un carrusel de imágenes que muestren diferentes aspectos del producto o servicio.",
        objetivo: "Genera interacción preguntando: '¿Cuál de estas opciones prefieres?'"
      },
      {
        dia: "Día 3 (Miércoles)",
        contenidoOrganico: "Publica un video corto mostrando el proceso detrás de la marca o producción.",
        anuncio: "Lanza una campaña con un llamado a la acción para solicitar más información."
      },
      {
        dia: "Día 4 (Jueves)",
        contenidoOrganico: "Comparte un testimonio en formato carrusel de un cliente satisfecho.",
        objetivo: "Reforzar la credibilidad y confianza en la marca."
      },
      {
        dia: "Día 5 (Viernes)",
        contenidoOrganico: "Comparte un reel dinámico mostrando aspectos destacados del producto o servicio.",
        anuncio: "Anuncia una promoción especial con un CTA 'Cotizar Ahora'."
      },
      {
        dia: "Día 6 (Sábado)",
        contenidoOrganico: "Utiliza historias para realizar una encuesta interactiva sobre las preferencias de tu audiencia.",
        objetivo: "Fomentar la participación y recoger feedback."
      },
      {
        dia: "Día 7 (Domingo)",
        contenidoOrganico: "Publica un resumen semanal en formato infografía, destacando logros y comentarios.",
        anuncio: "Lanza un anuncio recordatorio con un CTA 'Solicitar Cotización Hoy'."
      },
      {
        dia: "Día 8 (Lunes)",
        contenidoOrganico: "Realiza un Facebook Live para presentar al equipo y el proceso detrás de la marca.",
        objetivo: "Humaniza la marca y crea conexión directa."
      },
      {
        dia: "Día 9 (Martes)",
        contenidoOrganico: "Publica una imagen creativa del producto en uso durante un evento.",
        objetivo: "Inspira a visualizar el producto en situaciones reales."
      },
      {
        dia: "Día 10 (Miércoles)",
        contenidoOrganico: "Comparte una infografía educativa sobre tendencias y datos relevantes del sector.",
        anuncio: "Dirige una campaña de retargeting con un CTA 'Conocer Más'."
      },
      {
        dia: "Día 11 (Jueves)",
        contenidoOrganico: "Publica un video testimonial de un cliente o usuario satisfecho.",
        objetivo: "Validar socialmente a través de experiencias reales."
      },
      {
        dia: "Día 12 (Viernes)",
        contenidoOrganico: "Comparte un reel demostrativo que muestre cómo se personaliza o utiliza el producto/servicio.",
        anuncio: "Lanza un anuncio promocional con un descuento especial y un CTA 'Aprovecha Ahora'."
      },
      {
        dia: "Día 13 (Sábado)",
        contenidoOrganico: "Publica una imagen 'antes y después' mostrando la transformación o mejora gracias al producto/servicio.",
        objetivo: "Demostrar el valor añadido de la personalización o innovación."
      },
      {
        dia: "Día 14 (Domingo)",
        contenidoOrganico: "Comparte una historia mostrando el día a día en la empresa (oficina, taller, etc.).",
        anuncio: "Publica un anuncio recordatorio con un CTA 'Solicitar Cotización o Asesoría'."
      },
      {
        dia: "Día 15 (Lunes)",
        contenidoOrganico: "Publica un resumen quincenal en formato infografía o video, con datos de interacción y feedback de clientes.",
        anuncio: "Anuncia un CTA final invitando a suscribirse al boletín para obtener beneficios exclusivos."
      }
    ],
    presupuestoKPIs: {
      presupuestoPublicitario: "Inversión mensual distribuida: 30-40% para campañas de conversión y retargeting, 20-30% para anuncios de engagement y 30-40% para branding.",
      KPIs: [
        "Alcance e impresiones",
        "Tasa de interacción (likes, comentarios, compartidos)",
        "CTR (Click Through Rate)",
        "Costo por Lead (CPL)",
        "Retorno de Inversión (ROI)",
        "Métricas de conversión (solicitudes, cotizaciones, ventas)"
      ]
    },
    herramientasIntegracion: {
      metaBusinessSuite: "Para gestionar y analizar campañas en tiempo real.",
      crmAutomatizacion: "Uso de CRM para seguimiento de leads y personalización de mensajes.",
      estrategiaOmnicanal: "Integración de Facebook, Instagram, WhatsApp y Messenger para una experiencia unificada.",
      socialListening: "Uso de herramientas para monitorear feedback y ajustar la estrategia."
    }
  };

  // Construir el prompt completo a enviar a ChatGPT
  const prompt = `Utilizando la siguiente información del negocio en formato JSON:

${JSON.stringify(promptData, null, 2)}

${personalizedInstructions}

Genera un plan de ventas para Facebook en formato JSON, siguiendo la estructura a continuación:

${JSON.stringify(jsonStructure, null, 2)}

Asegúrate de adaptar la información según el giro ("${promptData.businessType}") y la descripción ("${promptData.description}") proporcionadas. El resultado debe ser un JSON válido.`;

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

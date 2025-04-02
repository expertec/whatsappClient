export async function generarEstrategia(lead) {
  console.log("Datos del lead:", lead);

  const promptData = {
    businessName: lead.negocio || "Nombre no proporcionado",
    businessType: lead.giro || "General",
    description: lead.descripcion || "Descripción no proporcionada",
    contactName: lead.nombre || "Sin nombre de contacto",
    phone: lead.telefono || "Sin teléfono"
  };

  // Prompt modificado para forzar una personalización completa
  const prompt = `Genera un plan de ventas para Facebook que esté completamente adaptado al negocio "${promptData.businessName}".
Información del negocio:
  - Giro: ${promptData.businessType}
  - Descripción: ${promptData.description}
  - Contacto: ${promptData.contactName}
  - Teléfono: ${promptData.phone}

El plan debe estar desarrollado específicamente para un negocio con estas características. Es decir, cada sección debe usar la información de "giro" y "descripcion" de forma concreta. El plan debe incluir las siguientes secciones numeradas:

1. Objetivos del plan: Define objetivos específicos adaptados a un negocio de "${promptData.businessType}" basado en "${promptData.description}".
2. Público objetivo: Describe de manera segmentada el público ideal para un negocio de "${promptData.businessType}".
3. Estrategias de marketing en Facebook: Desarrolla estrategias específicas, mencionando tácticas concretas que se ajusten a la naturaleza de "${promptData.businessType}" y a la propuesta de valor "${promptData.description}".
4. Calendario de contenidos (15 días): Para cada día, en la sección "Contenido Orgánico" describe:
    - Si se usará una imagen o un video (y si el video debe ser tipo reel).
    - El estilo de diseño y un copy sugerido, utilizando estrategias VSL que reflejen las necesidades de un negocio de "${promptData.businessType}".
   En la sección "Anuncio", incluye un ejemplo de campaña, como: "Dirige una campaña de retargeting a usuarios que hayan interactuado con publicaciones anteriores, utilizando un video corto y un CTA 'Conocer Más', adaptado a este negocio."
5. Presupuesto y KPIs: Define un presupuesto y los KPIs relevantes para un negocio de "${promptData.businessType}".
6. Herramientas e integración: Menciona herramientas específicas que se puedan usar para optimizar la estrategia en el sector de "${promptData.businessType}".

Genera el plan completo en texto plano, con secciones claras y numeradas, y que cada sección esté personalizada basándose en los datos proporcionados.`;

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

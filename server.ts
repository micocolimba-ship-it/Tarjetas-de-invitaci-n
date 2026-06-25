import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Crucial: Use JSON middleware to parse POST request bodies
  app.use(express.json());

  // API Routes MUST go before Vite middleware
  app.post("/api/generate-template", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY no configurado",
          message: "Por favor, agrega tu clave GEMINI_API_KEY en el panel de Configuración > Secretos (Settings > Secrets) de la plataforma para activar el generador de IA."
        });
      }

      const { promptDescription, category } = req.body;
      if (!promptDescription) {
        return res.status(400).json({ error: "Falta la descripción de la plantilla" });
      }

      // Lazy instantiation of GoogleGenAI SDK as required
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `Eres un diseñador experto en invitaciones digitales de boda y eventos familiares.
Tu objetivo es diseñar un fragmento de código HTML con estilos integrados usando Tailwind CSS y variables dinámicas encerradas en dobles llaves, por ejemplo {{title}}.

REGLAS DE DISEÑO:
- Entrega un diseño con estilo excepcional, alta legibilidad, espaciado generoso y aspecto prémium. Evita diseños genéricos o planos.
- Usa clases de Tailwind CSS nativas. Toda la paleta de colores y bordes debe armonizar perfectamente según lo pedido por el usuario (ej. rústico italiano, elegante marfil con oro, etc.).
- El diseño debe ser 100% responsivo (bello tanto en smartphones como en monitores).

REGLAS DE FUENTES DE GOOGLE FONTS:
- Debes aplicar una de las fuentes recomendadas para títulos y cuerpo usando style="font-family: '{{fontTitle}}';" y style="font-family: '{{fontBody}}';" respectivamente en los contenedores.
- Fuentes de títulos permitidas: "Great Vibes", "Playfair Display", "Cinzel", "Dancing Script", "Alex Brush", "Sacramento", "Parisienne", "Italiana", "Cormorant Garamond", "Montserrat", "Space Grotesk".
- Fuentes de cuerpo permitidas: "Inter", "Montserrat", "Lora", "Cormorant Garamond", "Outfit", "JetBrains Mono".

REGLAS DE VARIABLES (PLACEHOLDERS):
Obligatorias:
- {{title}} - Título principal
- {{hostName}} - Nombre de los anfitriones
- {{date}} - Fecha con formato de palabras
- {{time}} - Hora del evento
- {{locationName}} - Nombre del lugar
- {{locationAddress}} - Dirección física
- {{description}} - Párrafo descriptivo o dedicatoria
- {{imageUrl}} - Imagen de portada
- {{whatsappContact}} - Número de contacto

Expandidas (Opcionales, puedes usar las que consideres que enriquecen este diseño particular):
- {{countdown}} - Cuenta regresiva animada
- {{spotify}} - Reproductor o widget de música
- {{gallery}} - Galería de imágenes (puedes estructurar una cuadrícula o carrusel elegante)
- {{video}} - Video del evento (ej. historia de amor, saludo de cumpleaños)
- {{giftLink}} - Enlace para regalos/aportes monetarios
- {{maps}} - Enlace/botón de Google Maps
- {{waze}} - Enlace/botón de Waze
- {{qrCode}} - Código QR para accesos o transferencias
- {{dressCode}} - Código de vestimenta (con iconos o indicaciones)
- {{hotel}} - Recomendaciones de hospedaje
- {{schedule}} - Cronograma o itinerario del evento
- {{menu}} - Detalles de la comida/banquete
- {{children}} - Nota sobre si es un evento con/sin niños
- {{instagram}} - Enlace a hashtag de Instagram
- {{facebook}} - Enlace a grupo/página de Facebook
- {{email}} - Correo de contacto
- {{website}} - Sitio web adicional del evento
- {{confirmationDeadline}} - Fecha límite de confirmación
- {{eventType}} - Tipo de evento
- {{theme}} - Tema o paleta de color sugerida

RETORNO:
Debes responder estrictamente en formato JSON utilizando el esquema requerido, devolviendo el código HTML en la propiedad 'htmlContent', los nombres de fuentes exactas recomendadas en 'fontTitle' y 'fontBody', el nombre y descripción en 'name' y 'description', una lista de variables detectadas en 'variablesUsed' y etiquetas útiles en 'tags'. El código HTML debe ser limpio, sin envoltorios de Markdown ni bloques de código \`\`\`.`;

      const promptText = `Crea una plantilla HTML de categoría "${category}" basada en la siguiente descripción del usuario:
"${promptDescription}"

Asegúrate de estructurar el código HTML hermosamente con Tailwind CSS.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Nombre creativo y descriptivo para la plantilla" },
              description: { type: Type.STRING, description: "Descripción refinada del estilo de la plantilla" },
              fontTitle: { type: Type.STRING, description: "La fuente recomendada para títulos de la lista permitida" },
              fontBody: { type: Type.STRING, description: "La fuente recomendada para el cuerpo de la lista permitida" },
              htmlContent: { type: Type.STRING, description: "Código HTML puro, autocompletado con estilos Tailwind CSS y placeholders" },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Etiquetas del diseño, por ejemplo ['italiano', 'marfil', 'boda', 'minimalista']"
              },
              variablesUsed: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Nombres de los placeholders que incluiste en el HTML, ej. ['title', 'hostName', 'date', 'countdown', 'dressCode']"
              }
            },
            required: ["name", "description", "fontTitle", "fontBody", "htmlContent", "tags", "variablesUsed"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No se pudo obtener texto del modelo de IA");
      }

      const result = JSON.parse(responseText.trim());
      res.json(result);

    } catch (error: any) {
      console.error("Error al generar plantilla con IA:", error);
      res.status(500).json({
        error: "Error de servidor al invocar Gemini",
        message: error.message || "Ocurrió un error inesperado al procesar la solicitud."
      });
    }
  });

  // Serve static frontend in production, or mount Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

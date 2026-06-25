import { EventType, TemplateStyle } from '../types';

/**
 * Image Service Framework
 * Handles the retrieval and generation of event images using three complementary strategies:
 * 1. Pre-curated High-Quality CDN Assets (Zero-setup, ultra-fast, zero-cost)
 * 2. Pixabay / Unsplash API integration (Real-time search of royalty-free photography)
 * 3. AI Prompt Generation for Image Generation (Gemini/Imagen-ready dynamic prompt creation)
 */

export interface EventImageOption {
  url: string;
  thumbnailUrl: string;
  author: string;
  source: 'Curated' | 'Pixabay' | 'AI';
  tags: string[];
}

// 1. PRE-CURATED HIGH-QUALITY CDN IMAGES (Unsplash Source, optimized sizes)
// We provide 3 distinct, beautiful high-resolution options per event type to fit various styles.
export const CURATED_EVENT_IMAGES: Record<EventType, EventImageOption[]> = {
  matrimonio: [
    {
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=300',
      author: 'Sandy Millar',
      source: 'Curated',
      tags: ['elegante', 'romantico', 'flores', 'boda']
    },
    {
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=300',
      author: 'Sweet Ice Cream Photography',
      source: 'Curated',
      tags: ['moderno', 'elegante', 'anillos']
    },
    {
      url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=300',
      author: 'Alvaro CvG',
      source: 'Curated',
      tags: ['rustico', 'romantico', 'naturaleza', 'madera']
    }
  ],
  cumpleanos: [
    {
      url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=300',
      author: 'Adi Goldstein',
      source: 'Curated',
      tags: ['festivo', 'globos', 'colorido']
    },
    {
      url: 'https://images.unsplash.com/photo-1533276395801-d27e4b00f7e3?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1533276395801-d27e4b00f7e3?auto=format&fit=crop&q=80&w=300',
      author: 'David Holifield',
      source: 'Curated',
      tags: ['elegante', 'pastel', 'velas']
    },
    {
      url: 'https://images.unsplash.com/photo-1464349110291-1f5b13f6892c?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1464349110291-1f5b13f6892c?auto=format&fit=crop&q=80&w=300',
      author: 'Lidya Nada',
      source: 'Curated',
      tags: ['infantil', 'festivo', 'divertido', 'dulces']
    }
  ],
  fiesta: [
    {
      url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=300',
      author: 'Andreas Rønningen',
      source: 'Curated',
      tags: ['festivo', 'confeti', 'celebracion']
    },
    {
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=300',
      author: 'Mauricio Mascaro',
      source: 'Curated',
      tags: ['moderno', 'luces', 'dj', 'baile']
    },
    {
      url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=300',
      author: 'Sven Brandsma',
      source: 'Curated',
      tags: ['rustico', 'guirnaldas', 'terraza']
    }
  ],
  reunion: [
    {
      url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=300',
      author: 'Dylan Gillis',
      source: 'Curated',
      tags: ['rustico', 'reunion', 'familia', 'comida']
    },
    {
      url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=300',
      author: 'Sebastian Coman Photography',
      source: 'Curated',
      tags: ['cocina', 'acogedor', 'compartir']
    },
    {
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=300',
      author: 'Nicole Wilcox',
      source: 'Curated',
      tags: ['jardin', 'picnic', 'reunion']
    }
  ],
  babyshower: [
    {
      url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=300',
      author: 'Feather & Birch',
      source: 'Curated',
      tags: ['romantico', 'bebe', 'decoracion']
    },
    {
      url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=300',
      author: 'Sora Sagano',
      source: 'Curated',
      tags: ['moderno', 'pasteles', 'colores-pasteles']
    }
  ],
  bautizo: [
    {
      url: 'https://images.unsplash.com/photo-1507504038482-76210f54ce65?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507504038482-76210f54ce65?auto=format&fit=crop&q=80&w=300',
      author: 'Jeremy Bishop',
      source: 'Curated',
      tags: ['elegante', 'luz', 'velas', 'blanco', 'santo']
    },
    {
      url: 'https://images.unsplash.com/photo-1520111919514-df1b907bb326?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1520111919514-df1b907bb326?auto=format&fit=crop&q=80&w=300',
      author: 'Katarzyna Grabowska',
      source: 'Curated',
      tags: ['romantico', 'flores', 'blanco', 'bebe']
    }
  ],
  confirmacion: [
    {
      url: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=300',
      author: 'Kamil Szumotalski',
      source: 'Curated',
      tags: ['elegante', 'velas', 'iglesia', 'luz']
    },
    {
      url: 'https://images.unsplash.com/photo-1518049360754-b381ec2c3fc9?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518049360754-b381ec2c3fc9?auto=format&fit=crop&q=80&w=300',
      author: 'Zoltan Tasi',
      source: 'Curated',
      tags: ['romantico', 'cálido', 'velas', 'comunion']
    }
  ],
  otro: [
    {
      url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=300',
      author: 'Priscilla Du Preez',
      source: 'Curated',
      tags: ['reunion', 'amigos', 'abrazos']
    },
    {
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=300',
      author: 'Headway',
      source: 'Curated',
      tags: ['comunidad', 'networking', 'taller']
    }
  ]
};

// 2. PIXABAY API INTERCONNECTION IMPLEMENTATION
// To interconnect Pixabay:
// - Register for a free API key at: https://pixabay.com/api/docs/
// - Pass the query and event-type to fetch high-resolution, completely free royalty-free images.
export async function searchPixabayImages(
  query: string,
  eventType: EventType,
  apiKey?: string
): Promise<EventImageOption[]> {
  if (!apiKey) {
    // Fallback: If no API key is specified, filter from the curated library based on query or return all for the event
    const curated = CURATED_EVENT_IMAGES[eventType] || CURATED_EVENT_IMAGES['otro'];
    if (!query) return curated;
    return curated.filter(img => 
      img.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  try {
    // Translate common Spanish event terms to English for better search precision on Pixabay
    const translationMap: Record<string, string> = {
      matrimonio: 'wedding',
      cumpleanos: 'birthday party',
      fiesta: 'celebration party',
      reunion: 'family gathering',
      babyshower: 'baby shower',
      bautizo: 'baptism',
      confirmacion: 'confirmation church',
      otro: 'event background'
    };

    const searchKeyword = query 
      ? `${translationMap[eventType] || eventType} ${query}` 
      : (translationMap[eventType] || eventType);

    const encodedQuery = encodeURIComponent(searchKeyword);
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodedQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=12`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.hits || data.hits.length === 0) {
      return [];
    }

    return data.hits.map((hit: any) => ({
      url: hit.largeImageURL,
      thumbnailUrl: hit.previewURL || hit.webformatURL,
      author: hit.user || 'Pixabay Creator',
      source: 'Pixabay',
      tags: hit.tags ? hit.tags.split(',').map((t: string) => t.trim()) : []
    }));
  } catch (error) {
    console.error('Failed fetching from Pixabay:', error);
    // Return curated fallback to ensure user experience never breaks
    return CURATED_EVENT_IMAGES[eventType] || CURATED_EVENT_IMAGES['otro'];
  }
}

// 3. AI IMAGE GENERATION PROMPT GENERATION
// Crafts highly descriptive, visual prompts for AI models (like Gemini's Imagen 3 or DALL-E)
// to generate an invitation background matching the user's customized context.
export function generateAiPromptForEvent(
  eventType: EventType,
  style: TemplateStyle,
  title: string,
  description: string
): string {
  const styleKeywords: Record<TemplateStyle, string> = {
    elegante: 'Elegant, high-end, minimal luxury, gold and cream accents, refined editorial style, 8k resolution, cinematic lighting, studio shot.',
    romantico: 'Romantic, soft pastel watercolor, delicate blush pink roses, warm natural sunlight, dreamlike boho chic aesthetic, whimsical.',
    moderno: 'Contemporary, dark slate gray and neon teal geometric framing, sleek UI layout, ultra-modern neon highlights, sharp contrast, futuristic digital art.',
    festivo: 'Vibrant, colorful birthday celebration, joyful confetti, bright glowing balloons, high energy, crisp details, playful illustration.',
    rustico: 'Cozy rustic background, warm wooden planks texture, organic eucalyptus leaves, fairy string lights glowing, warm country look, cozy and earthy.'
  };

  const eventCore: Record<EventType, string> = {
    matrimonio: 'A beautiful invitation card background celebrating marriage, love, and union.',
    cumpleanos: 'An inviting festive birthday background card designed for celebration.',
    fiesta: 'A dynamic party invitation canvas full of energy, celebration, and joy.',
    reunion: 'A cozy, inviting family reunion background showing warm gathering vibes, sharing and community.',
    babyshower: 'A gentle, adorable baby shower invitation backdrop with pastel colors, tender illustrations, and love.',
    bautizo: 'A sacred, elegant baptism invitation backdrop with gentle light, soft white flowers, and angels.',
    confirmacion: 'A refined, spiritual confirmation invitation card background with warm golden light and candles.',
    otro: 'A custom special event invitation layout, balanced background, clean negative space for typography overlay.'
  };

  const corePrompt = eventCore[eventType] || eventCore['otro'];
  const stylePrompt = styleKeywords[style] || styleKeywords['elegante'];

  // Construct a visual-rich, non-textual prompt to avoid AI garbling text.
  // Explicitly command the generator to not render text.
  return `${corePrompt} Styled in: ${stylePrompt} 
Context details: Inspired by "${title}". 
Composition: Clean, horizontal, spacious background banner. The design MUST have substantial negative space in the center for text overlay. Strictly NO text, NO alphabets, and NO words written on the image. Photorealistic and professional graphical design.`;
}

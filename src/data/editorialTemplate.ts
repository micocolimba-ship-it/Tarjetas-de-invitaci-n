import { CustomTemplate } from '../types';

export const EDITORIAL_WHITE_TEMPLATE: CustomTemplate = {
  id: 'editorial-white-v1',
  name: 'Editorial White v1.0',
  description: 'Inspirada en Vogue Weddings, The Lane y Kinfolk. Un diseño editorial de lujo de alta gama, con un uso exquisito del espacio en blanco, tipografía sofisticada y colores neutros refinados.',
  category: 'matrimonio',
  fontTitle: 'Playfair Display',
  fontBody: 'Inter',
  createdAt: '2026-06-25T12:00:00Z',
  config: {
    name: 'Editorial White v1.0',
    category: 'Matrimonio',
    author: 'Tarjeta Familiar',
    version: '1.0',
    date: '2026-06-25',
    description: 'Inspirada en Vogue Weddings, The Lane y Kinfolk. Un diseño editorial de lujo de alta gama, con un uso exquisito del espacio en blanco, tipografía sofisticada y colores neutros refinados.',
    tags: ['Premium', 'Editorial', 'Minimalista', 'Boda', 'Kinfolk'],
    variablesUsed: [
      'title',
      'hostName',
      'date',
      'time',
      'locationName',
      'locationAddress',
      'description',
      'imageUrl',
      'whatsappContact',
      'fontTitle',
      'fontBody',
      'countdown',
      'spotify',
      'schedule',
      'dressCode',
      'gallery',
      'video',
      'maps',
      'waze',
      'giftLink',
      'confirmationDeadline'
    ],
    fontTitle: 'Playfair Display',
    fontBody: 'Inter',
    status: 'Publicado'
  },
  htmlContent: `<!-- Editorial White v1.0 - Editorial Collection - Matrimonio -->
<div class="w-full min-h-screen bg-[#F7F4EF] text-[#2D2D2D] py-10 px-4 sm:px-8 font-sans flex flex-col items-center selection:bg-[#C7A873]/20" style="font-family: '{{fontBody}}', sans-serif;">
  
  <!-- Cover Card -->
  <div class="w-full max-w-xl bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#E9E3DA] mb-8 transition-transform duration-500 hover:shadow-[0_12px_40px_rgb(0,0,0,0.05)]">
    <!-- Cover Image -->
    <div class="relative w-full aspect-[4/5] overflow-hidden">
      <img src="{{imageUrl}}" class="w-full h-full object-cover transition-transform duration-[2000ms] ease-out hover:scale-105" alt="Cover" />
      <div class="absolute inset-4 border border-[#C7A873]/30 pointer-events-none rounded-[20px]"></div>
      <div class="absolute top-8 right-8 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#E9E3DA] text-[9px] uppercase tracking-widest text-[#2D2D2D] font-extrabold shadow-3xs">
        Colección Editorial
      </div>
    </div>
    
    <!-- Hero Details -->
    <div class="p-8 sm:p-12 text-center flex flex-col items-center">
      <span class="text-[11px] uppercase tracking-[0.25em] text-[#C7A873] font-bold mb-4">Invitación Oficial</span>
      
      <h1 class="text-2xl sm:text-3xl text-[#2D2D2D] leading-tight tracking-tight mb-4" style="font-family: '{{fontTitle}}', serif;">
        {{title}}
      </h1>
      
      <div class="w-24 h-[1px] bg-[#E9E3DA] relative my-5">
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="w-1.5 h-1.5 rounded-full bg-[#C7A873]"></span>
        </div>
      </div>
      
      <p class="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-bold mb-1">Anfitriones</p>
      <p class="text-[48px] sm:text-[58px] leading-none text-[#2D2D2D] mb-6 select-none font-normal py-1" style="font-family: 'Great Vibes', 'Alex Brush', 'Pinyon Script', cursive;">
        {{hostName}}
      </p>
      
      <div class="grid grid-cols-2 gap-4 w-full border-t border-b border-[#E9E3DA] py-4 my-2 text-center">
        <div>
          <p class="text-[9px] uppercase tracking-wider text-[#777777] font-bold">Fecha</p>
          <p class="text-sm font-bold text-[#2D2D2D] mt-1">{{date}}</p>
        </div>
        <div class="border-l border-[#E9E3DA]">
          <p class="text-[9px] uppercase tracking-wider text-[#777777] font-bold">Horario</p>
          <p class="text-sm font-bold text-[#2D2D2D] mt-1">{{time}} Hrs</p>
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center animate-bounce">
        <p class="text-[9px] uppercase tracking-[0.3em] text-[#777777] font-bold">Desliza para descubrir</p>
        <span class="text-[#C7A873] mt-2 text-sm">↓</span>
      </div>
    </div>
  </div>

  <!-- Editorial Story Card -->
  <div class="w-full max-w-xl bg-white rounded-[32px] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#E9E3DA] mb-8 text-center flex flex-col items-center">
    <span class="text-2xl text-[#C7A873] mb-3">“</span>
    <p class="text-sm sm:text-base leading-relaxed text-[#2D2D2D] font-light max-w-md italic" style="font-family: 'Cormorant Garamond', serif; font-size: 1.1rem;">
      {{description}}
    </p>
    <span class="text-2xl text-[#C7A873] mt-1">”</span>
  </div>

  <!-- Countdown Block -->
  <div class="w-full max-w-xl mb-8">
    {{countdown}}
  </div>

  <!-- Confirmation Deadline Banner -->
  <div class="w-full max-w-xl mb-8">
    {{confirmationDeadline}}
  </div>

  <!-- Location details -->
  <div class="w-full max-w-xl bg-white rounded-[32px] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#E9E3DA] mb-8 text-center flex flex-col items-center">
    <span class="text-[10px] uppercase tracking-[0.25em] text-[#C7A873] font-bold mb-3">Lugar del Evento</span>
    <h3 class="text-xl sm:text-2xl font-medium text-[#2D2D2D] mb-2" style="font-family: '{{fontTitle}}', serif;">
      {{locationName}}
    </h3>
    <p class="text-xs text-[#777777] font-normal leading-relaxed max-w-xs mb-6">
      {{locationAddress}}
    </p>
    
    <div class="w-full border-t border-[#E9E3DA] pt-6 mt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
      <div class="w-full sm:w-auto">
        {{maps}}
      </div>
      <div class="w-full sm:w-auto">
        {{waze}}
      </div>
    </div>
  </div>

  <!-- Schedule / Timeline -->
  <div class="w-full max-w-xl mb-8">
    {{schedule}}
  </div>

  <!-- Dress Code Section -->
  <div class="w-full max-w-xl mb-8">
    {{dressCode}}
  </div>

  <!-- Video Section -->
  <div class="w-full max-w-xl mb-8">
    {{video}}
  </div>

  <!-- Gallery Section -->
  <div class="w-full max-w-xl mb-8">
    {{gallery}}
  </div>

</div>`
};

export const EDITORIAL_BLACK_TEMPLATE: CustomTemplate = {
  id: 'editorial-black-v1',
  name: 'Editorial Black v1.0',
  description: 'Inspirada en Vogue, Dior, Chanel y Harper’s Bazaar. Un diseño editorial de lujo de alta gama en negro absoluto y dorado sutil, con uso refinado del espacio negativo y contrastes de moda.',
  category: 'matrimonio',
  fontTitle: 'Playfair Display',
  fontBody: 'Inter',
  createdAt: '2026-06-25T18:00:00Z',
  config: {
    name: 'Editorial Black v1.0',
    category: 'Matrimonio',
    author: 'Tarjeta Familiar',
    version: '1.0',
    date: '2026-06-25',
    description: 'Inspirada en Vogue, Dior, Chanel y Harper’s Bazaar. Un diseño editorial de alta gama en negro absoluto y dorado sutil, con uso refinado del espacio negativo y contrastes de moda.',
    tags: ['Premium', 'Editorial', 'Dark', 'Boda', 'Black Tie'],
    variablesUsed: [
      'title',
      'hostName',
      'date',
      'time',
      'locationName',
      'locationAddress',
      'description',
      'imageUrl',
      'whatsappContact',
      'fontTitle',
      'fontBody',
      'countdown',
      'spotify',
      'schedule',
      'dressCode',
      'gallery',
      'video',
      'maps',
      'waze',
      'giftLink',
      'confirmationDeadline'
    ],
    fontTitle: 'Playfair Display',
    fontBody: 'Inter',
    status: 'Publicado'
  },
  htmlContent: `<!-- Editorial Black v1.0 - Editorial Collection - Premium Dark -->
<div class="w-full min-h-screen bg-[#111111] text-[#FAF8F5] py-12 px-4 sm:px-8 font-sans flex flex-col items-center selection:bg-[#C7A873]/30" style="font-family: '{{fontBody}}', sans-serif;">
  
  <!-- Cover Card -->
  <div class="w-full max-w-xl bg-[#161616] rounded-[32px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)] border border-stone-850/80 mb-12 transition-transform duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
    <!-- Cover Image -->
    <div class="relative w-full aspect-[4/5] overflow-hidden">
      <img src="{{imageUrl}}" class="w-full h-full object-cover transition-transform duration-[3000ms] ease-out hover:scale-[1.03]" alt="Cover" />
      <div class="absolute inset-4 border border-[#C7A873]/20 pointer-events-none rounded-[20px]"></div>
      <div class="absolute top-8 right-8 bg-black/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-stone-800 text-[9px] uppercase tracking-[0.2em] text-[#FAF8F5] font-extrabold shadow-3xs">
        COLECCIÓN EDITORIAL
      </div>
      
      <!-- Overlay Title & Hosts on Image for Cinematic Hero Feel -->
      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-8 sm:p-10 flex flex-col justify-end text-center">
        <h1 class="text-2xl sm:text-3xl text-white leading-tight tracking-tight mb-2" style="font-family: '{{fontTitle}}', serif;">
          {{title}}
        </h1>
        <p class="text-[40px] sm:text-[48px] text-[#C7A873] leading-none select-none font-normal py-1" style="font-family: 'Great Vibes', 'Alex Brush', 'Pinyon Script', cursive;">
          {{hostName}}
        </p>
      </div>
    </div>
    
    <!-- Hero Details (Under image, styled minimally) -->
    <div class="p-8 sm:p-10 text-center flex flex-col items-center">
      <div class="grid grid-cols-2 gap-4 w-full border-t border-b border-stone-800 py-4 text-center">
        <div>
          <p class="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold">Fecha</p>
          <p class="text-sm font-bold text-[#FAF8F5] mt-1">{{date}}</p>
        </div>
        <div class="border-l border-stone-800">
          <p class="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold">Horario</p>
          <p class="text-sm font-bold text-[#FAF8F5] mt-1">{{time}} Hrs</p>
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center animate-pulse">
        <p class="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold">Desliza para descubrir</p>
        <span class="text-[#C7A873] mt-2 text-sm">↓</span>
      </div>
    </div>
  </div>

  <!-- Editorial Story Card -->
  <div class="w-full max-w-xl bg-[#161616] rounded-[32px] p-8 sm:p-12 shadow-[0_12px_45px_rgba(0,0,0,0.4)] border border-stone-850/80 mb-12 text-center flex flex-col items-center">
    <span class="text-3xl text-[#C7A873] mb-4 font-serif">“</span>
    <p class="text-sm sm:text-base leading-relaxed text-[#FAF8F5] font-light max-w-md italic" style="font-family: 'Cormorant Garamond', serif; font-size: 1.15rem;">
      {{description}}
    </p>
    <span class="text-3xl text-[#C7A873] mt-2 font-serif">”</span>
  </div>

  <!-- Countdown Block -->
  <div class="w-full max-w-xl mb-12">
    {{countdown}}
  </div>

  <!-- Confirmation Deadline Banner -->
  <div class="w-full max-w-xl mb-12">
    {{confirmationDeadline}}
  </div>

  <!-- Location details -->
  <div class="w-full max-w-xl bg-[#161616] rounded-[32px] p-8 sm:p-12 shadow-[0_12px_45px_rgba(0,0,0,0.4)] border border-stone-850/80 mb-12 text-center flex flex-col items-center">
    <span class="text-[10px] uppercase tracking-[0.25em] text-[#C7A873] font-bold mb-4">Lugar del Evento</span>
    <h3 class="text-xl sm:text-2xl font-semibold text-[#FAF8F5] mb-2" style="font-family: '{{fontTitle}}', serif;">
      {{locationName}}
    </h3>
    <p class="text-xs text-stone-400 font-normal leading-relaxed max-w-xs mb-8">
      {{locationAddress}}
    </p>
    
    <div class="w-full border-t border-stone-800 pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
      <div class="w-full sm:w-auto">
        {{maps}}
      </div>
      <div class="w-full sm:w-auto">
        {{waze}}
      </div>
    </div>
  </div>

  <!-- Schedule / Timeline -->
  <div class="w-full max-w-xl mb-12">
    {{schedule}}
  </div>

  <!-- Dress Code Section -->
  <div class="w-full max-w-xl mb-12">
    {{dressCode}}
  </div>

  <!-- Video Section -->
  <div class="w-full max-w-xl mb-12">
    {{video}}
  </div>

  <!-- Gallery Section -->
  <div class="w-full max-w-xl mb-12">
    {{gallery}}
  </div>

</div>`
};

export const EDITORIAL_OLIVE_TEMPLATE: CustomTemplate = {
  id: 'editorial-olive-v1',
  name: 'Editorial Olive v1.0',
  description: 'Inspirada en la Toscana, los viñedos italianos y villas mediterráneas antiguas. Un diseño de lujo orgánico en tonos verde oliva, marfil cálido, lino y dorado envejecido.',
  category: 'matrimonio',
  fontTitle: 'Cormorant Garamond',
  fontBody: 'Inter',
  createdAt: '2026-06-25T18:30:00Z',
  config: {
    name: 'Editorial Olive v1.0',
    category: 'Matrimonio',
    author: 'Tarjeta Familiar',
    version: '1.0',
    date: '2026-06-25',
    description: 'Inspirada en la Toscana, los viñedos italianos y villas mediterráneas antiguas. Un diseño de lujo orgánico en tonos verde oliva, marfil cálido, lino y dorado envejecido.',
    tags: ['Premium', 'Editorial', 'Olive', 'Boda', 'Viñedos', 'Mediterranean'],
    variablesUsed: [
      'title',
      'hostName',
      'date',
      'time',
      'locationName',
      'locationAddress',
      'description',
      'imageUrl',
      'whatsappContact',
      'fontTitle',
      'fontBody',
      'countdown',
      'spotify',
      'schedule',
      'dressCode',
      'gallery',
      'video',
      'maps',
      'waze',
      'giftLink',
      'confirmationDeadline'
    ],
    fontTitle: 'Cormorant Garamond',
    fontBody: 'Inter',
    status: 'Publicado'
  },
  htmlContent: `<!-- Editorial Olive v1.0 - Editorial Collection - Premium Mediterranean Olive -->
<div class="w-full min-h-screen bg-[#F7F4EF] text-[#3D3A35] py-12 px-4 sm:px-8 font-sans flex flex-col items-center selection:bg-[#8D9982]/30" style="font-family: '{{fontBody}}', sans-serif;">
  
  <!-- Cover Card -->
  <div class="w-full max-w-xl bg-white rounded-[40px] overflow-hidden shadow-[0_12px_35px_rgba(141,153,130,0.08)] border border-[#E6E1D8] mb-12 transition-all duration-500 hover:shadow-[0_18px_45px_rgba(141,153,130,0.12)]">
    <!-- Cover Image -->
    <div class="relative w-full aspect-[4/5] overflow-hidden">
      <img src="{{imageUrl}}" class="w-full h-full object-cover transition-transform duration-[3000ms] ease-out hover:scale-[1.03]" alt="Cover" />
      <div class="absolute inset-4 border border-[#8D9982]/20 pointer-events-none rounded-[28px]"></div>
      <div class="absolute top-8 right-8 bg-[#FAF8F5]/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#E6E1D8] text-[9px] uppercase tracking-[0.25em] text-[#5C6454] font-extrabold shadow-3xs">
        COLECCIÓN EDITORIAL
      </div>
      
      <!-- Overlay Title & Hosts on Image for Cinematic Hero Feel -->
      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2C2B28]/95 via-[#2C2B28]/30 to-transparent p-8 sm:p-10 flex flex-col justify-end text-center">
        <h1 class="text-2xl sm:text-3xl text-white leading-tight tracking-tight mb-2" style="font-family: '{{fontTitle}}', serif;">
          {{title}}
        </h1>
        <p class="text-[40px] sm:text-[48px] text-[#C0B293] leading-none select-none font-normal py-1" style="font-family: 'Great Vibes', 'Alex Brush', 'Pinyon Script', cursive;">
          {{hostName}}
        </p>
      </div>
    </div>
    
    <!-- Hero Details (Under image, styled minimally) -->
    <div class="p-8 sm:p-10 text-center flex flex-col items-center">
      <div class="grid grid-cols-2 gap-4 w-full border-t border-b border-[#E6E1D8] py-4 text-center">
        <div>
          <p class="text-[9px] uppercase tracking-[0.2em] text-[#8C867A] font-bold">Fecha</p>
          <p class="text-sm font-bold text-[#3D3A35] mt-1">{{date}}</p>
        </div>
        <div class="border-l border-[#E6E1D8]">
          <p class="text-[9px] uppercase tracking-[0.2em] text-[#8C867A] font-bold">Horario</p>
          <p class="text-sm font-bold text-[#3D3A35] mt-1">{{time}} Hrs</p>
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center animate-pulse">
        <p class="text-[9px] uppercase tracking-[0.3em] text-[#8C867A] font-bold">Desliza para descubrir</p>
        <span class="text-[#8D9982] mt-2 text-sm">↓</span>
      </div>
    </div>
  </div>

  <!-- Editorial Story Card -->
  <div class="w-full max-w-xl bg-white rounded-[40px] p-8 sm:p-12 shadow-[0_12px_35px_rgba(141,153,130,0.06)] border border-[#E6E1D8] mb-12 text-center flex flex-col items-center">
    <div class="flex items-center gap-1.5 mb-4 text-[#8D9982]">
      <span class="w-2 h-2 rounded-full bg-[#8D9982]/60 animate-pulse"></span>
      <span class="text-[9px] uppercase tracking-[0.2em] font-extrabold text-[#5C6454]">NUESTRA HISTORIA</span>
    </div>
    <span class="text-3xl text-[#8D9982] mb-2 font-serif">“</span>
    <p class="text-sm sm:text-base leading-relaxed text-[#5A564E] font-light max-w-md italic" style="font-family: '{{fontTitle}}', serif; font-size: 1.2rem;">
      {{description}}
    </p>
    <span class="text-3xl text-[#8D9982] mt-2 font-serif">”</span>
  </div>

  <!-- Countdown Block -->
  <div class="w-full max-w-xl mb-12">
    {{countdown}}
  </div>

  <!-- Confirmation Deadline Banner -->
  <div class="w-full max-w-xl mb-12">
    {{confirmationDeadline}}
  </div>

  <!-- Location details -->
  <div class="w-full max-w-xl bg-[#FAF8F5] rounded-[40px] p-8 sm:p-12 shadow-[0_12px_35px_rgba(141,153,130,0.06)] border border-[#E6E1D8] mb-12 text-center flex flex-col items-center">
    <span class="text-[10px] uppercase tracking-[0.25em] text-[#8D9982] font-bold mb-4">Lugar del Evento</span>
    <h3 class="text-xl sm:text-2xl font-semibold text-[#3D3A35] mb-2" style="font-family: '{{fontTitle}}', serif;">
      {{locationName}}
    </h3>
    <p class="text-xs text-[#706B62] font-normal leading-relaxed max-w-xs mb-8">
      {{locationAddress}}
    </p>
    
    <div class="w-full border-t border-[#E6E1D8] pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
      <div class="w-full sm:w-auto">
        {{maps}}
      </div>
      <div class="w-full sm:w-auto">
        {{waze}}
      </div>
    </div>
  </div>

  <!-- Schedule / Timeline -->
  <div class="w-full max-w-xl mb-12">
    {{schedule}}
  </div>

  <!-- Dress Code Section -->
  <div class="w-full max-w-xl mb-12">
    {{dressCode}}
  </div>

  <!-- Video Section -->
  <div class="w-full max-w-xl mb-12">
    {{video}}
  </div>

  <!-- Gallery Section -->
  <div class="w-full max-w-xl mb-12">
    {{gallery}}
  </div>

</div>`
};

export const EDITORIAL_V2_PREMIUM_TEMPLATE: CustomTemplate = {
  id: 'editorial-v2-premium',
  name: 'Editorial Luxury Gold V2',
  description: 'Plantilla de gala de alta fidelidad potenciada por el Motor Editorial Premium V2. Diseñada con espaciado del número áureo, animaciones sutiles de Motion y elegantes módulos de gala en dorado y marfil.',
  category: 'matrimonio',
  fontTitle: 'Cinzel',
  fontBody: 'Inter',
  createdAt: '2026-06-26T00:00:00Z',
  engine: 'v2',
  config: {
    name: 'Editorial Luxury Gold V2',
    category: 'Matrimonio',
    author: 'Tarjeta Familiar',
    version: '2.0',
    date: '2026-06-26',
    description: 'Plantilla de gala de alta fidelidad potenciada por el Motor Editorial Premium V2. Diseñada con espaciado del número áureo, animaciones sutiles de Motion y elegantes módulos de gala en dorado y marfil.',
    tags: ['Premium', 'Editorial', 'Gold', 'V2 Engine', 'High Fidelity'],
    variablesUsed: [
      'title',
      'hostName',
      'date',
      'time',
      'locationName',
      'locationAddress',
      'description',
      'imageUrl',
      'countdown',
      'schedule',
      'dressCode',
      'gallery',
      'video',
      'maps',
      'waze',
      'confirmationDeadline'
    ],
    fontTitle: 'Cinzel',
    fontBody: 'Inter',
    status: 'Publicado',
    engine: 'v2'
  },
  htmlContent: `<!-- Template Gold Premium - Powered by Editorial Engine V2 -->
<hero-luxury title="{{title}}" subtitle="{{hostName}}" image="{{imageUrl}}" date="{{date}}" time="{{time}}"></hero-luxury>

<divider-gold></divider-gold>

<luxury-card>
  <editorial-subtitle text="Nuestra Historia de Amor"></editorial-subtitle>
  <divider-minimal></divider-minimal>
  <story-paragraph text="{{description}}"></story-paragraph>
</luxury-card>

<divider-luxury></divider-luxury>

<section-countdown></section-countdown>

<divider-minimal></divider-minimal>

<section-ceremony></section-ceremony>

<divider-geometric></divider-geometric>

<section-reception></section-reception>

<divider-gold></divider-gold>

<luxury-card>
  <editorial-subtitle text="Cronograma del Día Soñado"></editorial-subtitle>
  <timeline-luxury></timeline-luxury>
</luxury-card>

<divider-luxury></divider-luxury>

<section-dresscode></section-dresscode>

<divider-minimal></divider-minimal>

<section-gallery></section-gallery>

<divider-gold></divider-gold>

<section-video></section-video>

<divider-modern></divider-modern>

<section-gifts></section-gifts>

<divider-luxury></divider-luxury>

<section-rsvp></section-rsvp>

<section-footer></section-footer>`
};

export const EDITORIAL_V2_OLIVE_TEMPLATE: CustomTemplate = {
  id: 'editorial-v2-olive',
  name: 'Editorial Tuscany Olive V2',
  description: 'Inspirada en villas toscanas y olivares europeos. Potenciada por el Motor Editorial V2 con fondos estilo lino (linen) y un diseño extremadamente limpio de ritmo asimétrico.',
  category: 'matrimonio',
  fontTitle: 'Cormorant Garamond',
  fontBody: 'Inter',
  createdAt: '2026-06-26T00:30:00Z',
  engine: 'v2',
  config: {
    name: 'Editorial Tuscany Olive V2',
    category: 'Matrimonio',
    author: 'Tarjeta Familiar',
    version: '2.0',
    date: '2026-06-26',
    description: 'Inspirada en villas toscanas y olivares europeos. Potenciada por el Motor Editorial V2 con fondos estilo lino (linen) y un diseño extremadamente limpio de ritmo asimétrico.',
    tags: ['Premium', 'Editorial', 'Olive', 'Toscana', 'V2 Engine'],
    variablesUsed: [
      'title',
      'hostName',
      'date',
      'time',
      'locationName',
      'locationAddress',
      'description',
      'imageUrl',
      'countdown',
      'schedule',
      'dressCode',
      'gallery',
      'video',
      'maps',
      'waze',
      'confirmationDeadline'
    ],
    fontTitle: 'Cormorant Garamond',
    fontBody: 'Inter',
    status: 'Publicado',
    engine: 'v2'
  },
  htmlContent: `<!-- Template Tuscany Olive Premium - Powered by Editorial Engine V2 -->
<hero-editorial title="{{title}}" subtitle="{{hostName}}" image="{{imageUrl}}" date="{{date}}" time="{{time}}" description="{{description}}"></hero-editorial>

<divider-olive></divider-olive>

<editorial-card>
  <editorial-subtitle text="Bienvenidos a la Celebración"></editorial-subtitle>
  <story-paragraph text="Querida familia y amigos, nos llena de felicidad invitarlos a compartir un día mágico lleno de risas, amor y buenos deseos en un entorno natural y soñado."></story-paragraph>
</editorial-card>

<divider-minimal></divider-minimal>

<section-countdown></section-countdown>

<divider-floral></divider-floral>

<section-ceremony></section-ceremony>

<divider-minimal></divider-minimal>

<section-reception></section-reception>

<divider-olive></divider-olive>

<section-schedule></section-schedule>

<divider-vintage></divider-vintage>

<section-dresscode></section-dresscode>

<divider-minimal></divider-minimal>

<section-gallery></section-gallery>

<divider-olive></divider-olive>

<section-gifts></section-gifts>

<divider-modern></divider-modern>

<section-rsvp></section-rsvp>

<section-footer></section-footer>`
};

export const EDITORIAL_PASSPORT_TEMPLATE: CustomTemplate = {
  id: 'editorial-passport-v1',
  name: 'Experiencia Pasaporte Premium ✈️',
  description: 'Inspirada en pases de abordar de lujo de Emirates y pasaportes diplomáticos. Una experiencia inmersiva con apertura en 3D, animación de transición de fotografía y dashboard interactivo.',
  category: 'cumpleanos',
  fontTitle: 'Cinzel',
  fontBody: 'Inter',
  createdAt: '2026-06-27T12:00:00Z',
  engine: 'v3',
  config: {
    name: 'Experiencia Pasaporte Premium ✈️',
    category: 'Cumpleaños',
    author: 'Tarjeta Familiar',
    version: '1.0',
    date: '2026-06-27',
    description: 'Inspirada en pases de abordar de lujo de Emirates y pasaportes diplomáticos. Una experiencia inmersiva con apertura en 3D, animación de transición de fotografía y dashboard interactivo.',
    tags: ['Premium', 'Pasaporte', 'Interactiva', 'Emirates', 'Cumpleaños'],
    variablesUsed: [
      'title',
      'hostName',
      'date',
      'time',
      'locationName',
      'locationAddress',
      'description',
      'imageUrl',
      'countdown',
      'gallery',
      'maps',
      'waze',
      'confirmationDeadline'
    ],
    fontTitle: 'Cinzel',
    fontBody: 'Inter',
    status: 'Publicado',
    engine: 'v3'
  },
  htmlContent: `<!-- Template Passport Experience Premium -->
<div class="passport-experience-placeholder">PASSPORT EXPERIMENTAL VIEW</div>`
};


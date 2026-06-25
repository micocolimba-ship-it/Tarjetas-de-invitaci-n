import React from 'react';
import { Calendar, MapPin, MessageSquare, Heart } from 'lucide-react';
import { EventData, TemplateStyle, CustomTemplate } from '../types';
import { TEMPLATE_STYLES, EVENT_TYPES_METADATA } from '../data/templates';
import InvitationExperience from './InvitationExperience';

interface InvitationPreviewProps {
  event: EventData;
  imageUrl: string;
  isMobileSize?: boolean;
  customTemplates?: CustomTemplate[];
}

export default function InvitationPreview({ 
  event, 
  imageUrl, 
  isMobileSize = false,
  customTemplates = []
}: InvitationPreviewProps) {
  const customTemplate = customTemplates.find(t => t.id === event.style);

  if (customTemplate) {
    const formattedDate = new Date(event.date + 'T00:00:00').toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });

    let parsedHtml = customTemplate.htmlContent;
    
    // Calculate live countdown details
    const eventDateMs = new Date((event.date || '2026-12-31') + 'T' + (event.time || '19:30') + ':00').getTime();
    const nowMs = Date.now();
    const diffMs = eventDateMs - nowMs;
    let days = 12, hours = 14, minutes = 45, seconds = 30;
    if (diffMs > 0) {
      days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    }

    // Extended Widgets Definitions
    const widgetCountdown = `
      <div class="my-6 p-5 sm:p-6 bg-stone-50 border border-stone-200/80 rounded-3xl text-center max-w-md mx-auto shadow-sm">
        <p class="text-[10px] tracking-widest uppercase text-stone-500 font-extrabold mb-3 flex items-center justify-center gap-1">⏱️ CUENTA REGRESIVA</p>
        <div class="grid grid-cols-4 gap-2 text-stone-800">
          <div class="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-100 flex flex-col items-center shadow-2xs">
            <span class="text-xl sm:text-2xl font-black text-stone-850">${days}</span>
            <span class="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Días</span>
          </div>
          <div class="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-100 flex flex-col items-center shadow-2xs">
            <span class="text-xl sm:text-2xl font-black text-stone-850">${hours}</span>
            <span class="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Hrs</span>
          </div>
          <div class="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-100 flex flex-col items-center shadow-2xs">
            <span class="text-xl sm:text-2xl font-black text-stone-850">${minutes}</span>
            <span class="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Min</span>
          </div>
          <div class="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-100 flex flex-col items-center shadow-2xs">
            <span class="text-xl sm:text-2xl font-black text-stone-850">${seconds}</span>
            <span class="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Seg</span>
          </div>
        </div>
      </div>
    `;

    const widgetSpotify = `
      <div class="my-6 p-4 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-3xl flex items-center gap-4 max-w-md mx-auto text-left shadow-2xs">
        <div class="w-12 h-12 bg-stone-950 rounded-2xl flex items-center justify-center text-xl shadow-md">🟢</div>
        <div class="flex-1 min-w-0">
          <p class="text-[10px] text-[#191414] font-extrabold uppercase tracking-widest">Sugerir Canción para la Fiesta</p>
          <h4 class="text-xs font-bold text-stone-800 truncate mt-0.5">Playlist de la Familia Lavin Arias</h4>
          <p class="text-[10px] text-stone-500 mt-0.5">Añade tus ritmos y canciones favoritas para bailar</p>
        </div>
        <a href="https://open.spotify.com" target="_blank" class="bg-[#1DB954] hover:bg-[#1ed760] text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1">
          <span>Abrir</span>
        </a>
      </div>
    `;

    const widgetGallery = `
      <div class="my-8">
        <p class="text-[10px] tracking-widest uppercase text-stone-500 font-extrabold text-center mb-4">📸 ÁLBUM DE FOTOS DEL RECUERDO</p>
        <div class="grid grid-cols-3 gap-2">
          <div class="rounded-2xl overflow-hidden aspect-square border border-stone-100 shadow-2xs">
            <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=300" class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
          </div>
          <div class="rounded-2xl overflow-hidden aspect-square border border-stone-100 shadow-2xs">
            <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=300" class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
          </div>
          <div class="rounded-2xl overflow-hidden aspect-square border border-stone-100 shadow-2xs">
            <img src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=300" class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </div>
    `;

    const widgetVideo = `
      <div class="my-6 rounded-3xl overflow-hidden shadow-lg aspect-video border border-stone-200 bg-stone-100 relative group flex items-center justify-center">
        <img src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800" class="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div class="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/35 transition-all"></div>
        <div class="relative z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center text-stone-950 shadow-lg group-hover:scale-110 transition-transform duration-300 cursor-pointer">
          <span class="text-xs ml-0.5">▶</span>
        </div>
      </div>
    `;

    const widgetGiftLink = `
      <div class="my-6 p-6 border border-stone-200/80 rounded-3xl bg-stone-50/50 text-center max-w-md mx-auto shadow-xs">
        <span class="text-2xl">🎁</span>
        <h4 class="text-xs font-extrabold text-stone-850 uppercase tracking-wider mt-2">Apoyo Voluntario al Proyecto</h4>
        <p class="text-[10px] text-stone-500 mt-1.5 leading-relaxed">
          Tu afecto y compañía son nuestra mayor bendición, pero si deseas hacernos una donación o regalo, puedes presionar el botón de abajo.
        </p>
        <button class="mt-4 bg-stone-900 hover:bg-stone-850 text-white text-[10px] font-black px-4.5 py-2.5 rounded-full uppercase tracking-wider transition-colors shadow-2xs">
          Hacer Donación / Aporte
        </button>
      </div>
    `;

    const widgetMaps = `
      <a href="https://maps.google.com" target="_blank" class="my-2 inline-flex items-center gap-2 bg-[#4285F4] hover:bg-[#357ae8] text-white text-[10px] font-extrabold px-4.5 py-2.5 rounded-full transition-all shadow-2xs tracking-wider uppercase">
        📍 Abrir en Google Maps
      </a>
    `;

    const widgetWaze = `
      <a href="https://waze.com" target="_blank" class="my-2 inline-flex items-center gap-2 bg-[#33CCFF] hover:bg-[#2bbfe6] text-stone-900 text-[10px] font-extrabold px-4.5 py-2.5 rounded-full transition-all shadow-2xs tracking-wider uppercase">
        🚗 Navegar con Waze
      </a>
    `;

    const widgetQrCode = `
      <div class="my-6 p-4 bg-white border border-stone-200/50 rounded-3xl flex flex-col items-center justify-center max-w-[180px] mx-auto text-center shadow-xs">
        <div class="w-28 h-28 bg-stone-50 border border-stone-150 rounded-2xl flex items-center justify-center relative overflow-hidden">
          <div class="grid grid-cols-5 gap-1 p-2 w-full h-full opacity-70">
            <div class="bg-stone-900 rounded-sm"></div><div class="bg-stone-900 rounded-sm"></div><div></div><div class="bg-stone-900 rounded-sm"></div><div class="bg-stone-900 rounded-sm"></div>
            <div></div><div class="bg-stone-900 rounded-sm"></div><div class="bg-stone-900 rounded-sm"></div><div></div><div></div>
            <div class="bg-stone-900 rounded-sm"></div><div></div><div class="bg-stone-900 rounded-sm"></div><div class="bg-stone-900 rounded-sm"></div><div class="bg-stone-900 rounded-sm"></div>
            <div></div><div class="bg-stone-900 rounded-sm"></div><div></div><div class="bg-stone-900 rounded-sm"></div><div></div>
            <div class="bg-stone-900 rounded-sm"></div><div class="bg-stone-900 rounded-sm"></div><div></div><div></div><div class="bg-stone-900 rounded-sm"></div>
          </div>
          <span class="absolute inset-0 flex items-center justify-center bg-white border border-stone-100 rounded-xl p-1.5 w-7 h-7 font-extrabold text-[10px]">✨</span>
        </div>
        <p class="text-[8px] text-stone-400 font-bold uppercase tracking-wider mt-2">Escanear para Confirmar</p>
      </div>
    `;

    const widgetDressCode = `
      <div class="my-6 p-5 border border-stone-200/60 rounded-3xl bg-white max-w-sm mx-auto text-center shadow-2xs">
        <span class="text-2xl">🤵👗</span>
        <h4 class="text-xs font-black text-stone-800 uppercase tracking-wider mt-2">Código de Vestimenta</h4>
        <p class="text-xs text-stone-700 mt-1 font-bold">Formal / Elegante</p>
        <p class="text-[10px] text-stone-400 mt-1 leading-relaxed">Te sugerimos traje formal para caballeros y vestido de fiesta para damas.</p>
      </div>
    `;

    const widgetHotel = `
      <div class="my-6 text-left max-w-sm mx-auto p-4.5 bg-stone-50 border border-stone-200/60 rounded-3xl">
        <h4 class="text-[10px] font-black uppercase text-stone-500 tracking-wider flex items-center gap-1 mb-2">🏨 RECOMENDACIONES DE HOSPEDAJE</h4>
        <ul class="flex flex-col gap-2 text-[10px] text-stone-600 font-semibold">
          <li class="p-2 bg-white border border-stone-100 rounded-xl shadow-3xs">
            <strong class="text-stone-800 font-bold">Hotel Real San Martín</strong>
            <p class="text-[9px] text-stone-400 font-medium mt-0.5">Ubicado a 5 minutos del salón del evento.</p>
          </li>
          <li class="p-2 bg-white border border-stone-100 rounded-xl shadow-3xs">
            <strong class="text-stone-800 font-bold">Estancia Suites del Sol</strong>
            <p class="text-[9px] text-stone-400 font-medium mt-0.5">Descuento exclusivo mencionando el evento.</p>
          </li>
        </ul>
      </div>
    `;

    const widgetSchedule = `
      <div class="my-8 text-left max-w-sm mx-auto p-5 bg-white border border-stone-200/60 rounded-3xl shadow-2xs">
        <h4 class="text-[10px] font-black uppercase text-stone-500 tracking-widest text-center mb-4">📅 CRONOGRAMA DEL EVENTO</h4>
        <div class="flex flex-col gap-4 relative before:absolute before:left-2 before:top-1 before:bottom-1 before:w-[1px] before:bg-stone-200">
          <div class="flex gap-3 pl-6 relative">
            <span class="absolute left-0.5 top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-2xs"></span>
            <div>
              <strong class="text-xs text-stone-850 font-extrabold">19:30 - Cóctel de Recepción</strong>
              <p class="text-[10px] text-stone-400 mt-0.5 font-medium leading-relaxed">Llegada de invitados y brindis inicial.</p>
            </div>
          </div>
          <div class="flex gap-3 pl-6 relative">
            <span class="absolute left-0.5 top-1.5 w-3 h-3 rounded-full bg-stone-300 border-2 border-white shadow-2xs"></span>
            <div>
              <strong class="text-xs text-stone-850 font-extrabold">20:30 - Ceremonia Central</strong>
              <p class="text-[10px] text-stone-400 mt-0.5 font-medium leading-relaxed">Momento simbólico de celebración.</p>
            </div>
          </div>
          <div class="flex gap-3 pl-6 relative">
            <span class="absolute left-0.5 top-1.5 w-3 h-3 rounded-full bg-stone-300 border-2 border-white shadow-2xs"></span>
            <div>
              <strong class="text-xs text-stone-850 font-extrabold">22:00 - Banquete y Fiesta</strong>
              <p class="text-[10px] text-stone-400 mt-0.5 font-medium leading-relaxed">Cena, baile y sorpresas de la noche.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    const widgetMenu = `
      <div class="my-6 p-4 bg-stone-50 border border-stone-150 rounded-3xl max-w-sm mx-auto text-center">
        <span class="text-xl">🍽️</span>
        <h4 class="text-xs font-black text-stone-850 uppercase tracking-wider mt-1.5">Banquete de Bodas</h4>
        <p class="text-[10px] text-stone-500 mt-1 leading-relaxed">Disfrutaremos de una magnífica cena con opción estándar de solomillo y alternativas vegetarianas.</p>
      </div>
    `;

    const widgetChildren = `
      <div class="my-4 p-3 bg-amber-50/50 border border-amber-200/40 rounded-2xl text-center max-w-sm mx-auto flex items-center gap-2 justify-center text-[10px] text-stone-700 font-bold">
        <span>👶</span>
        <span>Evento con área infantil y cuidadoras dedicadas.</span>
      </div>
    `;

    const widgetSocials = `
      <div class="my-6 flex items-center justify-center gap-3">
        <a href="https://instagram.com" target="_blank" class="w-9 h-9 rounded-full bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center text-xs shadow-2xs transition-transform hover:scale-105">📸</a>
        <a href="https://facebook.com" target="_blank" class="w-9 h-9 rounded-full bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center text-xs shadow-2xs transition-transform hover:scale-105">👥</a>
      </div>
    `;

    const widgetContactDetails = `
      <div class="text-center my-4 py-2 border-t border-stone-200/50">
        <p class="text-[10px] text-stone-400 tracking-wider font-bold">📧 contacto@lavinarias.cl | 🌐 www.lavinarias.cl</p>
      </div>
    `;

    const widgetDeadline = `
      <div class="my-4 p-3.5 bg-rose-50 border border-rose-150 rounded-2xl text-center max-w-sm mx-auto text-[10px] text-rose-700 font-black tracking-wide flex items-center justify-center gap-2 shadow-3xs">
        <span class="animate-pulse">⚠️</span>
        <span>POR FAVOR CONFIRMAR ASISTENCIA ANTES DEL 10 DE JULIO, 2026</span>
      </div>
    `;

    // Perform replacements
    parsedHtml = parsedHtml.replace(/\{\{title\}\}/g, event.title || '');
    parsedHtml = parsedHtml.replace(/\{\{hostName\}\}/g, event.hostName || '');
    parsedHtml = parsedHtml.replace(/\{\{date\}\}/g, formattedDate || '');
    parsedHtml = parsedHtml.replace(/\{\{time\}\}/g, event.time || '');
    parsedHtml = parsedHtml.replace(/\{\{locationName\}\}/g, event.locationName || '');
    parsedHtml = parsedHtml.replace(/\{\{locationAddress\}\}/g, event.locationAddress || '');
    parsedHtml = parsedHtml.replace(/\{\{description\}\}/g, (event.description || '').replace(/\n/g, '<br />'));
    parsedHtml = parsedHtml.replace(/\{\{imageUrl\}\}/g, imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200');
    parsedHtml = parsedHtml.replace(/\{\{whatsappContact\}\}/g, event.whatsappContact || '');
    parsedHtml = parsedHtml.replace(/\{\{fontTitle\}\}/g, customTemplate.fontTitle);
    parsedHtml = parsedHtml.replace(/\{\{fontBody\}\}/g, customTemplate.fontBody);

    // Extended placeholders replacement
    parsedHtml = parsedHtml.replace(/\{\{countdown\}\}/g, widgetCountdown);
    parsedHtml = parsedHtml.replace(/\{\{spotify\}\}/g, widgetSpotify);
    parsedHtml = parsedHtml.replace(/\{\{gallery\}\}/g, widgetGallery);
    parsedHtml = parsedHtml.replace(/\{\{video\}\}/g, widgetVideo);
    parsedHtml = parsedHtml.replace(/\{\{giftLink\}\}/g, widgetGiftLink);
    parsedHtml = parsedHtml.replace(/\{\{maps\}\}/g, widgetMaps);
    parsedHtml = parsedHtml.replace(/\{\{waze\}\}/g, widgetWaze);
    parsedHtml = parsedHtml.replace(/\{\{qrCode\}\}/g, widgetQrCode);
    parsedHtml = parsedHtml.replace(/\{\{dressCode\}\}/g, widgetDressCode);
    parsedHtml = parsedHtml.replace(/\{\{hotel\}\}/g, widgetHotel);
    parsedHtml = parsedHtml.replace(/\{\{schedule\}\}/g, widgetSchedule);
    parsedHtml = parsedHtml.replace(/\{\{menu\}\}/g, widgetMenu);
    parsedHtml = parsedHtml.replace(/\{\{children\}\}/g, widgetChildren);
    parsedHtml = parsedHtml.replace(/\{\{instagram\}\}/g, widgetSocials);
    parsedHtml = parsedHtml.replace(/\{\{facebook\}\}/g, ''); // Combined in Instagram placeholder
    parsedHtml = parsedHtml.replace(/\{\{email\}\}/g, widgetContactDetails);
    parsedHtml = parsedHtml.replace(/\{\{website\}\}/g, ''); // Combined in Email placeholder
    parsedHtml = parsedHtml.replace(/\{\{confirmationDeadline\}\}/g, widgetDeadline);
    parsedHtml = parsedHtml.replace(/\{\{eventType\}\}/g, (event.type || '').toUpperCase());
    parsedHtml = parsedHtml.replace(/\{\{theme\}\}/g, `<span class="text-[9px] bg-stone-100 border border-stone-200 px-2 py-1 rounded-full font-bold text-stone-500 uppercase tracking-widest">Tema del Evento</span>`);

    return (
      <InvitationExperience
        event={event}
        imageUrl={imageUrl}
        isMobileSize={isMobileSize}
        customTemplates={customTemplates}
      >
        <div 
          id={`invitation-preview-${event.id}`}
          className={`w-full relative overflow-hidden transition-all duration-500 flex flex-col justify-center items-center bg-stone-50 ${
            isMobileSize ? 'p-3 sm:p-5 min-h-[500px]' : 'p-6 sm:p-12 min-h-[600px]'
          }`}
          style={{ fontFamily: `'${customTemplate.fontBody}', sans-serif` }}
        >
          <div 
            className="w-full max-w-2xl relative z-10 animate-fade-in"
            dangerouslySetInnerHTML={{ __html: parsedHtml }} 
          />
        </div>
      </InvitationExperience>
    );
  }

  const activeTemplate = TEMPLATE_STYLES[event.style as Exclude<TemplateStyle, string>] || TEMPLATE_STYLES.elegante;

  return (
    <InvitationExperience
      event={event}
      imageUrl={imageUrl}
      isMobileSize={isMobileSize}
      customTemplates={customTemplates}
    >
      <div 
        id={`invitation-preview-${event.id}`}
        className={`w-full relative overflow-hidden transition-all duration-500 flex flex-col justify-center items-center ${activeTemplate.bgClass} ${
          isMobileSize ? 'p-3 sm:p-5 min-h-[500px]' : 'p-6 sm:p-12 min-h-[600px]'
        }`}
      >
      {/* Decorative borders for Elegant Style */}
      {activeTemplate.decorations.hasBorders && (
        <div className={`absolute pointer-events-none rounded-2xl border ${
          isMobileSize ? 'inset-2 sm:inset-3' : 'inset-4 sm:inset-6'
        } border-stone-300/80`} />
      )}

      {/* Decorative Flowers for Romantic Style */}
      {activeTemplate.decorations.hasFlowers && (
        <div className={`absolute top-0 right-0 pointer-events-none select-none opacity-25 ${
          isMobileSize ? 'w-24 h-24' : 'w-44 h-44'
        }`}>
          <svg viewBox="0 0 100 100" fill="none" className="text-rose-400 fill-current">
            <path d="M50 0C60 30 100 50 100 50C100 50 60 70 50 100C40 70 0 50 0 50C0 50 40 30 50 0Z" />
          </svg>
        </div>
      )}

      {/* Decorative Leaves for Romantic / Rustic Style */}
      {activeTemplate.decorations.hasLeaves && (
        <div className={`absolute bottom-0 left-0 pointer-events-none select-none opacity-20 ${
          isMobileSize ? 'w-20 h-20' : 'w-36 h-36'
        }`}>
          <svg viewBox="0 0 100 100" fill="none" className="text-emerald-800 fill-current">
            <path d="M50 0C60 30 100 50 100 50C100 50 60 70 50 100C40 70 0 50 0 50C0 50 40 30 50 0Z" />
          </svg>
        </div>
      )}

      {/* Decorative Stars for Modern Style */}
      {activeTemplate.decorations.hasStars && (
        <div className="absolute inset-0 pointer-events-none select-none opacity-20 overflow-hidden">
          <div className="absolute top-8 left-12 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <div className="absolute top-20 right-16 w-3 h-3 rounded-full bg-teal-300 animate-pulse" />
          <div className="absolute bottom-12 left-1/4 w-1.5 h-1.5 rounded-full bg-teal-200" />
          <div className="absolute bottom-24 right-1/3 w-2 h-2 rounded-full bg-teal-500 animate-ping" />
        </div>
      )}

      {/* Decorative Confetti for Festive Style */}
      {activeTemplate.decorations.hasConfetti && (
        <div className="absolute inset-0 pointer-events-none select-none opacity-30 overflow-hidden">
          <div className="absolute top-6 left-1/4 w-3 h-1.5 bg-amber-400 rotate-12 rounded-xs" />
          <div className="absolute top-12 right-12 w-2 h-4 bg-rose-400 -rotate-45 rounded-xs" />
          <div className="absolute top-24 left-10 w-2.5 h-2.5 bg-sky-400 rounded-full" />
          <div className="absolute bottom-16 right-1/4 w-3 h-1.5 bg-emerald-400 rotate-45 rounded-xs" />
          <div className="absolute bottom-8 left-12 w-4 h-1 bg-purple-400 -rotate-12" />
        </div>
      )}

      {/* Main Core layout Frame Card */}
      <div 
        id={`invitation-card-inner-${event.id}`}
        className={`w-full relative z-10 flex flex-col shadow-lg border border-stone-200/50 transition-all duration-300 ${
          isMobileSize 
            ? 'max-w-md bg-white/95 backdrop-blur-xs rounded-xl p-4 sm:p-5 gap-4 my-2 text-stone-800' 
            : 'max-w-2xl bg-white/95 backdrop-blur-xs rounded-2xl p-6 sm:p-12 gap-8 my-4 text-stone-800'
        } ${event.style === 'moderno' ? 'bg-slate-900/95 border-slate-800 text-slate-100' : ''}`}
      >
        {/* Category Header */}
        <div className="text-center flex flex-col items-center gap-1">
          <span className={`${isMobileSize ? 'text-2xl' : 'text-4xl'} filter drop-shadow-xs`}>
            {EVENT_TYPES_METADATA[event.type]?.emoji || '✨'}
          </span>
          <span className={`tracking-[0.25em] uppercase font-black ${activeTemplate.primaryColor} ${
            isMobileSize ? 'text-[9px]' : 'text-[11px]'
          }`}>
            {EVENT_TYPES_METADATA[event.type]?.name || 'Tarjeta de Invitación'}
          </span>
          <div className={`h-[1px] bg-stone-350/80 my-1 ${isMobileSize ? 'w-10' : 'w-16'}`} />
          
          <p className="text-[10px] text-stone-400 italic font-light">
            Invitación especial hecha por la familia de:
          </p>
          <p className={`font-bold tracking-wide ${isMobileSize ? 'text-xs text-stone-700' : 'text-sm text-stone-800'} ${
            event.style === 'moderno' ? 'text-slate-200' : ''
          }`}>
            {event.hostName}
          </p>
        </div>

        {/* High Quality Banner Cover */}
        <div className={`relative overflow-hidden shadow-xs border-y border-stone-100/50 ${
          isMobileSize 
            ? '-mx-4 sm:-mx-5 aspect-[18/9]' 
            : '-mx-6 sm:-mx-12 aspect-[21/9]'
        }`}>
          <img 
            src={imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200'} 
            alt="Event banner" 
            className="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Title of the event */}
        <div className="text-center px-1">
          <h2 className={`leading-tight font-extrabold tracking-tight ${activeTemplate.fontClassTitle} ${activeTemplate.primaryColor} ${
            isMobileSize ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
          }`}>
            {event.title}
          </h2>
        </div>

        {/* Parameters Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 border-y border-stone-200/50 py-4 my-1 ${
          event.style === 'moderno' ? 'border-slate-800' : ''
        }`}>
          {/* Date Details */}
          <div className="flex items-center gap-3 justify-center md:justify-start md:border-r border-stone-200/50 pr-2">
            <div className={`p-2 rounded-xl border border-stone-200/80 flex-shrink-0 ${
              event.style === 'moderno' ? 'bg-slate-950 border-slate-800' : 'bg-[#FAF8F5]'
            }`}>
              <Calendar className={`w-4 h-4 ${activeTemplate.primaryColor}`} />
            </div>
            <div className="text-left">
              <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-widest">Cuándo será</p>
              <p className={`text-xs font-bold ${event.style === 'moderno' ? 'text-slate-100' : 'text-stone-850'}`}>
                {new Date(event.date + 'T00:00:00').toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p className={`text-[10px] font-medium ${event.style === 'moderno' ? 'text-slate-350' : 'text-stone-500'}`}>A las {event.time} hrs</p>
            </div>
          </div>

          {/* Location Details */}
          <div className="flex items-center gap-3 justify-center md:justify-start md:pl-2">
            <div className={`p-2 rounded-xl border border-stone-200/80 flex-shrink-0 ${
              event.style === 'moderno' ? 'bg-slate-950 border-slate-800' : 'bg-[#FAF8F5]'
            }`}>
              <MapPin className={`w-4 h-4 ${activeTemplate.primaryColor}`} />
            </div>
            <div className="text-left min-w-0 max-w-full">
              <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-widest">Dónde será</p>
              <p className={`text-xs font-bold truncate ${event.style === 'moderno' ? 'text-slate-100' : 'text-stone-850'}`}>
                {event.locationName}
              </p>
              <p className={`text-[10px] truncate ${event.style === 'moderno' ? 'text-slate-350' : 'text-stone-500'}`}>
                {event.locationAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Narrative Body */}
        <div className="text-center px-2">
          <p className={`text-xs whitespace-pre-line leading-relaxed italic ${activeTemplate.fontClassBody} ${activeTemplate.textColor}`}>
            {event.description}
          </p>
        </div>

        {/* Quick WhatsApp contact */}
        {event.whatsappContact && (
          <div className="flex justify-center mt-1">
            <a 
              href={`https://wa.me/${event.whatsappContact.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-3xs hover:bg-emerald-100/80 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Consultas por WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  </InvitationExperience>
  );
}

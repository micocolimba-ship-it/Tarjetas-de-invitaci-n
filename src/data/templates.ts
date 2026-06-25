import { EventType, TemplateStyle, EventData, GuestRSVP, DonationConfig } from '../types';

export interface TemplateDefinition {
  id: TemplateStyle;
  name: string;
  description: string;
  bgClass: string;
  cardClass: string;
  fontClassTitle: string;
  fontClassBody: string;
  primaryColor: string;
  textColor: string;
  accentColor: string;
  decorations: {
    hasFlowers?: boolean;
    hasBorders?: boolean;
    hasConfetti?: boolean;
    hasStars?: boolean;
    hasLeaves?: boolean;
  };
}

export const TEMPLATE_STYLES: Record<TemplateStyle, TemplateDefinition> = {
  elegante: {
    id: 'elegante',
    name: 'Elegante y Sofisticado',
    description: 'Perfecto para matrimonios o cenas formales. Usa fuentes Serif refinadas y contrastes finos.',
    bgClass: 'bg-stone-100 pattern-isometric',
    cardClass: 'bg-white border border-stone-200/80 shadow-2xl rounded-sm p-8 sm:p-12 relative overflow-hidden',
    fontClassTitle: 'font-serif-elegant tracking-wide',
    fontClassBody: 'font-sans font-light',
    primaryColor: 'text-stone-800',
    textColor: 'text-stone-600',
    accentColor: 'border-stone-800',
    decorations: { hasBorders: true }
  },
  romantico: {
    id: 'romantico',
    name: 'Cálido y Romántico',
    description: 'Ideal para aniversarios, bodas campestres o compromisos. Colores suaves y caligrafía cursiva.',
    bgClass: 'bg-rose-50/50',
    cardClass: 'bg-white border border-rose-100 shadow-xl rounded-2xl p-8 sm:p-12 relative overflow-hidden',
    fontClassTitle: 'font-cursive-romance tracking-wider',
    fontClassBody: 'font-sans',
    primaryColor: 'text-rose-700',
    textColor: 'text-stone-700',
    accentColor: 'border-rose-200',
    decorations: { hasFlowers: true, hasLeaves: true }
  },
  moderno: {
    id: 'moderno',
    name: 'Moderno y Minimalista',
    description: 'Estilo limpio, tipografía geométrica, excelente contraste y estética contemporánea.',
    bgClass: 'bg-slate-900',
    cardClass: 'bg-slate-950 border border-slate-800 shadow-2xl rounded-3xl p-8 sm:p-12 relative overflow-hidden text-slate-100',
    fontClassTitle: 'font-sans-tech uppercase tracking-widest font-bold',
    fontClassBody: 'font-sans font-light text-slate-300',
    primaryColor: 'text-teal-400',
    textColor: 'text-slate-300',
    accentColor: 'border-teal-500/30',
    decorations: { hasStars: true }
  },
  festivo: {
    id: 'festivo',
    name: 'Colorido y Festivo',
    description: 'Ideal para cumpleaños, baby showers y fiestas. Lleno de energía y dinamismo.',
    bgClass: 'bg-amber-50/30',
    cardClass: 'bg-white border-2 border-amber-100 shadow-xl rounded-2xl p-8 sm:p-12 relative overflow-hidden',
    fontClassTitle: 'font-sans-modern tracking-tight font-black',
    fontClassBody: 'font-sans',
    primaryColor: 'text-amber-600',
    textColor: 'text-slate-700',
    accentColor: 'border-amber-400',
    decorations: { hasConfetti: true, hasStars: true }
  },
  rustico: {
    id: 'rustico',
    name: 'Rústico y Orgánico',
    description: 'Estilo campestre, tonos tierra, perfecto para reuniones familiares o asados de fin de semana.',
    bgClass: 'bg-orange-50/20',
    cardClass: 'bg-amber-50/40 border border-orange-200/60 shadow-xl rounded-xl p-8 sm:p-12 relative overflow-hidden',
    fontClassTitle: 'font-serif-elegant font-bold italic text-amber-900',
    fontClassBody: 'font-sans text-amber-800',
    primaryColor: 'text-orange-800',
    textColor: 'text-amber-900/80',
    accentColor: 'border-orange-300',
    decorations: { hasLeaves: true }
  }
};

export const EVENT_TYPES_METADATA: Record<EventType, { name: string; emoji: string; suggestedStyle: TemplateStyle }> = {
  matrimonio: { name: 'Matrimonio / Boda', emoji: '💍', suggestedStyle: 'romantico' },
  cumpleanos: { name: 'Cumpleaños', emoji: '🎂', suggestedStyle: 'festivo' },
  fiesta: { name: 'Fiesta / Celebración', emoji: '🎉', suggestedStyle: 'festivo' },
  reunion: { name: 'Reunión Familiar', emoji: '🏡', suggestedStyle: 'rustico' },
  babyshower: { name: 'Baby Shower', emoji: '🍼', suggestedStyle: 'romantico' },
  bautizo: { name: 'Bautizo', emoji: '🕊️', suggestedStyle: 'elegante' },
  confirmacion: { name: 'Confirmación', emoji: '⛪', suggestedStyle: 'elegante' },
  otro: { name: 'Otro Evento Especial', emoji: '✨', suggestedStyle: 'moderno' }
};

// Initial Mock Data to bootstrap the Framework
export const INITIAL_EVENTS: EventData[] = [
  {
    id: 'ejemplo-matrimonio',
    type: 'matrimonio',
    style: 'romantico',
    title: 'Nuestra Boda Soñada',
    hostName: 'Hans & Chefie',
    date: '2026-11-28',
    time: '17:30',
    locationName: 'Centro de Eventos Las Palmas',
    locationAddress: 'Av. Vitacura 5400, Vitacura, Región Metropolitana, Chile',
    locationMapsUrl: 'https://maps.google.com',
    description: 'Querida familia, nos llena de felicidad invitarlos a celebrar nuestra unión matrimonial. Ha sido un camino hermoso y queremos compartir el inicio de esta nueva etapa con las personas que más amamos. \n\nVestimenta: Formal. \nRegalo: Lluvia de sobres o transferencia de apoyo en la plataforma.',
    whatsappContact: '+56912345678',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ejemplo-cumpleanos',
    type: 'cumpleanos',
    style: 'festivo',
    title: '¡Mis 30 Primaveras!',
    hostName: 'Chefie',
    date: '2026-08-15',
    time: '20:00',
    locationName: 'Terraza Familiar Hans & Chefie',
    locationAddress: 'La Reina, Santiago, Chile / Medellín, Colombia (Vía Zoom/Híbrido)',
    locationMapsUrl: 'https://maps.google.com',
    description: '¡Se viene el cambio de folio! Quiero celebrar un año más de vida compartiendo ricas comidas, buena música y anécdotas con mi familia chilena y colombiana. \n\n¡Los espero para cantar el cumpleaños feliz! No olviden confirmar su asistencia para preparar los bocadillos.',
    whatsappContact: '+573123456789',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_RSVPS: GuestRSVP[] = [
  {
    id: 'r1',
    eventId: 'ejemplo-matrimonio',
    guestName: 'Tía María Sol (Chile)',
    attending: true,
    companions: 2,
    comment: '¡No me lo perdería por nada del mundo! Llevo ensalada típica chilena.',
    confirmedAt: new Date().toISOString()
  },
  {
    id: 'r2',
    eventId: 'ejemplo-matrimonio',
    guestName: 'Primo Andrés (Colombia)',
    attending: true,
    companions: 1,
    comment: '¡Viajaré especialmente para el evento! Confirmado el pasaje. Un abrazo gigante a Hans y Chefie.',
    confirmedAt: new Date().toISOString()
  },
  {
    id: 'r3',
    eventId: 'ejemplo-matrimonio',
    guestName: 'Tío Roberto',
    attending: false,
    companions: 0,
    comment: 'Por motivos de salud no podré viajar, pero les enviaré un gran regalo de bodas y todas mis bendiciones.',
    confirmedAt: new Date().toISOString()
  },
  {
    id: 'r4',
    eventId: 'ejemplo-cumpleanos',
    guestName: 'Mamá Carmen',
    attending: true,
    companions: 0,
    comment: '¡Allí estaré en primera fila para abrazarte, mi niña hermosa!',
    confirmedAt: new Date().toISOString()
  }
];

export const DEFAULT_DONATION_CONFIG: DonationConfig = {
  chileAccounts: [
    {
      country: 'Chile',
      bankName: 'Banco de Chile',
      accountType: 'Cuenta Corriente',
      accountNumber: '98-76543-21',
      holderName: 'Hans Lavin',
      holderId: '12.345.678-K',
      holderEmail: 'hans@lavinarias.cl'
    },
    {
      country: 'Chile',
      bankName: 'Banco Estado',
      accountType: 'Cuenta RUT',
      accountNumber: '12345678',
      holderName: 'Hans Lavin',
      holderId: '12.345.678-K',
      holderEmail: 'hans@lavinarias.cl'
    }
  ],
  colombiaAccounts: [
    {
      country: 'Colombia',
      bankName: 'Bancolombia',
      accountType: 'Ahorros / Nequi',
      accountNumber: '3123456789',
      holderName: 'Chefie Arias',
      holderId: '1.020.304.050',
      holderEmail: 'chefie@lavinarias.co'
    },
    {
      country: 'Colombia',
      bankName: 'Davivienda / Daviplata',
      accountType: 'Daviplata',
      accountNumber: '3209876543',
      holderName: 'Chefie Arias',
      holderId: '1.020.304.050',
      holderEmail: 'chefie@lavinarias.co'
    }
  ],
  paypalUrl: 'https://paypal.me/lavinarias',
  mercadoPagoUrl: 'https://link.mercadopago.cl/lavinarias',
  qrCodeText: 'https://link.mercadopago.cl/lavinarias'
};

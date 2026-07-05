import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, MapPin, Clock, Music, Heart, ArrowRight, Compass, Info, Gift, 
  Check, AlertCircle, Sparkles, ChevronLeft, ChevronRight, Share2, Award, Mail 
} from 'lucide-react';
import { EventData, GuestRSVP } from '../types';

// ============================================================================
// TOKENS: PALETTES & FONTS & BACKGROUNDS
// ============================================================================

export type EditorialPaletteType = 
  | 'white' | 'black' | 'olive' | 'rose' | 'beige' 
  | 'navy' | 'emerald' | 'burgundy' | 'gold' | 'japandi';

export interface StyleTokens {
  bgClass: string;
  cardClass: string;
  textColor: string;
  secondaryTextColor: string;
  accentColor: string; // E.g., Gold, Olive, Rose
  buttonClass: string;
  dividerColor: string;
  fontTitle: string;
  fontBody: string;
}

export const PALETTES: Record<EditorialPaletteType, StyleTokens> = {
  white: {
    bgClass: 'bg-[#FAF8F5]',
    cardClass: 'bg-white border-[#E9E3DA] shadow-xs',
    textColor: 'text-[#2D2D2D]',
    secondaryTextColor: 'text-stone-500',
    accentColor: 'text-[#8C7A5F]',
    buttonClass: 'bg-[#8C7A5F] hover:bg-[#79684E] text-white',
    dividerColor: 'border-[#E9E3DA]',
    fontTitle: 'Cormorant Garamond',
    fontBody: 'Inter'
  },
  black: {
    bgClass: 'bg-[#111111]',
    cardClass: 'bg-[#161616] border-stone-800 shadow-md',
    textColor: 'text-[#FAF8F5]',
    secondaryTextColor: 'text-stone-400',
    accentColor: 'text-[#C7A873]',
    buttonClass: 'bg-[#FAF8F5] hover:bg-[#EBE9E5] text-[#111111]',
    dividerColor: 'border-stone-800',
    fontTitle: 'Cormorant Garamond',
    fontBody: 'Inter'
  },
  olive: {
    bgClass: 'bg-[#F7F4EF]',
    cardClass: 'bg-white border-[#E6E1D8] shadow-xs',
    textColor: 'text-[#3D3A35]',
    secondaryTextColor: 'text-[#706B62]',
    accentColor: 'text-[#8D9982]',
    buttonClass: 'bg-[#5C6454] hover:bg-[#717B67] text-white',
    dividerColor: 'border-[#E6E1D8]',
    fontTitle: 'Cormorant Garamond',
    fontBody: 'Inter'
  },
  rose: {
    bgClass: 'bg-[#FDF9F7]',
    cardClass: 'bg-white border-[#EADED9] shadow-2xs',
    textColor: 'text-[#4A3E3B]',
    secondaryTextColor: 'text-[#8C7671]',
    accentColor: 'text-[#D4A59A]',
    buttonClass: 'bg-[#B07D72] hover:bg-[#9E6C61] text-white',
    dividerColor: 'border-[#EADED9]',
    fontTitle: 'Playfair Display',
    fontBody: 'Inter'
  },
  beige: {
    bgClass: 'bg-[#FAF6F0]',
    cardClass: 'bg-white border-[#EDE5DA] shadow-3xs',
    textColor: 'text-[#3E3830]',
    secondaryTextColor: 'text-[#7D7061]',
    accentColor: 'text-[#C5A880]',
    buttonClass: 'bg-[#A28A68] hover:bg-[#8F795B] text-white',
    dividerColor: 'border-[#EDE5DA]',
    fontTitle: 'Cormorant Garamond',
    fontBody: 'Inter'
  },
  navy: {
    bgClass: 'bg-[#0F172A]',
    cardClass: 'bg-[#1E293B] border-slate-700 shadow-md',
    textColor: 'text-[#F8FAFC]',
    secondaryTextColor: 'text-slate-400',
    accentColor: 'text-[#E2E8F0]',
    buttonClass: 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-900',
    dividerColor: 'border-slate-700',
    fontTitle: 'Cinzel',
    fontBody: 'Inter'
  },
  emerald: {
    bgClass: 'bg-[#062F22]',
    cardClass: 'bg-[#0B3D2E] border-emerald-800 shadow-lg',
    textColor: 'text-[#FAF6F0]',
    secondaryTextColor: 'text-emerald-300/80',
    accentColor: 'text-[#E6C655]',
    buttonClass: 'bg-[#E6C655] hover:bg-[#D4B543] text-[#062F22]',
    dividerColor: 'border-emerald-800/60',
    fontTitle: 'Playfair Display',
    fontBody: 'Inter'
  },
  burgundy: {
    bgClass: 'bg-[#1F0A11]',
    cardClass: 'bg-[#2E141C] border-rose-900 shadow-lg',
    textColor: 'text-[#FAF5F6]',
    secondaryTextColor: 'text-rose-300/70',
    accentColor: 'text-[#D4AF37]',
    buttonClass: 'bg-[#D4AF37] hover:bg-[#C29E2E] text-white',
    dividerColor: 'border-rose-950',
    fontTitle: 'Cinzel',
    fontBody: 'Inter'
  },
  gold: {
    bgClass: 'bg-[#FAF8F2]',
    cardClass: 'bg-white border-[#EFE7D3] shadow-md',
    textColor: 'text-[#383327]',
    secondaryTextColor: 'text-[#736A55]',
    accentColor: 'text-[#D4AF37]',
    buttonClass: 'bg-[#D4AF37] hover:bg-[#BCA02E] text-white',
    dividerColor: 'border-[#EFE7D3]',
    fontTitle: 'Cormorant Garamond',
    fontBody: 'Inter'
  },
  japandi: {
    bgClass: 'bg-[#F4F1EC]',
    cardClass: 'bg-[#FAF8F5] border-[#E8E3DA] shadow-xs',
    textColor: 'text-[#2B2927]',
    secondaryTextColor: 'text-[#6B6560]',
    accentColor: 'text-[#A08F83]',
    buttonClass: 'bg-[#2B2927] hover:bg-[#403D3A] text-white',
    dividerColor: 'border-[#E8E3DA]',
    fontTitle: 'Italiana',
    fontBody: 'Inter'
  }
};

// ============================================================================
// BACKGROUND TEXTURES (11 styles)
// ============================================================================

export const BACKGROUND_STYLES: Record<string, string> = {
  paper: 'bg-[#FAF8F5] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]',
  linen: 'bg-[#F7F4EF] bg-[linear-gradient(rgba(141,153,130,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(141,153,130,0.03)_1px,transparent_1px)] [background-size:20px_20px]',
  canvas: 'bg-[#FAF8F5] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01)_0,rgba(0,0,0,0.04)_100%)]',
  stone: 'bg-[#EDE9E3] border border-stone-200/50',
  marble: 'bg-[#FAF9F6] bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.05),transparent_60%)]',
  cotton: 'bg-[#FDFDFD]',
  watercolor: 'bg-gradient-to-tr from-[#FAF5F2] via-[#F3EDEA] to-[#E9F0E8]',
  editorial: 'bg-[#FAF8F5] p-6 sm:p-12',
  cream: 'bg-[#FAF6EE]',
  dark: 'bg-[#111111] text-stone-100',
  default: 'bg-[#FAF8F5]'
};

// ============================================================================
// 1. HERO COMPONENTS (10 variants)
// ============================================================================

interface HeroProps {
  key?: any;
  title: string;
  subtitle: string;
  image: string;
  date: string;
  time: string;
  locationName?: string;
  description?: string;
}

export function HeroFullscreen({ title, subtitle, image, date, time }: HeroProps) {
  return (
    <div className="relative w-full h-[90vh] sm:h-[95vh] flex flex-col justify-between items-center text-center text-white overflow-hidden rounded-[32px] sm:rounded-[40px] mb-12 p-8">
      <div className="absolute inset-0 z-0">
        <img src={image} alt="Hero Fullscreen" className="w-full h-full object-cover scale-100 animate-pulse duration-[8000ms]" style={{ animationDuration: '8000ms' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 via-stone-900/20 to-stone-950/80" />
      </div>
      <div className="relative z-10 mt-12">
        <p className="text-[10px] uppercase tracking-[0.3em] font-extrabold text-[#C7A873] drop-shadow-sm">Invitación Exclusiva</p>
      </div>
      <div className="relative z-10 max-w-xl">
        <h1 className="text-4xl sm:text-6xl font-serif leading-tight drop-shadow-md mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{title}</h1>
        <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-stone-200 font-semibold drop-shadow-xs">{subtitle}</p>
      </div>
      <div className="relative z-10 w-full max-w-md border-t border-white/20 pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[8px] uppercase tracking-wider text-stone-300">Fecha</p>
            <p className="text-xs sm:text-sm font-bold text-white mt-1">{date}</p>
          </div>
          <div className="border-l border-white/20">
            <p className="text-[8px] uppercase tracking-wider text-stone-300">Horario</p>
            <p className="text-xs sm:text-sm font-bold text-white mt-1">{time} Hrs</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center animate-bounce">
          <span className="text-stone-300 text-sm font-light">↓</span>
        </div>
      </div>
    </div>
  );
}

export function HeroEditorial({ title, subtitle, image, date, time, description }: HeroProps) {
  return (
    <div className="w-full max-w-2xl bg-white border border-[#E6E1D8] rounded-[36px] overflow-hidden shadow-[0_12px_40px_rgba(141,153,130,0.06)] mb-12 p-6 sm:p-10 text-center flex flex-col items-center">
      <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#8D9982] mb-6">COLECCIÓN EDITORIAL</span>
      <div className="w-full aspect-[4/5] rounded-[24px] overflow-hidden mb-8 border border-stone-100 shadow-sm">
        <img src={image} alt="Hero Editorial" className="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-[2000ms]" />
      </div>
      <h1 className="text-3xl sm:text-5xl font-serif text-[#3D3A35] leading-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{title}</h1>
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C867A] font-bold mb-6">{subtitle}</p>
      {description && <p className="text-xs text-[#706B62] font-light leading-relaxed max-w-md mb-8 italic">"{description}"</p>}
      <div className="grid grid-cols-2 gap-6 w-full border-t border-b border-[#E6E1D8] py-4 text-center">
        <div>
          <p className="text-[9px] uppercase tracking-[0.15em] text-[#8C867A] font-bold">Fecha</p>
          <p className="text-xs font-bold text-[#3D3A35] mt-1">{date}</p>
        </div>
        <div className="border-l border-[#E6E1D8]">
          <p className="text-[9px] uppercase tracking-[0.15em] text-[#8C867A] font-bold">Horario</p>
          <p className="text-xs font-bold text-[#3D3A35] mt-1">{time} Hrs</p>
        </div>
      </div>
    </div>
  );
}

export function HeroCinematic({ title, subtitle, image, date, time }: HeroProps) {
  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-[32px] overflow-hidden mb-12 shadow-md">
      <img src={image} alt="Hero Cinematic" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-900/30 to-transparent p-6 sm:p-10 flex flex-col justify-end text-left text-white">
        <div className="max-w-xl">
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#C7A873] font-bold mb-2">Cinematic Preview</p>
          <h1 className="text-2xl sm:text-4xl font-serif leading-tight mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{title}</h1>
          <p className="text-[10px] uppercase tracking-widest text-stone-300 font-bold mb-4">{subtitle}</p>
          <p className="text-[10px] text-stone-400 font-mono tracking-wide">{date} • {time} Hrs</p>
        </div>
      </div>
    </div>
  );
}

export function HeroMagazine({ title, subtitle, image, date }: HeroProps) {
  return (
    <div className="w-full max-w-2xl bg-[#FAF8F5] border-2 border-stone-900/90 rounded-[24px] p-6 sm:p-8 mb-12 shadow-lg flex flex-col gap-6">
      <div className="flex justify-between items-center border-b-2 border-stone-900 pb-4">
        <span className="text-xs font-mono font-black uppercase tracking-[0.3em] text-stone-900">LA REVISTA DE BODAS</span>
        <span className="text-[9px] font-mono text-stone-500 font-bold">EDICIÓN Nº 28</span>
      </div>
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-stone-200">
        <img src={image} alt="Hero Magazine" className="w-full h-full object-cover" />
        <div className="absolute bottom-4 left-4 bg-stone-950/75 backdrop-blur-xs px-3 py-1.5 rounded text-[10px] text-white font-bold font-mono">
          NUEVO ENLACE • {date}
        </div>
      </div>
      <div className="text-center py-4">
        <h1 className="text-3xl sm:text-5xl font-serif text-stone-950 leading-none mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{title}</h1>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#8C7A5F] font-bold">{subtitle}</p>
      </div>
    </div>
  );
}

export function HeroSplit({ title, subtitle, image, date, time }: HeroProps) {
  return (
    <div className="w-full max-w-4xl bg-white border border-[#E9E3DA] rounded-[32px] overflow-hidden shadow-xs mb-12 grid grid-cols-1 md:grid-cols-2">
      <div className="relative w-full h-64 md:h-auto min-h-[300px] overflow-hidden">
        <img src={image} alt="Hero Split" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="p-8 sm:p-12 flex flex-col justify-center text-center md:text-left items-center md:items-start">
        <span className="text-[9px] uppercase tracking-[0.25em] text-[#8C7A5F] font-bold mb-4">Celebración Compartida</span>
        <h1 className="text-2xl sm:text-4xl font-serif text-stone-900 leading-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{title}</h1>
        <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-6">{subtitle}</p>
        <div className="w-16 h-[1px] bg-stone-200 my-4 md:self-start"></div>
        <p className="text-xs text-stone-600 leading-relaxed max-w-sm mb-6">Estamos felices de invitarlos a compartir este gran acontecimiento de nuestras vidas.</p>
        <div className="text-[11px] font-bold text-stone-800 tracking-wider font-mono">
          📅 {date} | ⏱️ {time} Hrs
        </div>
      </div>
    </div>
  );
}

export function HeroVertical({ title, subtitle, image, date }: HeroProps) {
  return (
    <div className="w-full max-w-xl bg-white border border-[#EBE5DA] rounded-[32px] p-6 sm:p-10 text-center mb-12 flex flex-col items-center">
      <span className="text-[9px] uppercase tracking-widest text-[#8C7A5F] font-bold mb-4">GUARDAR LA FECHA</span>
      <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{title}</h1>
      <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-6">{subtitle}</p>
      <div className="relative w-[85%] aspect-[3/4] rounded-2xl overflow-hidden mb-6 shadow-sm">
        <img src={image} alt="Hero Vertical" className="w-full h-full object-cover" />
        <div className="absolute inset-3 border border-white/20 rounded-xl pointer-events-none"></div>
      </div>
      <p className="text-xs font-mono tracking-widest text-[#8C7A5F] uppercase font-bold">{date}</p>
    </div>
  );
}

export function HeroMinimal({ title, subtitle, date, time }: HeroProps) {
  return (
    <div className="w-full max-w-xl bg-[#FAF8F5] border border-stone-200 rounded-[32px] p-8 sm:p-14 text-center mb-12 flex flex-col items-center gap-6 shadow-3xs">
      <div className="w-8 h-[1px] bg-stone-300"></div>
      <div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-2">INVITACIÓN DE HONOR</p>
        <h1 className="text-3xl sm:text-5xl font-serif text-stone-950 leading-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{title}</h1>
        <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold">{subtitle}</p>
      </div>
      <div className="w-16 h-[1px] bg-stone-300"></div>
      <div className="flex flex-col gap-1 text-[11px] text-stone-600 font-medium">
        <p>Fecha especial de celebración:</p>
        <p className="text-sm font-black text-stone-900 mt-1">{date} — {time} Hrs</p>
      </div>
    </div>
  );
}

export function HeroFloatingCard({ title, subtitle, image, date, time }: HeroProps) {
  return (
    <div className="relative w-full max-w-2xl aspect-[4/5] sm:aspect-square rounded-[36px] overflow-hidden mb-12 shadow-sm">
      <img src={image} alt="Hero Background" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-stone-950/15" />
      <div className="absolute bottom-6 inset-x-6 bg-white/95 backdrop-blur-xs border border-stone-200/50 rounded-3xl p-6 text-center shadow-lg animate-fade-in">
        <p className="text-[9px] uppercase tracking-[0.25em] text-[#8C7A5F] font-bold mb-2">Pase de Entrada Reservado</p>
        <h1 className="text-2xl sm:text-4xl font-serif text-stone-900 leading-tight mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{title}</h1>
        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-4">{subtitle}</p>
        <div className="h-[1px] bg-stone-100 my-3 w-16 mx-auto"></div>
        <div className="text-[10px] text-stone-600 font-semibold">
          📆 {date} | ⏱️ {time} Hrs
        </div>
      </div>
    </div>
  );
}

export function HeroStory({ title, subtitle, image, description }: HeroProps) {
  return (
    <div className="w-full max-w-xl bg-[#FDFCFB] border border-[#EDE5DA] rounded-[32px] p-6 sm:p-10 text-center mb-12 flex flex-col items-center">
      <span className="text-2xl mb-2 text-[#8C7A5F]">📜</span>
      <h1 className="text-3xl font-serif text-[#3E3830] mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{title}</h1>
      <p className="text-[10px] uppercase tracking-widest text-[#C5A880] font-bold mb-6">{subtitle}</p>
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-stone-150 mb-6">
        <img src={image} alt="Our Story Hero" className="w-full h-full object-cover" />
      </div>
      {description && (
        <div className="relative mt-2 max-w-sm">
          <span className="absolute -top-3 left-0 text-3xl text-stone-200 font-serif">“</span>
          <p className="text-xs leading-relaxed text-[#7D7061] italic font-light px-6">
            {description}
          </p>
          <span className="absolute -bottom-6 right-0 text-3xl text-stone-200 font-serif">”</span>
        </div>
      )}
    </div>
  );
}

export function HeroLuxury({ title, subtitle, image, date, time }: HeroProps) {
  return (
    <div className="w-full max-w-2xl bg-[#111] border-2 border-[#D4AF37]/30 rounded-[40px] p-8 sm:p-12 mb-12 text-center flex flex-col items-center shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-full blur-xl pointer-events-none"></div>
      <div className="border border-[#D4AF37]/20 p-4 rounded-full w-14 h-14 flex items-center justify-center mb-6">
        <span className="text-lg text-[#D4AF37] font-serif">✨</span>
      </div>
      <p className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37] font-black mb-4">GALA EXCLUSIVA</p>
      <h1 className="text-3xl sm:text-5xl font-serif text-white leading-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{title}</h1>
      <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-bold mb-8">{subtitle}</p>
      
      <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-stone-800 shadow-lg mb-8">
        <img src={image} alt="Luxury Background" className="w-full h-full object-cover" />
      </div>

      <div className="w-full grid grid-cols-2 gap-4 border-t border-[#D4AF37]/15 pt-6 text-center">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-stone-500">FECHA DE HONOR</p>
          <p className="text-xs sm:text-sm font-bold text-white mt-1">{date}</p>
        </div>
        <div className="border-l border-stone-800">
          <p className="text-[9px] uppercase tracking-wider text-stone-500">CITA PRINCIPAL</p>
          <p className="text-xs sm:text-sm font-bold text-white mt-1">{time} Hrs</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. IMAGE COMPONENTS (10 layouts)
// ============================================================================

interface ImageLayoutProps {
  key?: any;
  src: string;
  alt?: string;
  caption?: string;
}

export function ImageFull({ src, alt = 'Event Photo' }: ImageLayoutProps) {
  return (
    <div className="w-full aspect-video rounded-3xl overflow-hidden border border-stone-200/60 shadow-xs mb-8">
      <img src={src} alt={alt} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-[1500ms]" />
    </div>
  );
}

export function ImageRounded({ src, alt = 'Event Photo' }: ImageLayoutProps) {
  return (
    <div className="w-64 h-64 sm:w-80 sm:h-80 mx-auto rounded-full overflow-hidden border-4 border-white shadow-md mb-8 relative">
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      <div className="absolute inset-0 rounded-full border border-stone-200/50 pointer-events-none"></div>
    </div>
  );
}

export function ImageEditorial({ src, alt = 'Event Photo', caption }: ImageLayoutProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-white border border-[#E6E1D8] p-4 sm:p-5 rounded-[28px] shadow-2xs mb-8 flex flex-col gap-3">
      <div className="w-full aspect-[4/5] rounded-[18px] overflow-hidden border border-stone-100">
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
      {caption && <p className="text-[9px] uppercase tracking-wider text-stone-400 font-bold text-center leading-normal mt-1">{caption}</p>}
    </div>
  );
}

export function ImageMagazine({ src, alt = 'Event Photo', caption }: ImageLayoutProps) {
  return (
    <div className="w-full bg-[#FAF8F5] border-2 border-stone-900 p-4 rounded-xl mb-8 flex flex-col gap-2">
      <div className="w-full aspect-square overflow-hidden border border-stone-200">
        <img src={src} alt={alt} className="w-full h-full object-cover grayscale" />
      </div>
      <div className="flex justify-between items-center text-[9px] font-mono text-stone-700 pt-1">
        <span>FIG. 1 // RETRATO OFICIAL</span>
        {caption && <span className="font-bold">{caption.toUpperCase()}</span>}
      </div>
    </div>
  );
}

export function ImageFloating({ src, alt = 'Event Photo' }: ImageLayoutProps) {
  return (
    <motion.div 
      className="w-56 h-72 sm:w-64 sm:h-80 mx-auto rounded-2xl overflow-hidden border border-stone-200/60 shadow-lg mb-8"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </motion.div>
  );
}

export function ImageMosaic({ src }: ImageLayoutProps) {
  return (
    <div className="w-full max-w-md mx-auto grid grid-cols-12 gap-3 mb-8 h-64 sm:h-80 items-stretch">
      <div className="col-span-7 rounded-2xl overflow-hidden border border-stone-200 shadow-2xs">
        <img src={src} alt="Mosaic main" className="w-full h-full object-cover" />
      </div>
      <div className="col-span-5 flex flex-col gap-3">
        <div className="flex-1 rounded-2xl overflow-hidden border border-stone-200 shadow-2xs">
          <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=300" alt="Mosaic thumb 1" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 rounded-2xl overflow-hidden border border-stone-200 shadow-2xs">
          <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=300" alt="Mosaic thumb 2" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}

export function ImageGalleryPremium({ src }: ImageLayoutProps) {
  return (
    <div className="w-full bg-white border border-[#E9E3DA] p-4 rounded-3xl mb-8 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl overflow-hidden aspect-square border border-stone-100 shadow-3xs">
          <img src={src} alt="Gallery 1" className="w-full h-full object-cover" />
        </div>
        <div className="rounded-xl overflow-hidden aspect-square border border-stone-100 shadow-3xs">
          <img src="https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=400" alt="Gallery 2" className="w-full h-full object-cover" />
        </div>
      </div>
      <p className="text-[10px] text-center uppercase tracking-widest text-stone-400 font-bold">Ver nuestro álbum completo en la recepción</p>
    </div>
  );
}

export function ImagePolaroid({ src, alt = 'Polaroid Photo', caption }: ImageLayoutProps) {
  return (
    <div className="w-64 sm:w-72 mx-auto bg-[#FDFCF7] border border-stone-200 shadow-lg p-3 pb-8 rounded-xs mb-8 rotate-1 hover:rotate-0 transition-transform duration-300">
      <div className="w-full aspect-square overflow-hidden bg-stone-100 border border-stone-150 rounded-xs mb-4">
        <img src={src} alt={alt} className="w-full h-full object-cover sepia-[0.1]" />
      </div>
      <p className="text-center font-serif text-stone-700 text-xs tracking-wider italic leading-relaxed" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        {caption || '¡Acompáñanos! 🥂'}
      </p>
    </div>
  );
}

export function ImageOverlap({ src }: ImageLayoutProps) {
  return (
    <div className="relative w-full max-w-md mx-auto mb-16 h-72 sm:h-80">
      <div className="absolute inset-0 bg-stone-100 border border-stone-200 rounded-3xl overflow-hidden shadow-2xs z-0 translate-x-4 translate-y-4 opacity-70">
        <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400" alt="Overlap Back" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-white border border-[#E9E3DA] rounded-3xl overflow-hidden shadow-md z-10">
        <img src={src} alt="Overlap Front" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

export function ImageStory({ src, caption }: ImageLayoutProps) {
  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-center bg-stone-50 border border-stone-200/60 p-5 rounded-3xl mb-8 shadow-3xs">
      <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-stone-100 shadow-2xs">
        <img src={src} alt="Story visual" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 text-center md:text-left min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-[#8C7A5F] font-bold">Acompañamiento especial</p>
        <p className="text-xs text-stone-600 leading-relaxed mt-1">{caption || 'Capturando momentos del gran día con todos nuestros seres queridos.'}</p>
      </div>
    </div>
  );
}

// ============================================================================
// 3. TEXT COMPONENTS (10 variants)
// ============================================================================

interface TextProps {
  key?: any;
  text: string;
  accent?: string;
}

export function EditorialTitle({ text }: TextProps) {
  return (
    <h2 className="text-3xl sm:text-5xl font-serif text-stone-900 leading-tight tracking-tight text-center mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
      {text}
    </h2>
  );
}

export function EditorialSubtitle({ text }: TextProps) {
  return (
    <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#8C7A5F] font-extrabold text-center mb-6">
      {text}
    </p>
  );
}

export function QuoteBlock({ text }: TextProps) {
  return (
    <div className="my-8 max-w-md mx-auto text-center border-t border-b border-[#E9E3DA] py-6 px-4">
      <span className="text-3xl text-[#8C7A5F]/40 font-serif leading-none block mb-1">“</span>
      <p className="text-sm sm:text-base text-stone-600 italic font-light font-serif leading-relaxed" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        {text}
      </p>
      <span className="text-3xl text-[#8C7A5F]/40 font-serif leading-none block mt-1">”</span>
    </div>
  );
}

export function StoryParagraph({ text }: TextProps) {
  return (
    <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed text-center max-w-md mx-auto mb-6">
      {text}
    </p>
  );
}

export function LetterBlock({ text }: TextProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-[#FDFDFB] border border-[#E9E3DA] rounded-2xl p-6 sm:p-8 text-left mb-6 shadow-3xs font-serif italic text-stone-700 text-xs sm:text-sm leading-relaxed" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
      {text}
    </div>
  );
}

export function MagazineHeading({ text }: TextProps) {
  return (
    <div className="w-full flex items-center gap-4 mb-6">
      <span className="text-xs font-mono font-black uppercase text-stone-900 tracking-wider whitespace-nowrap">{text}</span>
      <div className="h-[2px] bg-stone-900 flex-1"></div>
    </div>
  );
}

export function SmallCaption({ text }: TextProps) {
  return (
    <span className="text-[8px] sm:text-[9px] font-mono tracking-[0.25em] uppercase text-stone-400 font-bold block text-center mb-4">
      {text}
    </span>
  );
}

export function InitialLetter({ text }: TextProps) {
  if (!text) return null;
  const firstLetter = text.charAt(0);
  const remaining = text.slice(1);
  return (
    <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed max-w-md mx-auto mb-6">
      <span className="text-4xl sm:text-5xl font-serif text-[#8C7A5F] float-left mr-2 mt-1 leading-none font-extrabold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        {firstLetter}
      </span>
      {remaining}
    </p>
  );
}

export function TimelineText({ text }: TextProps) {
  return (
    <p className="text-[10px] sm:text-xs text-stone-500 font-mono tracking-wide leading-relaxed">
      {text}
    </p>
  );
}

export function PullQuote({ text }: TextProps) {
  return (
    <div className="my-8 flex justify-center text-center">
      <div className="border-l-4 border-[#8C7A5F] pl-4 py-2 max-w-sm">
        <p className="text-sm font-bold text-stone-850 tracking-wide font-serif" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          {text}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// 5. CARD COMPONENTS (10 containers)
// ============================================================================

interface CardProps {
  key?: any;
  children: React.ReactNode;
  className?: string;
}

export function EditorialCard({ children, className = '' }: CardProps) {
  return (
    <div className={`w-full max-w-xl bg-white border border-[#E9E3DA] p-6 sm:p-10 rounded-[32px] shadow-3xs flex flex-col items-center text-center mb-8 ${className}`}>
      {children}
    </div>
  );
}

export function LuxuryCard({ children, className = '' }: CardProps) {
  return (
    <div className={`w-full max-w-xl bg-[#111111] border border-[#D4AF37]/40 p-6 sm:p-10 rounded-[32px] shadow-lg flex flex-col items-center text-center text-white mb-8 ${className}`}>
      {children}
    </div>
  );
}

export function GlassCard({ children, className = '' }: CardProps) {
  return (
    <div className={`w-full max-w-xl bg-white/40 backdrop-blur-md border border-white/20 p-6 sm:p-10 rounded-[32px] shadow-xs flex flex-col items-center text-center mb-8 ${className}`}>
      {children}
    </div>
  );
}

export function FloatingCard({ children, className = '' }: CardProps) {
  return (
    <motion.div 
      className={`w-full max-w-xl bg-white border border-stone-200/80 p-6 sm:p-10 rounded-[32px] shadow-md flex flex-col items-center text-center mb-8 ${className}`}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

export function BorderCard({ children, className = '' }: CardProps) {
  return (
    <div className={`w-full max-w-xl bg-[#FAF8F5] border-2 border-dashed border-[#8C7A5F]/40 p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center mb-8 relative ${className}`}>
      <div className="absolute inset-1.5 border border-[#8C7A5F]/20 rounded-[26px] pointer-events-none"></div>
      {children}
    </div>
  );
}

export function PaperCard({ children, className = '' }: CardProps) {
  return (
    <div className={`w-full max-w-xl bg-[#FDFCF7] border border-[#E3DCCE] p-6 sm:p-10 rounded-[24px] shadow-[0_8px_25px_rgba(0,0,0,0.03)] flex flex-col items-center text-center mb-8 relative overflow-hidden ${className}`}>
      {/* Soft overlay grain effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] opacity-25 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col items-center">{children}</div>
    </div>
  );
}

export function MinimalCard({ children, className = '' }: CardProps) {
  return (
    <div className={`w-full max-w-xl bg-transparent p-4 sm:p-6 flex flex-col items-center text-center mb-6 ${className}`}>
      {children}
    </div>
  );
}

export function MagazineCard({ children, className = '' }: CardProps) {
  return (
    <div className={`w-full max-w-xl bg-white border-2 border-stone-900 p-6 sm:p-8 rounded-none flex flex-col items-center text-center mb-8 ${className}`}>
      {children}
    </div>
  );
}

export function TransparentCard({ children, className = '' }: CardProps) {
  return (
    <div className={`w-full max-w-xl bg-transparent border border-stone-200/40 hover:border-stone-300 p-6 sm:p-8 rounded-[24px] flex flex-col items-center text-center transition-all duration-350 mb-8 ${className}`}>
      {children}
    </div>
  );
}

export function LargeEditorialCard({ children, className = '' }: CardProps) {
  return (
    <div className={`w-full max-w-3xl bg-white border border-[#E9E3DA] p-8 sm:p-14 rounded-[40px] shadow-[0_12px_45px_rgba(0,0,0,0.04)] flex flex-col items-center text-center mb-12 ${className}`}>
      {children}
    </div>
  );
}

// ============================================================================
// 6. DIVIDER COMPONENTS (10 variants)
// ============================================================================

export function OliveBranch() {
  return (
    <div className="flex items-center justify-center gap-4 my-8 w-full">
      <div className="h-[1px] bg-[#8D9982]/35 w-12 sm:w-20"></div>
      <span className="text-[#8D9982] text-xl font-serif">🕊️🌿</span>
      <div className="h-[1px] bg-[#8D9982]/35 w-12 sm:w-20"></div>
    </div>
  );
}

export function GoldLine() {
  return (
    <div className="flex items-center justify-center gap-3 my-8 w-full">
      <div className="h-[1px] bg-[#D4AF37]/30 w-16 sm:w-24"></div>
      <span className="text-[#D4AF37] text-[10px]">✦</span>
      <div className="h-[1px] bg-[#D4AF37]/30 w-16 sm:w-24"></div>
    </div>
  );
}

export function MinimalLine() {
  return (
    <div className="w-16 h-[1px] bg-stone-200 my-8 mx-auto"></div>
  );
}

export function Floral() {
  return (
    <div className="flex items-center justify-center gap-4 my-8 w-full">
      <div className="h-[1px] bg-stone-200 w-12 sm:w-20"></div>
      <span className="text-rose-300 text-sm">🌸</span>
      <div className="h-[1px] bg-stone-200 w-12 sm:w-20"></div>
    </div>
  );
}

export function Editorial() {
  return (
    <div className="flex items-center my-8 w-full max-w-xs mx-auto">
      <div className="h-[3px] bg-stone-900 w-1/4"></div>
      <div className="h-[1px] bg-stone-300 flex-1"></div>
    </div>
  );
}

export function Vintage() {
  return (
    <div className="flex items-center justify-center gap-2 my-8 text-stone-400 text-xs tracking-widest font-mono">
      <span>❦  ❦  ❦</span>
    </div>
  );
}

export function DividerLuxury() {
  return (
    <div className="flex items-center justify-center gap-3 my-8 w-full">
      <div className="h-[1px] bg-[#C7A873]/40 w-12"></div>
      <span className="text-[#C7A873] text-sm tracking-widest">👑</span>
      <div className="h-[1px] bg-[#C7A873]/40 w-12"></div>
    </div>
  );
}

export function DividerMagazine() {
  return (
    <div className="w-24 h-1 bg-stone-900 my-8 text-left self-start"></div>
  );
}

export function DividerGeometric() {
  return (
    <div className="flex justify-center gap-2 my-8">
      <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-stone-200"></span>
    </div>
  );
}

export function DividerModern() {
  return (
    <div className="w-full flex justify-center items-center my-8">
      <span className="text-[10px] tracking-[0.5em] text-stone-300 font-mono font-bold">—— // ——</span>
    </div>
  );
}

// ============================================================================
// 7. GALLERIES (8 variants)
// ============================================================================

interface GalleryProps {
  key?: any;
  images: string[];
}

export function GalleryGrid({ images }: GalleryProps) {
  const filtered = images ? images.filter(Boolean) : [];
  const finalImages = filtered.length > 0 ? filtered : [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=400'
  ];
  return (
    <div className="grid grid-cols-2 gap-3 my-6 w-full">
      {finalImages.map((img, i) => (
        <div key={i} className={`rounded-2xl overflow-hidden aspect-square border border-stone-100 shadow-3xs ${
          i === 0 && finalImages.length === 3 ? 'col-span-2 aspect-video' : ''
        }`}>
          <img src={img} alt={`Grid ${i}`} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
        </div>
      ))}
    </div>
  );
}

export function GalleryEditorial({ images }: GalleryProps) {
  const filtered = images ? images.filter(Boolean) : [];
  const finalImages = filtered.length > 0 ? filtered : [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=400'
  ];
  return (
    <div className="flex flex-col gap-4 my-8 w-full">
      <div className="w-full aspect-[4/3] rounded-[24px] overflow-hidden border border-stone-100 shadow-xs">
        <img src={finalImages[0]} alt="Editorial gallery large" className="w-full h-full object-cover" />
      </div>
      {finalImages[1] && (
        <div className="w-[80%] self-end -mt-10 aspect-square rounded-[24px] overflow-hidden border-4 border-white shadow-lg relative z-10">
          <img src={finalImages[1]} alt="Editorial gallery small" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

export function GalleryMasonry({ images }: GalleryProps) {
  const filtered = images ? images.filter(Boolean) : [];
  const finalImages = filtered.length > 0 ? filtered : [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=300'
  ];
  return (
    <div className="grid grid-cols-2 gap-3 my-6 w-full items-start">
      <div className="flex flex-col gap-3">
        <div className="rounded-2xl overflow-hidden aspect-[3/4] border border-stone-200 shadow-3xs">
          <img src={finalImages[0]} alt="Masonry 1" className="w-full h-full object-cover" />
        </div>
        {finalImages[2] && (
          <div className="rounded-2xl overflow-hidden aspect-square border border-stone-200 shadow-3xs">
            <img src={finalImages[2]} alt="Masonry 3" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {finalImages[1] && (
          <div className="rounded-2xl overflow-hidden aspect-square border border-stone-200 shadow-3xs">
            <img src={finalImages[1]} alt="Masonry 2" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="rounded-2xl overflow-hidden aspect-[3/4] border border-stone-200 shadow-3xs bg-stone-50 flex items-center justify-center p-4 text-center">
          <p className="text-[9px] uppercase tracking-wider text-[#8C7A5F] font-bold leading-relaxed">Historias de Amor Compartidas</p>
        </div>
      </div>
    </div>
  );
}

export function GalleryCarousel({ images }: GalleryProps) {
  const filtered = images ? images.filter(Boolean) : [];
  const finalImages = filtered.length > 0 ? filtered : [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=500',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=500',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=500'
  ];
  const [index, setIndex] = useState(0);
  return (
    <div className="w-full my-6 bg-white border border-[#E9E3DA] p-3 rounded-3xl shadow-3xs relative">
      <div className="w-full aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden relative">
        <img src={finalImages[index]} alt={`Slide ${index}`} className="w-full h-full object-cover transition-opacity duration-350" />
        
        {/* Navigation buttons overlay */}
        <button 
          onClick={() => setIndex((prev) => (prev === 0 ? finalImages.length - 1 : prev - 1))}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 border border-stone-200 flex items-center justify-center text-stone-700 shadow-xs hover:bg-white transition-all z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIndex((prev) => (prev === finalImages.length - 1 ? 0 : prev + 1))}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 border border-stone-200 flex items-center justify-center text-stone-700 shadow-xs hover:bg-white transition-all z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {finalImages.map((_, i) => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-stone-800' : 'bg-stone-200'}`} />
        ))}
      </div>
    </div>
  );
}

export function GalleryMagazine({ images }: GalleryProps) {
  const filtered = images ? images.filter(Boolean) : [];
  const finalImages = filtered.length > 0 ? filtered : [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400'
  ];
  return (
    <div className="w-full bg-white border-2 border-stone-900 rounded-none p-4 my-8 text-center flex flex-col gap-3">
      <div className="w-full aspect-video overflow-hidden border border-stone-200">
        <img src={finalImages[0]} alt="Magazine shoot" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
      </div>
      <div className="border-t border-stone-300 pt-3 text-[10px] font-mono font-bold uppercase text-stone-900 tracking-wider flex justify-between">
        <span>ESTUDIO EDITORIAL // VOGUE</span>
        <span>© 2026</span>
      </div>
    </div>
  );
}

export function GalleryPolaroid({ images }: GalleryProps) {
  const filtered = images ? images.filter(Boolean) : [];
  const finalImages = filtered.length > 0 ? filtered : [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=300'
  ];
  return (
    <div className="flex justify-center gap-4 flex-wrap my-8 w-full">
      <ImagePolaroid src={finalImages[0]} caption="La Primera Mirada 💖" />
      {finalImages[1] && <ImagePolaroid src={finalImages[1]} caption="Siempre Juntos 🥂" />}
    </div>
  );
}

export function GalleryStack() {
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto my-12">
      <div className="absolute inset-0 bg-stone-50 border border-stone-200 rounded-2xl rotate-6 shadow-sm">
        <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=300" alt="Stack bottom" className="w-full h-full object-cover rounded-2xl opacity-85" />
      </div>
      <div className="absolute inset-0 bg-stone-50 border border-stone-200 rounded-2xl -rotate-3 shadow-md">
        <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=300" alt="Stack top" className="w-full h-full object-cover rounded-2xl" />
      </div>
    </div>
  );
}

export function GalleryLuxury({ images }: GalleryProps) {
  const filtered = images ? images.filter(Boolean) : [];
  const finalImages = filtered.length > 0 ? filtered : [
    'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=400'
  ];
  return (
    <div className="w-full border-2 border-[#D4AF37]/20 p-2.5 rounded-[28px] bg-black shadow-lg my-8 overflow-hidden relative">
      <div className="w-full aspect-[16/10] rounded-[18px] overflow-hidden">
        <img src={finalImages[0]} alt="Luxury high res" className="w-full h-full object-cover scale-102 hover:scale-100 transition-transform duration-[1200ms]" />
      </div>
    </div>
  );
}

// ============================================================================
// 8. TIMELINE (6 variants)
// ============================================================================

export interface TimelineItem {
  timeStr: string;
  title: string;
  description: string;
}

interface TimelineProps {
  key?: any;
  items?: TimelineItem[];
}

const DEFAULT_TIMELINE_ITEMS: TimelineItem[] = [
  { timeStr: '19:30 Hrs', title: 'Cóctel de Recepción', description: 'Llegada de invitados, cócteles de bienvenida y sesión de fotos inicial.' },
  { timeStr: '20:30 Hrs', title: 'Ceremonia Central', description: 'Celebración principal, intercambio de votos simbólicos y brindis oficial.' },
  { timeStr: '22:00 Hrs', title: 'Banquete & Fiesta', description: 'Cena gourmet de bodas, baile oficial de novios y fiesta bailable sin límites.' }
];

export function TimelineVertical({ items = DEFAULT_TIMELINE_ITEMS }: TimelineProps) {
  return (
    <div className="w-full max-w-sm mx-auto my-8 flex flex-col gap-6 text-left relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-stone-200">
      {items.map((it, i) => (
        <div key={i} className="flex gap-4 pl-8 relative">
          <span className="absolute left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-[#8C7A5F] border-2 border-white shadow-3xs"></span>
          <div>
            <strong className="text-[10px] font-mono uppercase tracking-widest text-[#8C7A5F] block">{it.timeStr}</strong>
            <h5 className="text-xs font-extrabold text-stone-800 mt-0.5">{it.title}</h5>
            <p className="text-[10px] text-stone-400 mt-1 leading-relaxed font-light">{it.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TimelineHorizontal({ items = DEFAULT_TIMELINE_ITEMS }: TimelineProps) {
  return (
    <div className="w-full my-8 overflow-x-auto pb-4 pr-4">
      <div className="flex gap-4 min-w-[500px] items-stretch relative">
        <div className="absolute left-4 right-4 top-[24px] h-[1px] bg-stone-200 -z-0"></div>
        {items.map((it, i) => (
          <div key={i} className="flex-1 bg-white border border-[#E9E3DA] rounded-2xl p-4 flex flex-col relative z-10 shadow-3xs text-center items-center">
            <span className="w-5 h-5 rounded-full bg-[#8C7A5F] text-white text-[9px] font-bold flex items-center justify-center mb-3 border-4 border-[#FAF8F5]">
              {i + 1}
            </span>
            <strong className="text-[10px] font-mono text-[#8C7A5F] uppercase tracking-wider">{it.timeStr}</strong>
            <h5 className="text-xs font-black text-stone-850 mt-1">{it.title}</h5>
            <p className="text-[9px] text-stone-400 mt-1 leading-relaxed font-medium">{it.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimelineLuxury({ items = DEFAULT_TIMELINE_ITEMS }: TimelineProps) {
  return (
    <div className="w-full max-w-sm mx-auto my-8 border-l border-[#D4AF37]/35 pl-6 flex flex-col gap-6 text-left">
      {items.map((it, i) => (
        <div key={i} className="relative">
          <div className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-[#D4AF37] border-2 border-black"></div>
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#D4AF37] font-extrabold">{it.timeStr}</p>
          <h5 className="text-sm font-serif font-bold text-stone-800 mt-0.5" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{it.title}</h5>
          <p className="text-[10px] text-stone-400 mt-1 leading-relaxed font-light italic">"{it.description}"</p>
        </div>
      ))}
    </div>
  );
}

export function TimelineEditorial({ items = DEFAULT_TIMELINE_ITEMS }: TimelineProps) {
  return (
    <div className="w-full max-w-md mx-auto my-10 flex flex-col gap-8 text-left">
      {items.map((it, i) => (
        <div key={i} className="flex grid grid-cols-12 gap-4 border-b border-stone-100 pb-4">
          <div className="col-span-3">
            <span className="text-lg font-serif italic text-[#8D9982] leading-none">{it.timeStr.split(' ')[0]}</span>
            <span className="text-[8px] font-mono tracking-widest text-stone-400 block uppercase font-bold">HORA</span>
          </div>
          <div className="col-span-9">
            <h5 className="text-xs font-bold text-stone-900 tracking-wide">{it.title}</h5>
            <p className="text-[10px] text-stone-400 mt-1 leading-relaxed font-light">{it.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TimelineMinimal({ items = DEFAULT_TIMELINE_ITEMS }: TimelineProps) {
  return (
    <div className="w-full max-w-sm mx-auto my-6 flex flex-col gap-4 text-center items-center">
      {items.map((it, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <strong className="text-[9px] font-mono text-stone-400 uppercase tracking-widest">{it.timeStr}</strong>
          <h5 className="text-xs font-black text-stone-850">{it.title}</h5>
          <p className="text-[9px] text-stone-400 max-w-xs leading-normal">{it.description}</p>
          {i < items.length - 1 && <span className="text-stone-300 text-xs my-2">·</span>}
        </div>
      ))}
    </div>
  );
}

export function TimelineIcons({ items = DEFAULT_TIMELINE_ITEMS }: TimelineProps) {
  const getIcon = (index: number) => {
    switch (index) {
      case 0: return <Compass className="w-4 h-4 text-emerald-600" />;
      case 1: return <Heart className="w-4 h-4 text-rose-500" />;
      case 2: return <Music className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-stone-400" />;
    }
  };
  return (
    <div className="w-full max-w-sm mx-auto my-8 flex flex-col gap-6 text-left relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-stone-100">
      {items.map((it, i) => (
        <div key={i} className="flex gap-4 pl-10 relative">
          <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center shadow-3xs z-10">
            {getIcon(i)}
          </div>
          <div className="pt-0.5">
            <strong className="text-[9px] font-mono uppercase tracking-widest text-stone-400 block">{it.timeStr}</strong>
            <h5 className="text-xs font-black text-stone-800 mt-0.5">{it.title}</h5>
            <p className="text-[10px] text-stone-400 mt-1 leading-relaxed font-medium">{it.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 9. BUTTON COMPONENTS (10 styles)
// ============================================================================

interface CustomButtonProps {
  key?: any;
  text: string;
  onClick?: () => void;
  href?: string;
}

export function ButtonLuxury({ text, onClick, href }: CustomButtonProps) {
  const cn = "inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-3 border-2 border-[#D4AF37] bg-stone-950 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-stone-950 rounded-full transition-all duration-350 shadow-md cursor-pointer";
  return href ? <a href={href} target="_blank" className={cn}>{text}</a> : <button onClick={onClick} className={cn}>{text}</button>;
}

export function ButtonEditorial({ text, onClick, href }: CustomButtonProps) {
  const cn = "inline-flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest px-7 py-3.5 bg-[#FAF8F5] text-stone-900 border border-[#E9E3DA] hover:bg-stone-50 rounded-[12px] shadow-3xs transition-all cursor-pointer";
  return href ? <a href={href} target="_blank" className={cn}>{text}</a> : <button onClick={onClick} className={cn}>{text}</button>;
}

export function ButtonMinimal({ text, onClick, href }: CustomButtonProps) {
  const cn = "inline-flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-700 hover:text-stone-950 transition-colors relative py-1 cursor-pointer group";
  const inner = (
    <>
      <span>{text}</span>
      <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#8C7A5F] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
    </>
  );
  return href ? <a href={href} target="_blank" className={cn}>{inner}</a> : <button onClick={onClick} className={cn}>{inner}</button>;
}

export function ButtonOutline({ text, onClick, href }: CustomButtonProps) {
  const cn = "inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider px-6 py-3 border border-stone-300 text-stone-600 hover:text-stone-850 hover:bg-stone-50 rounded-full transition-all cursor-pointer";
  return href ? <a href={href} target="_blank" className={cn}>{text}</a> : <button onClick={onClick} className={cn}>{text}</button>;
}

export function ButtonGhost({ text, onClick, href }: CustomButtonProps) {
  const cn = "inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100/50 rounded-lg transition-all cursor-pointer";
  return href ? <a href={href} target="_blank" className={cn}>{text}</a> : <button onClick={onClick} className={cn}>{text}</button>;
}

export function ButtonGlass({ text, onClick, href }: CustomButtonProps) {
  const cn = "inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider px-6 py-3 bg-white/45 backdrop-blur-xs border border-white/30 text-stone-700 hover:bg-white/60 rounded-full transition-all shadow-3xs cursor-pointer";
  return href ? <a href={href} target="_blank" className={cn}>{text}</a> : <button onClick={onClick} className={cn}>{text}</button>;
}

export function ButtonGold({ text, onClick, href }: CustomButtonProps) {
  const cn = "inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest px-6 py-3.5 bg-gradient-to-r from-[#E6C655] to-[#D4AF37] text-white hover:from-[#D4B543] hover:to-[#BCA02E] rounded-full transition-all shadow-xs font-black cursor-pointer";
  return href ? <a href={href} target="_blank" className={cn}>{text}</a> : <button onClick={onClick} className={cn}>{text}</button>;
}

export function ButtonOlive({ text, onClick, href }: CustomButtonProps) {
  const cn = "inline-flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-6 py-3 bg-[#5C6454] hover:bg-[#4B5244] text-[#FAF8F5] rounded-full transition-all shadow-3xs cursor-pointer";
  return href ? <a href={href} target="_blank" className={cn}>{text}</a> : <button onClick={onClick} className={cn}>{text}</button>;
}

export function ButtonDark({ text, onClick, href }: CustomButtonProps) {
  const cn = "inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest px-6 py-3.5 bg-stone-900 hover:bg-stone-850 text-white rounded-full transition-all shadow-3xs cursor-pointer";
  return href ? <a href={href} target="_blank" className={cn}>{text}</a> : <button onClick={onClick} className={cn}>{text}</button>;
}

export function ButtonWhite({ text, onClick, href }: CustomButtonProps) {
  const cn = "inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider px-6 py-3 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-full transition-all shadow-3xs cursor-pointer";
  return href ? <a href={href} target="_blank" className={cn}>{text}</a> : <button onClick={onClick} className={cn}>{text}</button>;
}

// ============================================================================
// 4. MODULES / SECTION COMPONENTS & WRAPPERS (12 blocks)
// ============================================================================

interface ModuleProps {
  key?: any;
  event: EventData;
  variables: Record<string, string>;
  children?: React.ReactNode;
}

export function SectionStory({ event, variables, children }: ModuleProps) {
  return (
    <EditorialCard className="my-8 animate-fade-in animate-duration-500">
      <span className="text-[9px] uppercase tracking-[0.25em] text-[#8D9982] font-black mb-3">NUESTRA HISTORIA</span>
      {children ? children : (
        <>
          <p className="text-xl font-serif text-[#3D3A35] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Un Gran Comienzo</p>
          <p className="text-xs text-[#706B62] leading-relaxed max-w-md font-light italic">"{event.description}"</p>
        </>
      )}
    </EditorialCard>
  );
}

export function SectionCeremony({ event, variables }: ModuleProps) {
  return (
    <EditorialCard className="my-8">
      <span className="text-[9px] uppercase tracking-[0.25em] text-[#8C867A] font-bold mb-2">LA CEREMONIA</span>
      <h3 className="text-2xl font-serif text-stone-950 mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{event.locationName}</h3>
      <p className="text-[10px] text-stone-400 font-mono tracking-wider mb-6">📍 {event.locationAddress}</p>
      <div dangerouslySetInnerHTML={{ __html: variables.maps || '' }} />
    </EditorialCard>
  );
}

export function SectionReception({ event, variables }: ModuleProps) {
  return (
    <EditorialCard className="my-8">
      <span className="text-[9px] uppercase tracking-[0.25em] text-[#8C867A] font-bold mb-2">LA RECEPCIÓN</span>
      <h3 className="text-xl font-serif text-stone-900 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Banquete & Fiesta</h3>
      <p className="text-xs text-stone-500 leading-relaxed max-w-sm mb-6">Acompáñanos a brindar, cenar y celebrar la alegría del amor.</p>
      <div dangerouslySetInnerHTML={{ __html: variables.waze || '' }} />
    </EditorialCard>
  );
}

export function SectionSchedule({ event, variables }: ModuleProps) {
  return (
    <div className="w-full max-w-xl my-8">
      <div dangerouslySetInnerHTML={{ __html: variables.schedule || '' }} />
    </div>
  );
}

export function SectionDresscode({ event, variables }: ModuleProps) {
  return (
    <div className="w-full max-w-xl my-8">
      <div dangerouslySetInnerHTML={{ __html: variables.dressCode || '' }} />
    </div>
  );
}

export function SectionHotel({ event, variables }: ModuleProps) {
  return (
    <div className="w-full max-w-xl my-8">
      <div dangerouslySetInnerHTML={{ __html: variables.hotel || '' }} />
    </div>
  );
}

export function SectionGallery({ event, variables }: ModuleProps) {
  return (
    <div className="w-full max-w-xl my-8">
      <div dangerouslySetInnerHTML={{ __html: variables.gallery || '' }} />
    </div>
  );
}

export function SectionVideo({ event, variables }: ModuleProps) {
  return (
    <div className="w-full max-w-xl my-8">
      <div dangerouslySetInnerHTML={{ __html: variables.video || '' }} />
    </div>
  );
}

export function SectionGifts({ event, variables }: ModuleProps) {
  return (
    <div className="w-full max-w-xl my-8">
      <div dangerouslySetInnerHTML={{ __html: variables.giftLink || '' }} />
    </div>
  );
}

export function SectionCountdown({ event, variables }: ModuleProps) {
  return (
    <div className="w-full max-w-xl my-8 notranslate" translate="no">
      <div dangerouslySetInnerHTML={{ __html: variables.countdown || '' }} />
    </div>
  );
}

export function SectionRsvp({ event, variables }: ModuleProps) {
  return (
    <div className="w-full max-w-xl my-8 text-center bg-[#FAF8F5] border border-[#E9E3DA] p-6 rounded-3xl notranslate" translate="no">
      <span className="text-[9px] uppercase tracking-widest text-[#8C7A5F] font-bold">ASISTENCIA</span>
      <h4 className="text-lg font-serif mt-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Confirma tu Presencia</h4>
      <p className="text-[10px] text-stone-400 mt-1 max-w-xs mx-auto mb-4">Ayúdanos a organizar los preparativos confirmando tu asistencia directa.</p>
      <div dangerouslySetInnerHTML={{ __html: variables.confirmationDeadline || '' }} />
    </div>
  );
}

export function SectionFooter({ event }: ModuleProps) {
  return (
    <div className="w-full max-w-xl my-12 text-center border-t border-stone-200/50 pt-8 flex flex-col items-center gap-2">
      <p className="text-[10px] font-mono tracking-widest text-stone-400 uppercase font-bold">HECHO CON AMOR PARA TI</p>
      <p className="text-xs text-stone-500 font-serif italic" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Hans & Chefie • Diseños de Autor</p>
    </div>
  );
}

// ============================================================================
// COMPILER & PARSER: RENDERING ENGINE V2
// ============================================================================

interface EditorialEngineV2RendererProps {
  htmlContent: string;
  event: EventData;
  variables: Record<string, string>;
  isMobileSize?: boolean;
}

export function EditorialEngineV2Renderer({ 
  htmlContent, 
  event, 
  variables, 
  isMobileSize = false 
}: EditorialEngineV2RendererProps) {
  
  // Choose the visual theme/palette token for this event style
  let paletteKey: EditorialPaletteType = 'white';
  if (event.style === 'editorial-black-v1') paletteKey = 'black';
  if (event.style === 'editorial-olive-v1') paletteKey = 'olive';
  if (event.style.includes('rose')) paletteKey = 'rose';
  if (event.style.includes('beige')) paletteKey = 'beige';
  if (event.style.includes('navy')) paletteKey = 'navy';
  if (event.style.includes('emerald')) paletteKey = 'emerald';
  if (event.style.includes('burgundy')) paletteKey = 'burgundy';
  if (event.style.includes('gold')) paletteKey = 'gold';
  if (event.style.includes('japandi')) paletteKey = 'japandi';

  const tokens = PALETTES[paletteKey];

  // Helper to parse XML-like nodes to beautiful high fidelity components
  const compileStringToReact = (rawHtml: string): React.ReactNode => {
    try {
      const parser = new DOMParser();
      // Enforce container div
      const doc = parser.parseFromString(`<div id="root-container">${rawHtml}</div>`, 'text/html');
      const root = doc.getElementById('root-container');
      
      if (!root) return <div dangerouslySetInnerHTML={{ __html: rawHtml }} />;

      const walkNode = (node: ChildNode, index: number): React.ReactNode => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tagName = el.tagName.toLowerCase();

          // Collect attributes/props dynamically
          const props: Record<string, any> = {};
          Array.from(el.attributes).forEach(attr => {
            props[attr.name] = attr.value;
          });

          // Custom tag replacement map
          switch (tagName) {
            // HERO COMPONENTS
            case 'hero-fullscreen':
              return <HeroFullscreen key={index} title={props.title || event.title} subtitle={props.subtitle || event.hostName} image={props.image || variables.imageUrl} date={props.date || variables.date} time={props.time || event.time} />;
            case 'hero-editorial':
              return <HeroEditorial key={index} title={props.title || event.title} subtitle={props.subtitle || event.hostName} image={props.image || variables.imageUrl} date={props.date || variables.date} time={props.time || event.time} description={props.description || event.description} />;
            case 'hero-cinematic':
              return <HeroCinematic key={index} title={props.title || event.title} subtitle={props.subtitle || event.hostName} image={props.image || variables.imageUrl} date={props.date || variables.date} time={props.time || event.time} />;
            case 'hero-magazine':
              return <HeroMagazine key={index} title={props.title || event.title} subtitle={props.subtitle || event.hostName} image={props.image || variables.imageUrl} date={props.date || variables.date} time={props.time || event.time} />;
            case 'hero-split':
              return <HeroSplit key={index} title={props.title || event.title} subtitle={props.subtitle || event.hostName} image={props.image || variables.imageUrl} date={props.date || variables.date} time={props.time || event.time} />;
            case 'hero-vertical':
              return <HeroVertical key={index} title={props.title || event.title} subtitle={props.subtitle || event.hostName} image={props.image || variables.imageUrl} date={props.date || variables.date} time={props.time || event.time} />;
            case 'hero-minimal':
              return <HeroMinimal key={index} title={props.title || event.title} subtitle={props.subtitle || event.hostName} image={props.image || variables.imageUrl} date={props.date || variables.date} time={props.time || event.time} />;
            case 'hero-floating-card':
              return <HeroFloatingCard key={index} title={props.title || event.title} subtitle={props.subtitle || event.hostName} image={props.image || variables.imageUrl} date={props.date || variables.date} time={props.time || event.time} />;
            case 'hero-story':
              return <HeroStory key={index} title={props.title || event.title} subtitle={props.subtitle || event.hostName} image={props.image || variables.imageUrl} date={props.date || variables.date} time={props.time || event.time} description={props.description || event.description} />;
            case 'hero-luxury':
              return <HeroLuxury key={index} title={props.title || event.title} subtitle={props.subtitle || event.hostName} image={props.image || variables.imageUrl} date={props.date || variables.date} time={props.time || event.time} />;

            // IMAGE LAYOUTS
            case 'image-full':
              return <ImageFull key={index} src={props.src || variables.imageUrl} alt={props.alt} />;
            case 'image-rounded':
              return <ImageRounded key={index} src={props.src || variables.imageUrl} alt={props.alt} />;
            case 'image-editorial':
              return <ImageEditorial key={index} src={props.src || variables.imageUrl} alt={props.alt} caption={props.caption} />;
            case 'image-magazine':
              return <ImageMagazine key={index} src={props.src || variables.imageUrl} alt={props.alt} caption={props.caption} />;
            case 'image-floating':
              return <ImageFloating key={index} src={props.src || variables.imageUrl} alt={props.alt} />;
            case 'image-mosaic':
              return <ImageMosaic key={index} src={props.src || variables.imageUrl} alt={props.alt} />;
            case 'image-gallery-premium':
              return <ImageGalleryPremium key={index} src={props.src || variables.imageUrl} alt={props.alt} />;
            case 'image-polaroid':
              return <ImagePolaroid key={index} src={props.src || variables.imageUrl} alt={props.alt} caption={props.caption} />;
            case 'image-overlap':
              return <ImageOverlap key={index} src={props.src || variables.imageUrl} alt={props.alt} />;
            case 'image-story':
              return <ImageStory key={index} src={props.src || variables.imageUrl} caption={props.caption} />;

            // TEXT STYLES
            case 'editorial-title':
              return <EditorialTitle key={index} text={props.text || el.textContent || ''} />;
            case 'editorial-subtitle':
              return <EditorialSubtitle key={index} text={props.text || el.textContent || ''} />;
            case 'quote-block':
              return <QuoteBlock key={index} text={props.text || el.textContent || ''} />;
            case 'story-paragraph':
              return <StoryParagraph key={index} text={props.text || el.textContent || ''} />;
            case 'letter-block':
              return <LetterBlock key={index} text={props.text || el.textContent || ''} />;
            case 'magazine-heading':
              return <MagazineHeading key={index} text={props.text || el.textContent || ''} />;
            case 'small-caption':
              return <SmallCaption key={index} text={props.text || el.textContent || ''} />;
            case 'initial-letter':
              return <InitialLetter key={index} text={props.text || el.textContent || ''} />;
            case 'timeline-text':
              return <TimelineText key={index} text={props.text || el.textContent || ''} />;
            case 'pull-quote':
              return <PullQuote key={index} text={props.text || el.textContent || ''} />;

            // CARD CONTAINERS (Render their parsed children nodes recursively)
            case 'editorial-card':
              return (
                <EditorialCard key={index} className={props.class || props.className || ''}>
                  {Array.from(el.childNodes).map((child, childIdx) => walkNode(child, childIdx))}
                </EditorialCard>
              );
            case 'luxury-card':
              return (
                <LuxuryCard key={index} className={props.class || props.className || ''}>
                  {Array.from(el.childNodes).map((child, childIdx) => walkNode(child, childIdx))}
                </LuxuryCard>
              );
            case 'glass-card':
              return (
                <GlassCard key={index} className={props.class || props.className || ''}>
                  {Array.from(el.childNodes).map((child, childIdx) => walkNode(child, childIdx))}
                </GlassCard>
              );
            case 'floating-card':
              return (
                <FloatingCard key={index} className={props.class || props.className || ''}>
                  {Array.from(el.childNodes).map((child, childIdx) => walkNode(child, childIdx))}
                </FloatingCard>
              );
            case 'border-card':
              return (
                <BorderCard key={index} className={props.class || props.className || ''}>
                  {Array.from(el.childNodes).map((child, childIdx) => walkNode(child, childIdx))}
                </BorderCard>
              );
            case 'paper-card':
              return (
                <PaperCard key={index} className={props.class || props.className || ''}>
                  {Array.from(el.childNodes).map((child, childIdx) => walkNode(child, childIdx))}
                </PaperCard>
              );
            case 'minimal-card':
              return (
                <MinimalCard key={index} className={props.class || props.className || ''}>
                  {Array.from(el.childNodes).map((child, childIdx) => walkNode(child, childIdx))}
                </MinimalCard>
              );
            case 'magazine-card':
              return (
                <MagazineCard key={index} className={props.class || props.className || ''}>
                  {Array.from(el.childNodes).map((child, childIdx) => walkNode(child, childIdx))}
                </MagazineCard>
              );
            case 'transparent-card':
              return (
                <TransparentCard key={index} className={props.class || props.className || ''}>
                  {Array.from(el.childNodes).map((child, childIdx) => walkNode(child, childIdx))}
                </TransparentCard>
              );
            case 'large-editorial-card':
              return (
                <LargeEditorialCard key={index} className={props.class || props.className || ''}>
                  {Array.from(el.childNodes).map((child, childIdx) => walkNode(child, childIdx))}
                </LargeEditorialCard>
              );

            // DIVIDERS
            case 'divider-olive':
            case 'olive-branch':
              return <OliveBranch key={index} />;
            case 'divider-gold':
            case 'gold-line':
              return <GoldLine key={index} />;
            case 'divider-minimal':
            case 'minimal-line':
              return <MinimalLine key={index} />;
            case 'divider-floral':
              return <Floral key={index} />;
            case 'divider-editorial':
              return <Editorial key={index} />;
            case 'divider-vintage':
              return <Vintage key={index} />;
            case 'divider-luxury':
              return <DividerLuxury key={index} />;
            case 'divider-magazine':
              return <DividerMagazine key={index} />;
            case 'divider-geometric':
              return <DividerGeometric key={index} />;
            case 'divider-modern':
              return <DividerModern key={index} />;

            // GALLERIES
            case 'gallery-grid':
              return <GalleryGrid key={index} images={event.galleryImages || []} />;
            case 'gallery-masonry':
              return <GalleryMasonry key={index} images={event.galleryImages || []} />;
            case 'gallery-editorial':
              return <GalleryEditorial key={index} images={event.galleryImages || []} />;
            case 'gallery-carousel':
              return <GalleryCarousel key={index} images={event.galleryImages || []} />;
            case 'gallery-magazine':
              return <GalleryMagazine key={index} images={event.galleryImages || []} />;
            case 'gallery-polaroid':
              return <GalleryPolaroid key={index} images={event.galleryImages || []} />;
            case 'gallery-stack':
              return <GalleryStack key={index} />;
            case 'gallery-luxury':
              return <GalleryLuxury key={index} images={event.galleryImages || []} />;

            // TIMELINE
            case 'timeline-vertical':
              return <TimelineVertical key={index} />;
            case 'timeline-horizontal':
              return <TimelineHorizontal key={index} />;
            case 'timeline-luxury':
              return <TimelineLuxury key={index} />;
            case 'timeline-editorial':
              return <TimelineEditorial key={index} />;
            case 'timeline-minimal':
              return <TimelineMinimal key={index} />;
            case 'timeline-icons':
              return <TimelineIcons key={index} />;

            // BUTTONS
            case 'button-luxury':
              return <ButtonLuxury key={index} text={props.text || 'Acción Premium'} href={props.href} />;
            case 'button-editorial':
              return <ButtonEditorial key={index} text={props.text || 'Leer Revista'} href={props.href} />;
            case 'button-minimal':
              return <ButtonMinimal key={index} text={props.text || 'Ver Más'} href={props.href} />;
            case 'button-outline':
              return <ButtonOutline key={index} text={props.text || 'Detalles'} href={props.href} />;
            case 'button-ghost':
              return <ButtonGhost key={index} text={props.text || 'Atrás'} href={props.href} />;
            case 'button-glass':
              return <ButtonGlass key={index} text={props.text || 'Ver Galería'} href={props.href} />;
            case 'button-gold':
              return <ButtonGold key={index} text={props.text || 'Confirmar'} href={props.href} />;
            case 'button-olive':
              return <ButtonOlive key={index} text={props.text || 'Confirmar'} href={props.href} />;
            case 'button-dark':
              return <ButtonDark key={index} text={props.text || 'Ver Itinerario'} href={props.href} />;
            case 'button-white':
              return <ButtonWhite key={index} text={props.text || 'Ubicación'} href={props.href} />;

            // SECTIONS
            case 'section-story':
              return <SectionStory key={index} event={event} variables={variables} />;
            case 'section-ceremony':
              return <SectionCeremony key={index} event={event} variables={variables} />;
            case 'section-reception':
              return <SectionReception key={index} event={event} variables={variables} />;
            case 'section-schedule':
              return <SectionSchedule key={index} event={event} variables={variables} />;
            case 'section-dresscode':
              return <SectionDresscode key={index} event={event} variables={variables} />;
            case 'section-hotel':
              return <SectionHotel key={index} event={event} variables={variables} />;
            case 'section-gallery':
              return <SectionGallery key={index} event={event} variables={variables} />;
            case 'section-video':
              return <SectionVideo key={index} event={event} variables={variables} />;
            case 'section-gifts':
              return <SectionGifts key={index} event={event} variables={variables} />;
            case 'section-countdown':
              return <SectionCountdown key={index} event={event} variables={variables} />;
            case 'section-rsvp':
              return <SectionRsvp key={index} event={event} variables={variables} />;
            case 'section-footer':
              return <SectionFooter key={index} event={event} variables={variables} />;

            // STANDARD HTML (Render recursively)
            default:
              const childNodes = Array.from(el.childNodes).map((child, idx) => walkNode(child, idx));
              // Convert attributes map back to React style
              const reactProps: Record<string, any> = { key: index };
              Array.from(el.attributes).forEach(attr => {
                if (attr.name === 'class') {
                  reactProps.className = attr.value;
                } else if (attr.name === 'style') {
                  // Ignore complex style rendering for safety, or pass as raw
                } else {
                  reactProps[attr.name] = attr.value;
                }
              });

              return React.createElement(tagName, reactProps, ...childNodes);
          }
        }

        return null;
      };

      return (
        <div className="w-full flex flex-col items-center">
          {Array.from(root.childNodes).map((child, childIdx) => walkNode(child, childIdx))}
        </div>
      );
    } catch (e) {
      console.error("V2 Editorial Engine parsing error, falling back to static dangerouslySetInnerHTML:", e);
      return <div dangerouslySetInnerHTML={{ __html: rawHtml }} />;
    }
  };

  const bgStyleClass = BACKGROUND_STYLES[paletteKey] || tokens.bgClass || BACKGROUND_STYLES.paper;

  return (
    <div 
      className={`w-full min-h-screen text-stone-900 flex flex-col items-center selection:bg-stone-200/50 relative overflow-hidden transition-all duration-500 py-12 px-4 sm:px-8 ${bgStyleClass}`}
      style={{ fontFamily: `'${tokens.fontBody}', sans-serif` }}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-2">
        {compileStringToReact(htmlContent)}
      </div>
    </div>
  );
}

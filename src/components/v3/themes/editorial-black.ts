import { V3ThemeConfig } from '../themeTypes';

export const editorialBlack: V3ThemeConfig = {
  id: 'editorial-black',
  name: 'Editorial Luxury Black',
  fontTitle: 'Cinzel',
  fontBody: 'Inter',
  spacing: {
    sectionPadding: 'py-16 px-6 md:py-24 md:px-12',
    itemGap: 'gap-8',
    cardPadding: 'p-8 md:p-12',
  },
  shadows: {
    card: 'shadow-[0_4px_30px_rgba(0,0,0,0.4)]',
    button: 'shadow-none',
  },
  borders: {
    radius: 'rounded-none',
    style: 'border-stone-800',
    cardBorder: 'border border-stone-800',
  },
  colors: {
    background: 'bg-[#111111] text-stone-100',
    textPrimary: 'text-stone-100',
    textSecondary: 'text-stone-400',
    accent: '#D4AF37', // Shiny Gold
    accentHover: '#F3E5AB',
    border: 'border-stone-800',
    cardBg: 'bg-[#181818]',
    overlayBg: 'bg-[#0D0D0D]/97',
    inputBg: 'bg-[#222222]',
  },
  animation: {
    transition: 'transition-all duration-700 ease-out',
  },
  button: {
    base: 'font-sans tracking-widest uppercase text-xs px-8 py-3.5 transition-all duration-300 font-bold border rounded-none',
    primary: 'bg-[#D4AF37] text-black border-[#D4AF37] hover:bg-white hover:border-white hover:tracking-[0.14em]',
    outline: 'bg-transparent text-stone-100 border-stone-700 hover:border-white hover:bg-stone-900',
  },
  card: {
    base: 'border border-stone-800 p-8 md:p-12 bg-[#181818] rounded-none',
    luxury: 'border border-[#D4AF37]/50 p-8 md:p-12 bg-[#141414] rounded-none relative after:absolute after:inset-1 after:border after:border-[#D4AF37]/20 after:pointer-events-none',
    glass: 'border border-white/10 p-8 md:p-12 bg-black/40 backdrop-blur-md rounded-none',
    floating: 'border border-stone-800 p-8 md:p-12 bg-[#1c1c1c] rounded-none shadow-2xl hover:translate-y-[-4px] transition-transform duration-300',
    paper: 'border-b-2 border-[#D4AF37] p-8 md:p-12 bg-[#1A1A1A] rounded-none shadow-sm',
  },
  divider: {
    gold: 'border-t border-stone-800 my-8 w-24 mx-auto relative after:absolute after:w-1.5 after:h-1.5 after:bg-[#D4AF37] after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full',
    olive: 'border-t border-stone-800 my-8 w-32 mx-auto flex items-center justify-center text-stone-600 gap-1 before:content-["🌿"] before:text-xs',
    minimal: 'border-t border-stone-800 my-8 w-16 mx-auto',
    floral: 'border-t border-stone-800 my-8 w-32 mx-auto flex items-center justify-center text-[#D4AF37] gap-1 before:content-["✨"] before:text-xs',
    luxury: 'border-t border-stone-800 my-8 w-32 mx-auto flex items-center justify-center relative after:absolute after:content-["✦_✦_✦"] after:text-[10px] after:bg-[#111111] after:px-2 after:text-[#D4AF37]',
  },
};

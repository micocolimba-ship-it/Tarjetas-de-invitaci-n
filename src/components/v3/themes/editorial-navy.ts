import { V3ThemeConfig } from '../themeTypes';

export const editorialNavy: V3ThemeConfig = {
  id: 'editorial-navy',
  name: 'Editorial Luxury Navy',
  fontTitle: 'Cinzel',
  fontBody: 'Montserrat',
  spacing: {
    sectionPadding: 'py-16 px-6 md:py-24 md:px-12',
    itemGap: 'gap-8',
    cardPadding: 'p-8 md:p-12',
  },
  shadows: {
    card: 'shadow-[0_4px_30px_rgba(0,10,30,0.15)]',
    button: 'shadow-none',
  },
  borders: {
    radius: 'rounded-none',
    style: 'border-[#1E293B]',
    cardBorder: 'border border-[#1E293B]',
  },
  colors: {
    background: 'bg-[#0F172A] text-slate-100',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    accent: '#E2E8F0', // Platinum/silver
    accentHover: '#FFFFFF',
    border: 'border-[#1E293B]',
    cardBg: 'bg-[#1E293B]/60',
    overlayBg: 'bg-[#0B0F19]/97',
    inputBg: 'bg-[#1E293B]',
  },
  animation: {
    transition: 'transition-all duration-700 ease-out',
  },
  button: {
    base: 'font-sans tracking-widest uppercase text-xs px-8 py-3.5 transition-all duration-300 font-bold border rounded-none',
    primary: 'bg-[#38BDF8] text-slate-900 border-[#38BDF8] hover:bg-[#7DD3FC] hover:border-[#7DD3FC] hover:tracking-[0.14em]',
    outline: 'bg-transparent text-slate-100 border-slate-700 hover:border-slate-300 hover:bg-[#1E293B]',
  },
  card: {
    base: 'border border-slate-800 p-8 md:p-12 bg-[#1E293B]/40 rounded-none',
    luxury: 'border border-[#38BDF8]/40 p-8 md:p-12 bg-[#0F172A] rounded-none relative after:absolute after:inset-1 after:border after:border-slate-800 after:pointer-events-none',
    glass: 'border border-white/10 p-8 md:p-12 bg-slate-900/50 backdrop-blur-md rounded-none',
    floating: 'border border-slate-800 p-8 md:p-12 bg-[#1E293B]/60 rounded-none shadow-xl hover:translate-y-[-4px] transition-transform duration-300',
    paper: 'border-b-2 border-[#38BDF8] p-8 md:p-12 bg-[#1E293B] rounded-none shadow-sm',
  },
  divider: {
    gold: 'border-t border-slate-800 my-8 w-24 mx-auto relative after:absolute after:w-1.5 after:h-1.5 after:bg-[#38BDF8] after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full',
    olive: 'border-t border-slate-800 my-8 w-32 mx-auto flex items-center justify-center text-slate-500 gap-1 before:content-["🌿"] before:text-xs',
    minimal: 'border-t border-slate-800 my-8 w-16 mx-auto',
    floral: 'border-t border-slate-800 my-8 w-32 mx-auto flex items-center justify-center text-[#38BDF8] gap-1 before:content-["✨"] before:text-xs',
    luxury: 'border-t border-slate-800 my-8 w-32 mx-auto flex items-center justify-center relative after:absolute after:content-["✧_✧_✧"] after:text-[10px] after:bg-[#0F172A] after:px-2 after:text-[#38BDF8]',
  },
};

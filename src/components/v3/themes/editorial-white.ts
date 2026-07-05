import { V3ThemeConfig } from '../themeTypes';

export const editorialWhite: V3ThemeConfig = {
  id: 'editorial-white',
  name: 'Editorial White',
  fontTitle: 'Cinzel',
  fontBody: 'Inter',
  spacing: {
    sectionPadding: 'py-16 px-6 md:py-24 md:px-12',
    itemGap: 'gap-8',
    cardPadding: 'p-8 md:p-12',
  },
  shadows: {
    card: 'shadow-[0_4px_20px_rgba(0,0,0,0.02)]',
    button: 'shadow-none',
  },
  borders: {
    radius: 'rounded-none',
    style: 'border-stone-200',
    cardBorder: 'border border-stone-200/60',
  },
  colors: {
    background: 'bg-[#FCFBF9] text-stone-900',
    textPrimary: 'text-stone-900',
    textSecondary: 'text-stone-600',
    accent: '#8C7A5B', // brushed gold
    accentHover: '#706045',
    border: 'border-stone-200',
    cardBg: 'bg-white',
    overlayBg: 'bg-stone-50/95',
    inputBg: 'bg-stone-50',
  },
  animation: {
    transition: 'transition-all duration-700 ease-out',
  },
  button: {
    base: 'font-sans tracking-widest uppercase text-xs px-8 py-3.5 transition-all duration-300 font-semibold border',
    primary: 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800 hover:tracking-[0.15em]',
    outline: 'bg-transparent text-stone-900 border-stone-300 hover:border-stone-900 hover:bg-stone-50',
  },
  card: {
    base: 'border border-stone-200 p-8 md:p-12 bg-white rounded-none',
    luxury: 'border border-stone-300 p-8 md:p-12 bg-white rounded-none relative after:absolute after:inset-1 after:border after:border-stone-200/40 after:pointer-events-none',
    glass: 'border border-white/60 p-8 md:p-12 bg-white/80 backdrop-blur-md rounded-none',
    floating: 'border border-stone-100 p-8 md:p-12 bg-white rounded-none shadow-xl hover:translate-y-[-4px] transition-transform duration-300',
    paper: 'border-b-2 border-stone-200 p-8 md:p-12 bg-[#FAF9F5] rounded-none shadow-sm',
  },
  divider: {
    gold: 'border-t border-stone-300/80 my-8 w-24 mx-auto relative after:absolute after:w-1.5 after:h-1.5 after:bg-[#8C7A5B] after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full',
    olive: 'border-t border-stone-200 my-8 w-32 mx-auto flex items-center justify-center text-stone-400 gap-1 before:content-["🌿"] before:text-xs',
    minimal: 'border-t border-stone-200 my-8 w-16 mx-auto',
    floral: 'border-t border-stone-200 my-8 w-32 mx-auto flex items-center justify-center text-stone-400 gap-1 before:content-["⚜️"] before:text-xs',
    luxury: 'border-t-2 border-stone-300 my-8 w-32 mx-auto flex items-center justify-center relative after:absolute after:content-["•_•_•"] after:text-[10px] after:bg-[#FCFBF9] after:px-2 after:text-[#8C7A5B]',
  },
};

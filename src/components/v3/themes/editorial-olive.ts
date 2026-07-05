import { V3ThemeConfig } from '../themeTypes';

export const editorialOlive: V3ThemeConfig = {
  id: 'editorial-olive',
  name: 'Editorial Tuscany Olive',
  fontTitle: 'Cormorant Garamond',
  fontBody: 'Inter',
  spacing: {
    sectionPadding: 'py-16 px-6 md:py-24 md:px-12',
    itemGap: 'gap-8',
    cardPadding: 'p-8 md:p-12',
  },
  shadows: {
    card: 'shadow-[0_4px_30px_rgba(40,50,40,0.02)]',
    button: 'shadow-none',
  },
  borders: {
    radius: 'rounded-xl',
    style: 'border-stone-200',
    cardBorder: 'border border-stone-200/85',
  },
  colors: {
    background: 'bg-[#F4F3EF] text-[#2C3528]',
    textPrimary: 'text-[#2C3528]',
    textSecondary: 'text-[#5A6354]',
    accent: '#6B7A64', // Olive sage green
    accentHover: '#4E5A48',
    border: 'border-[#DFDDD6]',
    cardBg: 'bg-[#F9F8F6]',
    overlayBg: 'bg-[#EDEDE8]/96',
    inputBg: 'bg-[#EAE8E2]',
  },
  animation: {
    transition: 'transition-all duration-700 ease-out',
  },
  button: {
    base: 'font-sans tracking-widest uppercase text-xs px-8 py-3.5 transition-all duration-300 font-bold border rounded-full',
    primary: 'bg-[#6B7A64] text-white border-[#6B7A64] hover:bg-[#4E5A48] hover:tracking-[0.14em]',
    outline: 'bg-transparent text-[#2C3528] border-[#A8A499] hover:border-[#6B7A64] hover:bg-[#EAE8E2]',
  },
  card: {
    base: 'border border-[#DFDDD6] p-8 md:p-12 bg-[#F9F8F6] rounded-xl',
    luxury: 'border border-[#D2CFC5] p-8 md:p-12 bg-[#F9F8F6] rounded-xl relative after:absolute after:inset-1.5 after:border after:border-[#DFDDD6]/50 after:pointer-events-none after:rounded-[6px]',
    glass: 'border border-white/40 p-8 md:p-12 bg-white/60 backdrop-blur-md rounded-xl',
    floating: 'border border-[#DFDDD6]/40 p-8 md:p-12 bg-[#F9F8F6] rounded-xl shadow-lg hover:translate-y-[-4px] transition-transform duration-300',
    paper: 'border-b-4 border-[#6B7A64]/40 p-8 md:p-12 bg-white rounded-none shadow-sm',
  },
  divider: {
    gold: 'border-t border-[#DFDDD6] my-8 w-24 mx-auto relative after:absolute after:w-1.5 after:h-1.5 after:bg-[#C2A878] after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full',
    olive: 'border-t border-[#DFDDD6] my-8 w-32 mx-auto flex items-center justify-center text-[#6B7A64] gap-1 before:content-["🌿"] before:text-xs',
    minimal: 'border-t border-[#DFDDD6] my-8 w-16 mx-auto',
    floral: 'border-t border-[#DFDDD6] my-8 w-32 mx-auto flex items-center justify-center text-[#5A6354] gap-1 before:content-["🍃"] before:text-xs',
    luxury: 'border-t border-[#DFDDD6] my-8 w-32 mx-auto flex items-center justify-center relative after:absolute after:content-["⚜️"] after:text-[10px] after:bg-[#F4F3EF] after:px-2',
  },
};

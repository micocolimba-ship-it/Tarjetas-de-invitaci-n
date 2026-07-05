import { V3ThemeConfig } from '../themeTypes';

export const editorialBeige: V3ThemeConfig = {
  id: 'editorial-beige',
  name: 'Editorial Almond Beige',
  fontTitle: 'Playfair Display',
  fontBody: 'Outfit',
  spacing: {
    sectionPadding: 'py-16 px-6 md:py-24 md:px-12',
    itemGap: 'gap-8',
    cardPadding: 'p-8 md:p-12',
  },
  shadows: {
    card: 'shadow-[0_4px_20px_rgba(130,110,90,0.03)]',
    button: 'shadow-none',
  },
  borders: {
    radius: 'rounded-2xl',
    style: 'border-amber-200/50',
    cardBorder: 'border border-[#E4DCD0]',
  },
  colors: {
    background: 'bg-[#F5EFEB] text-[#4A3B32]',
    textPrimary: 'text-[#4A3B32]',
    textSecondary: 'text-[#7D6B5F]',
    accent: '#B08E72', // Warm copper/caramel
    accentHover: '#8C6C52',
    border: 'border-[#E4DCD0]',
    cardBg: 'bg-[#FAF6F2]',
    overlayBg: 'bg-[#EFE9E4]/96',
    inputBg: 'bg-[#EAE2DB]',
  },
  animation: {
    transition: 'transition-all duration-700 ease-out',
  },
  button: {
    base: 'font-sans tracking-widest uppercase text-xs px-8 py-3.5 transition-all duration-300 font-bold border rounded-xl',
    primary: 'bg-[#B08E72] text-white border-[#B08E72] hover:bg-[#8C6C52] hover:tracking-[0.14em]',
    outline: 'bg-transparent text-[#4A3B32] border-[#C8BDB0] hover:border-[#B08E72] hover:bg-[#EAE2DB]',
  },
  card: {
    base: 'border border-[#E4DCD0] p-8 md:p-12 bg-[#FAF6F2] rounded-2xl',
    luxury: 'border border-[#D6C7B7] p-8 md:p-12 bg-[#FAF6F2] rounded-2xl relative after:absolute after:inset-1.5 after:border after:border-[#E4DCD0]/60 after:pointer-events-none after:rounded-xl',
    glass: 'border border-white/50 p-8 md:p-12 bg-white/70 backdrop-blur-md rounded-2xl',
    floating: 'border border-[#E4DCD0]/50 p-8 md:p-12 bg-[#FAF6F2] rounded-2xl shadow-md hover:translate-y-[-4px] transition-transform duration-300',
    paper: 'border-b-2 border-[#B08E72]/60 p-8 md:p-12 bg-[#F6ECE2] rounded-none shadow-sm',
  },
  divider: {
    gold: 'border-t border-[#E4DCD0] my-8 w-24 mx-auto relative after:absolute after:w-1.5 after:h-1.5 after:bg-[#B08E72] after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full',
    olive: 'border-t border-[#E4DCD0] my-8 w-32 mx-auto flex items-center justify-center text-[#7D6B5F] gap-1 before:content-["🌿"] before:text-xs',
    minimal: 'border-t border-[#E4DCD0] my-8 w-16 mx-auto',
    floral: 'border-t border-[#E4DCD0] my-8 w-32 mx-auto flex items-center justify-center text-[#4A3B32] gap-1 before:content-["🍂"] before:text-xs',
    luxury: 'border-t border-[#E4DCD0] my-8 w-32 mx-auto flex items-center justify-center relative after:absolute after:content-["✨_🌾_✨"] after:text-[9px] after:bg-[#F5EFEB] after:px-2',
  },
};

import { V3ThemeConfig } from '../themeTypes';

export const editorialRose: V3ThemeConfig = {
  id: 'editorial-rose',
  name: 'Editorial Dusty Rose',
  fontTitle: 'Alex Brush',
  fontBody: 'Lora',
  spacing: {
    sectionPadding: 'py-16 px-6 md:py-24 md:px-12',
    itemGap: 'gap-8',
    cardPadding: 'p-8 md:p-12',
  },
  shadows: {
    card: 'shadow-[0_4px_25px_rgba(200,150,150,0.02)]',
    button: 'shadow-none',
  },
  borders: {
    radius: 'rounded-2xl',
    style: 'border-rose-100',
    cardBorder: 'border border-[#F2E5E1]',
  },
  colors: {
    background: 'bg-[#FAF3F0] text-[#5C3E35]',
    textPrimary: 'text-[#5C3E35]',
    textSecondary: 'text-[#8F6B61]',
    accent: '#D08C82', // Dusty Rose Gold
    accentHover: '#B56D63',
    border: 'border-[#EAD2CB]',
    cardBg: 'bg-[#FFF9F7]',
    overlayBg: 'bg-[#F2E2DE]/96',
    inputBg: 'bg-[#EBD0C9]',
  },
  animation: {
    transition: 'transition-all duration-700 ease-out',
  },
  button: {
    base: 'font-sans tracking-widest uppercase text-xs px-8 py-3.5 transition-all duration-300 font-bold border rounded-full',
    primary: 'bg-[#D08C82] text-white border-[#D08C82] hover:bg-[#B56D63] hover:tracking-[0.14em]',
    outline: 'bg-transparent text-[#5C3E35] border-[#D08C82] hover:border-[#B56D63] hover:bg-[#EBD0C9]',
  },
  card: {
    base: 'border border-[#EAD2CB] p-8 md:p-12 bg-[#FFF9F7] rounded-2xl',
    luxury: 'border border-[#DDAFA3] p-8 md:p-12 bg-[#FFF9F7] rounded-2xl relative after:absolute after:inset-1.5 after:border after:border-[#EAD2CB]/40 after:pointer-events-none after:rounded-xl',
    glass: 'border border-white/40 p-8 md:p-12 bg-white/50 backdrop-blur-md rounded-2xl',
    floating: 'border border-[#EAD2CB]/30 p-8 md:p-12 bg-[#FFF9F7] rounded-2xl shadow-md hover:translate-y-[-4px] transition-transform duration-300',
    paper: 'border-b-2 border-[#D08C82]/60 p-8 md:p-12 bg-[#FFF2EE] rounded-none shadow-sm',
  },
  divider: {
    gold: 'border-t border-[#EAD2CB] my-8 w-24 mx-auto relative after:absolute after:w-1.5 after:h-1.5 after:bg-[#D08C82] after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full',
    olive: 'border-t border-[#EAD2CB] my-8 w-32 mx-auto flex items-center justify-center text-[#8F6B61] gap-1 before:content-["🌸"] before:text-xs',
    minimal: 'border-t border-[#EAD2CB] my-8 w-16 mx-auto',
    floral: 'border-t border-[#EAD2CB] my-8 w-32 mx-auto flex items-center justify-center text-[#5C3E35] gap-1 before:content-["🌹"] before:text-xs',
    luxury: 'border-t border-[#EAD2CB] my-8 w-32 mx-auto flex items-center justify-center relative after:absolute after:content-["❦_❦_❦"] after:text-[10px] after:bg-[#FAF3F0] after:px-2 after:text-[#D08C82]',
  },
};

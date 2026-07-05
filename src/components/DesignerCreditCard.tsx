import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';

interface DesignerCreditCardProps {
  styleId?: string;
}

export function DesignerCreditCard({ styleId }: DesignerCreditCardProps) {
  // Only display for the premium custom templates (any starting with "editorial" or containing "premium", "v2", "v3")
  const isPremium = styleId && (
    styleId.toLowerCase().startsWith('editorial') || 
    styleId.toLowerCase().includes('v2') || 
    styleId.toLowerCase().includes('v3') || 
    styleId.toLowerCase().includes('premium') ||
    styleId.toLowerCase() === 'elegante'
  );

  if (!isPremium) return null;

  const isDark = styleId.includes('black') || styleId.includes('navy');
  const isOlive = styleId.includes('olive');

  let containerClasses = 'bg-white border-[#E9E3DA] text-[#2D2D2D]';
  let monoTextClasses = 'text-[#777777]';
  let dividerClasses = 'bg-[#E9E3DA]';
  let mainButtonClasses = 'bg-[#2D2D2D] hover:bg-[#1E1E1E] text-white';

  if (isDark) {
    containerClasses = 'bg-[#161616] border-stone-800 text-[#FAF8F5]';
    monoTextClasses = 'text-stone-400';
    dividerClasses = 'bg-stone-800';
    mainButtonClasses = 'bg-[#FAF8F5] hover:bg-[#EBE9E5] text-[#111111]';
  } else if (isOlive) {
    containerClasses = 'bg-white border-[#E6E1D8] text-[#3D3A35]';
    monoTextClasses = 'text-[#706B62]';
    dividerClasses = 'bg-[#E6E1D8]';
    mainButtonClasses = 'bg-[#5C6454] hover:bg-[#717B67] text-[#FAF8F5]';
  }

  return (
    <div className="w-full max-w-2xl px-4 mt-8 mb-12 animate-fade-in mx-auto">
      <div className={`rounded-[32px] p-6 sm:p-8 border shadow-xs text-center flex flex-col items-center ${containerClasses}`}>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#C7A873] font-bold">Tarjeta Familiar</p>
        <p className={`text-[8px] mt-1 font-mono ${monoTextClasses}`}>EDITORIAL COLLECTION • V1.0</p>
        
        <div className={`w-16 h-[1px] my-4 ${dividerClasses}`}></div>
        
        <p className="text-xs font-bold tracking-wide">
          Diseño de Plantilla por <span class="font-extrabold text-[#C7A873]">Hans Lavin</span>
        </p>
        <p className={`text-[10px] mt-1.5 leading-relaxed max-w-sm ${monoTextClasses}`}>
          ¿Te gustó este diseño? Contáctame para crear plantillas y diseños 100% personalizados para tus eventos especiales.
        </p>
        
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <a 
            href="mailto:hanslavinmusic@gmail.com" 
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider px-5 py-3 rounded-full transition-all shadow-3xs ${mainButtonClasses}`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>hanslavinmusic@gmail.com</span>
          </a>
          <a 
            href="https://wa.me/56967394214" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-[10px] font-bold uppercase tracking-wider px-5 py-3 rounded-full transition-all shadow-3xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp: +56967394214</span>
          </a>
        </div>
      </div>
    </div>
  );
}

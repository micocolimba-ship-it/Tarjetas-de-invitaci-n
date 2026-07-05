import React, { useState, useEffect } from 'react';
import { EventData, CustomTemplate } from '../types';
import { Sparkles, Mail, Heart, ArrowRight } from 'lucide-react';

export function getDynamicInitials(hostName: string): string {
  if (!hostName) return 'H&C';
  
  // Try splitting by common connectors
  const connectors = /\s*(?:&| y | and |\+|,)\s*/i;
  const parts = hostName.split(connectors).map(p => p.trim()).filter(Boolean);
  
  if (parts.length >= 2) {
    // If we have 2 or more distinct hosts split by connector, take first letter of each
    const initials = parts.map(part => {
      const words = part.split(/\s+/).filter(w => !['de', 'del', 'la', 'las', 'los', 'y', 'e', 'o', 'u', 'with', 'con'].includes(w.toLowerCase()));
      return words[0] ? words[0].charAt(0).toUpperCase() : '';
    }).filter(Boolean);
    
    if (initials.length === 2) {
      return `${initials[0]}&${initials[1]}`;
    }
    return initials.slice(0, 3).join('');
  }
  
  // Single host name, e.g., "Abuelito Juan" or "Familia Lavin"
  const words = hostName.split(/\s+/).filter(w => !['de', 'del', 'la', 'las', 'los', 'y', 'e', 'o', 'u', 'with', 'con'].includes(w.toLowerCase()));
  if (words.length >= 2) {
    const i1 = words[0].charAt(0).toUpperCase();
    const i2 = words[1].charAt(0).toUpperCase();
    return `${i1}&${i2}`;
  } else if (words.length === 1 && words[0]) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return 'H&C';
}

interface InvitationExperienceProps {
  event: EventData;
  imageUrl: string;
  isMobileSize?: boolean;
  customTemplates?: CustomTemplate[];
  onOpen?: () => void;
  children: React.ReactNode;
}

export default function InvitationExperience({
  event,
  imageUrl,
  isMobileSize = false,
  customTemplates = [],
  onOpen,
  children
}: InvitationExperienceProps) {
  const isEnabled = event.envelopeExperience === 'elegant' || (event.musicConfig?.enabled && !!event.musicConfig?.audioUrl);
  const [isOpen, setIsOpen] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'opening' | 'sliding' | 'fading' | 'opened'>('idle');

  // Reset experience state when event style or ID changes to allow testing in real-time inside Admin Panel
  useEffect(() => {
    setIsOpen(false);
    setAnimationPhase('idle');
  }, [event.id, event.style, event.envelopeExperience]);

  if (!isEnabled) {
    return <>{children}</>;
  }

  // Fallback / default configurations for the envelope
  const defaultEnvelopeColor = event.style === 'editorial-black-v1' 
    ? '#161616' 
    : (event.style === 'editorial-olive-v1' ? '#DCD7CE' : '#FAF8F5');
  const envelopeColor = event.envelopeColor || defaultEnvelopeColor;
  const envelopeSeal = event.envelopeSeal || getDynamicInitials(event.hostName); // Initial monogram default
  const guestName = event.guestName || 'Querida Familia y Amigos';

  // Check if the selected color is very light (white, cream, ivory etc.) to adjust contrast
  const isLightColor = envelopeColor.toLowerCase() === '#faf8f5' || envelopeColor.toLowerCase() === '#ffffff' || envelopeColor.toLowerCase() === '#fff' || envelopeColor.toLowerCase() === '#fcfcfc' || envelopeColor.toLowerCase() === '#dcd7ce' || envelopeColor.toLowerCase() === '#eae5da';

  // Extract a sutil darker/lighter version or secondary color
  const darkerEnvelopeColor = adjustColorBrightness(envelopeColor, isLightColor ? -15 : -20);
  const lighterEnvelopeColor = adjustColorBrightness(envelopeColor, isLightColor ? 5 : 20);

  // Wax seal styling based on event template style
  const isOliveStyle = event.style === 'editorial-olive-v1';
  const sealStyle = isOliveStyle
    ? {
        backgroundColor: '#5C6454', // Olive-green wax seal
        backgroundImage: 'radial-gradient(circle, #717B67 0%, #4B5244 100%)',
        boxShadow: '0 4px 10px rgba(92, 100, 84, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
        borderColor: '#D4AF37' // Golden relief
      }
    : {
        backgroundColor: '#D4AF37', // Gold wax seal
        backgroundImage: 'radial-gradient(circle, #E6C655 0%, #B8972C 100%)',
        boxShadow: '0 4px 10px rgba(184, 151, 44, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
        borderColor: 'rgba(251, 191, 36, 0.3)'
      };

  const handleOpen = () => {
    if (animationPhase !== 'idle') return;

    // Trigger onOpen immediately on click/user interaction
    if (onOpen) {
      onOpen();
    }

    setAnimationPhase('opening');
    setIsOpen(true);

    // Phase 1: Opening top flap (600ms)
    setTimeout(() => {
      setAnimationPhase('sliding');

      // Phase 2: Sliding the card out (900ms)
      setTimeout(() => {
        setAnimationPhase('fading');

        // Phase 3: Fading out the envelope container (600ms)
        setTimeout(() => {
          setAnimationPhase('opened');
        }, 600);
      }, 950);
    }, 650);
  };

  if (animationPhase === 'opened') {
    return (
      <div className="animate-fade-in duration-700">
        {children}
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-700 select-none ${
        isMobileSize ? 'min-h-[90vh] py-8 px-3' : 'min-h-[85vh] py-10 px-4'
      } ${
        animationPhase === 'fading' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: `radial-gradient(circle, ${envelopeColor}1a 0%, #FAF8F5 100%)`,
        perspective: '1200px'
      }}
    >
      {/* Decorative ambient background lights */}
      <div 
        className="absolute w-48 h-48 sm:w-72 sm:h-72 rounded-full filter blur-3xl opacity-20 animate-pulse pointer-events-none" 
        style={{ backgroundColor: envelopeColor, top: '10%', left: '10%' }}
      />
      <div 
        className="absolute w-48 h-48 sm:w-72 sm:h-72 rounded-full filter blur-3xl opacity-15 animate-pulse pointer-events-none" 
        style={{ backgroundColor: lighterEnvelopeColor, bottom: '10%', right: '10%', animationDelay: '1.5s' }}
      />

      {/* Greeting / Instruction Text */}
      <div className="text-center mb-8 px-4 z-10 flex flex-col items-center max-w-sm">
        <span 
          className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-3 flex items-center gap-1 shadow-2xs"
          style={{ 
            color: isLightColor ? '#8C7A5F' : envelopeColor, 
            borderColor: `${isLightColor ? '#8C7A5F' : envelopeColor}30`,
            backgroundColor: `${isLightColor ? '#8C7A5F' : envelopeColor}08`
          }}
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
          Invitación Digital Exclusiva
        </span>
        <p className="text-[9px] text-stone-400 font-black uppercase tracking-[0.2em] mb-1">
          Anfitriones
        </p>
        <h3 
          className="text-stone-900 text-[46px] sm:text-[56px] font-normal leading-none select-none px-2 text-center my-2 py-1 notranslate"
          translate="no"
          style={{ 
            fontFamily: '"Great Vibes", "Alex Brush", "Pinyon Script", cursive',
          }}
        >
          {event.hostName}
        </h3>
        <p className="text-[11px] sm:text-xs text-stone-500 font-bold mt-2 uppercase tracking-widest">
          {event.title}
        </p>
      </div>

      {/* THE 3D ENVELOPE STAGE */}
      <div 
        onClick={handleOpen}
        className={`relative w-[290px] sm:w-[350px] h-[210px] sm:h-[250px] cursor-pointer transition-all duration-500 transform-gpu ${
          animationPhase === 'idle' ? 'hover:scale-[1.03] active:scale-98 hover:-translate-y-1' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* ENVELOPE BACK FLAP & POCKET CONTAINER */}
        <div 
          className="absolute inset-0 rounded-2xl shadow-2xl transition-all duration-300"
          style={{
            backgroundColor: envelopeColor,
            zIndex: 10,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Inner pocket pattern / lining */}
          <div 
            className="absolute inset-x-1.5 bottom-1.5 top-1.5 rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center"
            style={{
              backgroundColor: '#FAF8F5',
              backgroundImage: `radial-gradient(${isLightColor ? '#8C7A5F' : envelopeColor}15 1px, transparent 1px), radial-gradient(${isLightColor ? '#8C7A5F' : envelopeColor}15 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 8px 8px'
            }}
          >
            {/* Elegant text inside the envelope lining */}
            <span className="text-[10px] uppercase tracking-widest opacity-25 font-black text-stone-700">
              Con cariño y alegría
            </span>
          </div>

          {/* THE INVITATION CARD (Sliding Part) */}
          <div 
            className={`absolute left-3 right-3 h-[180px] sm:h-[220px] bg-white rounded-xl shadow-lg border border-stone-150 p-4 flex flex-col justify-between overflow-hidden transition-all ease-out ${
              animationPhase === 'idle' 
                ? 'bottom-2 opacity-50 scale-95 z-5' 
                : animationPhase === 'opening'
                ? 'bottom-2 opacity-80 scale-98 z-5'
                : 'bottom-4 opacity-100 z-20 shadow-2xl'
            }`}
            style={{
              transitionDuration: '900ms',
              transform: animationPhase === 'sliding' || animationPhase === 'fading'
                ? `translateY(-125%) scale(1.04)` 
                : 'translateY(0) scale(1)',
            }}
          >
            {/* Mini visual mockup of the card inside */}
            <div className="flex flex-col items-center text-center gap-1 mt-1">
              <span className="text-xl">✨</span>
              <h4 
                className="text-stone-800 text-xs font-black uppercase tracking-wider truncate w-full"
                style={{ fontFamily: 'Cinzel, Playfair Display, serif' }}
              >
                {event.title}
              </h4>
              <p className="text-[9px] text-[#8C7A5F] font-bold tracking-widest uppercase notranslate" translate="no">
                {event.hostName}
              </p>
            </div>

            {/* Thumbnail preview on the sliding card */}
            {imageUrl && (
              <div className="w-full h-16 sm:h-20 rounded-lg overflow-hidden border border-stone-100 my-1">
                <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="border-t border-stone-100 pt-2 flex justify-between items-center text-[8px] text-stone-400 font-bold uppercase tracking-wider">
              <span>{event.locationName}</span>
              <span>{event.date}</span>
            </div>
          </div>

          {/* FRONT FLAPS OVERLAY (Using precise inline styles/SVG to draw left, right and bottom pocket folds) */}
          <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden rounded-2xl">
            <svg viewBox="0 0 350 250" className="w-full h-full drop-shadow-[0_-5px_10px_rgba(0,0,0,0.15)]">
              {/* Bottom pocket shadow and color */}
              <polygon 
                points="0,125 175,250 350,125 350,250 0,250" 
                fill={darkerEnvelopeColor} 
                opacity="0.95"
              />
              {/* Left fold */}
              <polygon 
                points="0,0 175,125 0,250" 
                fill={envelopeColor} 
                opacity="0.9"
              />
              {/* Right fold */}
              <polygon 
                points="350,0 175,125 350,250" 
                fill={envelopeColor} 
                opacity="0.9"
              />
              {/* Bottom fold on top for a overlapping seam */}
              <polygon 
                points="0,250 175,115 350,250" 
                fill={adjustColorBrightness(envelopeColor, -10)} 
                opacity="0.98"
              />
            </svg>
          </div>

          {/* THE GUEST NAME BADGE (Printed on the front of the pocket) */}
          <div 
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[85%] bg-white/95 border border-stone-200/50 py-2 px-4 rounded-xl text-center shadow-md z-18 transition-all duration-300"
            style={{
              fontFamily: "'Dancing Script', 'Alex Brush', cursive",
              color: isLightColor ? '#8C7A5F' : darkerEnvelopeColor
            }}
          >
            <p className="text-[9px] text-stone-400 font-sans tracking-widest uppercase font-bold not-italic mb-0.5">Invitado Especial</p>
            <span className="text-sm sm:text-base font-bold italic block leading-tight truncate">
              {guestName}
            </span>
          </div>

          {/* TOP FLAP (Tapa Superior) - Folds open 3D style */}
          <div 
            className="absolute top-0 left-0 w-full h-[125px] origin-top transition-all duration-700 ease-in-out"
            style={{
              zIndex: animationPhase === 'idle' ? 30 : 5, // Must go behind card after sliding
              transformStyle: 'preserve-3d',
              transform: isOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
            }}
          >
            {/* Front of the flap (seen when closed) */}
            <div 
              className="absolute inset-0 backface-hidden"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <svg viewBox="0 0 350 125" className="w-full h-full drop-shadow-[0_8px_6px_rgba(0,0,0,0.15)]">
                <polygon points="0,0 175,125 350,0" fill={envelopeColor} />
              </svg>

              {/* WAX SEAL / EMBOSSED MONOGRAM on the tip of the flap */}
              <div 
                className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-12 h-12 sm:w-[53px] sm:h-[53px] rounded-full flex items-center justify-center shadow-lg border-2 transition-transform duration-300 ${
                  animationPhase === 'idle' ? 'animate-pulse hover:scale-110' : ''
                }`}
                style={sealStyle}
              >
                {/* Heart, Stars or custom letters */}
                {envelopeSeal === 'heart' ? (
                  <Heart className="w-[26px] h-[26px] text-white fill-white/20" />
                ) : envelopeSeal === 'sparkles' ? (
                  <Sparkles className="w-[26px] h-[26px] text-white fill-white/20" />
                ) : (
                  <span className="text-white text-[12px] sm:text-[13px] font-black uppercase tracking-wider font-mono">
                    {envelopeSeal.slice(0, 3)}
                  </span>
                )}
              </div>
            </div>

            {/* Back of the flap (seen when flipped open) */}
            <div 
              className="absolute inset-0 backface-hidden"
              style={{ transform: 'rotateX(180deg)' }}
            >
              <svg viewBox="0 0 350 125" className="w-full h-full">
                {/* Gold foil or textured interior for high luxury feel */}
                <polygon points="0,0 175,125 350,0" fill={lighterEnvelopeColor} />
              </svg>
            </div>

          </div>

        </div>
      </div>

      {/* Tap Instruction Button */}
      <div className="mt-8 z-10 text-center animate-bounce">
        <button 
          onClick={handleOpen}
          className="bg-stone-900 hover:bg-stone-850 text-white text-[11px] font-black px-6 py-3 rounded-full uppercase tracking-wider shadow-md transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Toca el sobre para abrir tu invitación</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CSS Backface Hidden helper styling */}
      <style>{`
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}

// Helper function to dynamically adjust color for shadows/gradients
function adjustColorBrightness(hex: string, percent: number): string {
  // Validate if proper hex color, if not return default fallback
  if (!hex || hex.charAt(0) !== '#') return hex;
  
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = Math.min(255, Math.max(0, R + percent));
  G = Math.min(255, Math.max(0, G + percent));
  B = Math.min(255, Math.max(0, B + percent));

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

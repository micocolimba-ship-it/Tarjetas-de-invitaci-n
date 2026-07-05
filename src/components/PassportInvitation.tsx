import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EventData, CustomTemplate } from '../types';
import { DesignerCreditCard } from './DesignerCreditCard';
import { 
  Plane, MapPin, Calendar, Clock, MessageSquare, Compass, 
  ChevronRight, Sparkles, Volume2, VolumeX, Mail, Gift, 
  ExternalLink, Ticket, Users, FileText, Camera, ArrowRight, Music
} from 'lucide-react';

interface PassportInvitationProps {
  event: EventData;
  imageUrl: string;
  isMobileSize: boolean;
  customTemplates: CustomTemplate[];
  onOpen?: () => void;
}

export default function PassportInvitation({
  event,
  imageUrl,
  isMobileSize,
  customTemplates,
  onOpen
}: PassportInvitationProps) {
  // Navigation states
  const [stage, setStage] = useState<'cover' | 'opening' | 'inside' | 'transition' | 'dashboard'>('cover');
  const [openingProgress, setOpeningProgress] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Stamp Effect states
  const [showStampReveal, setShowStampReveal] = useState(false);
  const [stampPlaced, setStampPlaced] = useState(false);

  // Web Audio Stamp Synthesizer Sound
  const playStampSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Impact thud (low frequency sine wave decaying fast)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.18);
      
      gainNode.gain.setValueAtTime(0.9, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
      
      // Paper strike noise (bandpass filtered white noise)
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 350;
      filter.Q.value = 1.2;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      
      noise.start();
      noise.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.log('Web Audio synthesis failed or blocked:', e);
    }
  };

  // Direct RSVP Form States
  const [guestName, setGuestName] = useState('');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [companions, setCompanions] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState('');

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // References
  const audioContextRef = useRef<AudioContext | null>(null);

  // Dynamic Navigation URLs from current event data
  const destinationParts = [];
  if (event.locationName) destinationParts.push(event.locationName);
  if (event.locationAddress) destinationParts.push(event.locationAddress);
  const destinationQuery = destinationParts.join(', ').trim();

  const computedMapsUrl = destinationQuery 
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`
    : (event.locationMapsUrl || 'https://maps.google.com');

  const computedWazeUrl = destinationQuery
    ? `https://waze.com/ul?q=${encodeURIComponent(destinationQuery)}&navigate=yes`
    : 'https://waze.com';

  // Dynamic WhatsApp Confirmation Message
  const whatsappNumber = event.whatsappContact || '';
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const confirmText = `¡Hola! Confirmo con mucha alegría mi asistencia a la celebración de los 50 años de Lina María Arias. ¡Nos vemos pronto! ✈️`;
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(confirmText)}`
    : `https://wa.me/?text=${encodeURIComponent(confirmText)}`;

  // Google Calendar URL Setup
  let calendarUrl = 'https://calendar.google.com';
  try {
    const rawDate = event.date || '2026-11-28';
    const rawTime = event.time || '17:30';
    const dateObj = new Date(`${rawDate}T${rawTime}:00`);
    
    if (!isNaN(dateObj.getTime())) {
      const startDateStr = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
      const endDateObj = new Date(dateObj.getTime() + 4 * 60 * 60 * 1000); // 4 hour celebration duration
      const endDateStr = endDateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
      
      calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Celebración 50 Años - Lina María Arias Rincón')}&dates=${startDateStr}/${endDateStr}&details=${encodeURIComponent('Los mejores viajes no siempre nos llevan a nuevos lugares. Algunos simplemente celebran el camino recorrido. ¡Acompáñanos a celebrar los 50 años de Lina!')}&location=${encodeURIComponent(destinationQuery)}`;
    }
  } catch (err) {
    console.error('Calendar generation error:', err);
  }

  // Handle countdown calculation
  useEffect(() => {
    const targetDate = new Date(`${event.date || '2026-11-28'}T${event.time || '17:30'}:00`).getTime();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const difference = targetDate - now;
      
      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [event.date, event.time]);

  // Handle Passport Opening sequence
  const handleOpenPassport = () => {
    setOpeningProgress(true);
    setStage('opening');
    
    if (onOpen) {
      onOpen();
    }
    
    // Smooth timing for page open flip sequence
    setTimeout(() => {
      setStage('inside');
      setOpeningProgress(false);
    }, 1500);
  };

  const startJourney = () => {
    setStage('transition');
    
    // Automatically advance from transition narrative to Boarding Pass Dashboard
    setTimeout(() => {
      setStage('dashboard');
      // Trigger the gold stamp "WOW" scene 600ms after dashboard loads
      setTimeout(() => {
        setShowStampReveal(true);
      }, 600);
    }, 5500);
  };

  // Gallery memories (default travel inspired fallbacks if event gallery is empty)
  const defaultMemories = [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=600',
  ];

  const galleryList = event.galleryImages && event.galleryImages.filter(Boolean).length > 0 
    ? event.galleryImages.filter(Boolean) 
    : defaultMemories;

  const displayHostName = event.hostName || 'Lina María Arias Rincón';
  const displayTitle = event.title || 'Celebración de 50 Años';
  const formattedDate = event.date 
    ? new Date(`${event.date}T00:00:00`).toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : 'Sábado 28 de Noviembre de 2026';

  const handleDirectRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || attending === null) return;
    setSubmittingRsvp(true);

    try {
      const response = await fetch('/api/rsvps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 'rsvp-' + Date.now(),
          eventId: event.id,
          guestName: guestName.trim(),
          attending: attending,
          companions: attending ? companions : 0,
          comment: comment.trim(),
          googleSheetsUrl: event.googleSheetsUrl
        })
      });

      if (response.ok) {
        setRsvpSuccess(`¡Asistencia registrada con éxito, ${guestName.trim()}!`);
      } else {
        alert('Hubo un problema al registrar tu asistencia. Por favor, inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Error submitting RSVP in Passport:', err);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setSubmittingRsvp(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#1a0e13] text-[#fbf7f4] font-sans overflow-x-hidden selection:bg-[#c7a75c]/20 selection:text-[#fbf7f4] relative flex flex-col items-center">
      
      {/* Dynamic Background Atmospheric Lighting Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] aspect-square rounded-full bg-[#5b1425] blur-[150px] opacity-45 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] aspect-square rounded-full bg-[#4e3620] blur-[150px] opacity-35 pointer-events-none" />

      {/* Embedded High Craft Styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-4px, 2px) rotate(-0.5deg); }
          20% { transform: translate(3px, -2px) rotate(1deg); }
          30% { transform: translate(-3px, 1px) rotate(-1deg); }
          40% { transform: translate(2px, 1px) rotate(0.5deg); }
          50% { transform: translate(-1px, -1px) rotate(-0.5deg); }
          60% { transform: translate(1px, 1px) rotate(0deg); }
          75% { transform: translate(-1px, 0px) rotate(0deg); }
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
        .animate-dash {
          stroke-dasharray: 8, 8;
          animation: dash 35s linear infinite;
        }
        .text-shadow-gold {
          text-shadow: 0 0 10px rgba(199, 167, 92, 0.4), 0 0 20px rgba(199, 167, 92, 0.2);
        }
      `}</style>

      {/* Luxury Background Ornaments */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {/* Ancient-inspired Map Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#c7a75c_1px,transparent_1px),linear-gradient(to_bottom,#c7a75c_1px,transparent_1px)] bg-[size:48px_48px]" />
        
        {/* Slow Rotating Luxury Compass Rose */}
        <div className="absolute top-12 right-[-80px] w-80 h-80 rounded-full border border-[#c7a75c]/5 flex items-center justify-center animate-spin-slow opacity-20">
          <div className="w-72 h-72 rounded-full border border-dashed border-[#c7a75c]/10" />
          <div className="absolute w-full h-[1px] bg-[#c7a75c]/5" />
          <div className="absolute h-full w-[1px] bg-[#c7a75c]/5" />
          <Compass className="w-12 h-12 text-[#c7a75c]/10" />
        </div>

        {/* Vintage Coordinates around the screen edges */}
        <div className="absolute left-8 top-1/4 text-[8px] font-mono text-[#c7a75c]/10 uppercase tracking-[0.25em] rotate-90 origin-left hidden lg:block">
          FLIGHT COORD: 4.5709° N, 74.2973° W // ALTITUDE: 35000 FT
        </div>
        <div className="absolute right-8 bottom-1/4 text-[8px] font-mono text-[#c7a75c]/10 uppercase tracking-[0.25em] -rotate-90 origin-right hidden lg:block">
          LINA-50 GOLDEN JUBILEE // ROYAL FIRST CLASS
        </div>

        {/* Elegant flight vector path */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M -100,250 Q 300,80 850,450 T 1900,120" 
            fill="none" 
            stroke="#c7a75c" 
            strokeWidth="1" 
            className="animate-dash"
          />
          <path 
            d="M 150,900 Q 600,600 1300,950" 
            fill="none" 
            stroke="#c7a75c" 
            strokeWidth="0.75" 
            strokeDasharray="4,8" 
          />
        </svg>

        {/* Floating warm-lit sparks & sparkles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#c7a75c]/30"
            style={{
              width: (Math.random() * 2.5 + 1) + 'px',
              height: (Math.random() * 2.5 + 1) + 'px',
              left: (Math.random() * 100) + '%',
              top: (Math.random() * 100) + '%',
            }}
            animate={{
              y: [0, -35, 0],
              opacity: [0.15, 0.7, 0.15],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: Math.random() * 7 + 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 6,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* STAGE 1: PASSPORT COVER ON WARM LIT TABLE */}
        {stage === 'cover' && (
          <motion.div 
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full flex flex-col items-center justify-center p-4 py-12 relative z-10"
          >
            {/* Table shadow vignette */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#0a0507]/90 pointer-events-none" />

            <div className="text-center mb-8 max-w-sm">
              <span className="text-[10px] tracking-[0.3em] text-[#c7a75c] uppercase font-extrabold block mb-1">PRIMERA CLASE</span>
              <h2 className="text-[15px] font-bold text-stone-200 tracking-[0.15em] uppercase">CELEBRACIÓN DEL VIAJE DE UNA VIDA</h2>
            </div>

            {/* Luxurious Passport Body */}
            <button
              onClick={handleOpenPassport}
              className="w-full max-w-[320px] aspect-[1/1.48] bg-[#4a0d1a] border-[1.5px] border-[#c7a75c]/30 rounded-[18px] p-6 text-left flex flex-col justify-between relative shadow-[0_25px_50px_rgba(0,0,0,0.55)] cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] hover:border-[#c7a75c]/60 group perspective-1000"
              style={{
                background: 'linear-gradient(135deg, #5b1425 0%, #3e0915 100%)',
                boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)'
              }}
            >
              {/* Gold foil reflections */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-[#c7a75c] to-transparent rotate-12 -translate-y-full group-hover:translate-y-full transform ease-out" />
              
              {/* Outer decorative borders in gold foil */}
              <div className="absolute inset-3.5 border border-[#c7a75c]/25 rounded-[12px] pointer-events-none" />
              <div className="absolute inset-4 border-[0.5px] border-[#c7a75c]/15 rounded-[10px] pointer-events-none" />

              {/* Passport Top Branding */}
              <div className="text-center mt-6 relative z-10 flex flex-col items-center">
                <p className="text-[10px] font-semibold tracking-[0.45em] text-[#c7a75c] uppercase text-shadow-gold">SPECIAL PASSPORT</p>
                <div className="w-12 h-[1px] bg-[#c7a75c]/30 mx-auto my-1.5" />
                <span className="text-[8px] font-mono tracking-[0.2em] text-[#c7a75c]/80 uppercase bg-black/30 px-2 py-0.5 rounded border border-[#c7a75c]/20">GOLDEN EDITION</span>
              </div>

              {/* Large Embossed Airplane / Coat of Arms Symbol */}
              <div className="my-auto flex flex-col items-center justify-center relative z-10 gap-3 py-6">
                <div className="w-20 h-20 rounded-full border-2 border-[#c7a75c]/40 flex items-center justify-center relative bg-gradient-to-b from-[#5b1425] to-[#29050d] shadow-[0_0_15px_rgba(199,167,92,0.15)]">
                  {/* Huge "50" etched behind the plane */}
                  <span className="absolute text-3xl font-serif font-black text-[#c7a75c]/10 tracking-widest select-none">50</span>
                  <Plane className="w-9 h-9 text-[#c7a75c] transform rotate-45 animate-pulse" />
                </div>
                <div className="text-center">
                  <span className="text-[10px] tracking-[0.25em] text-[#c7a75c] font-black uppercase block">CINCUENTA ANIVERSARIO</span>
                  <span className="text-[8px] tracking-[0.15em] text-stone-300 uppercase block mt-0.5">EL VIAJE DE UNA VIDA</span>
                </div>
              </div>

              {/* Passenger Dynamic Details */}
              <div className="mb-6 relative z-10">
                <p className="text-[10px] text-stone-300 font-medium tracking-widest uppercase text-center mb-1">Invitado de Honor</p>
                <p className="text-lg font-serif text-[#c7a75c] text-center tracking-wide font-medium notranslate" translate="no" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
                  {displayHostName}
                </p>
                <div className="flex justify-center items-center gap-1.5 mt-4 text-[9px] text-stone-400 font-semibold tracking-[0.2em] uppercase bg-black/25 py-1.5 px-3.5 rounded-full border border-white/5 w-fit mx-auto animate-pulse">
                  <span>TOCA PARA ABRIR</span>
                  <ChevronRight className="w-3 h-3 text-[#c7a75c]" />
                </div>
              </div>
            </button>

            {/* Atmosphere Footnote */}
            <p className="text-[10px] text-stone-400 font-medium tracking-wider mt-8 uppercase">
              ✦ INICIANDO UN VIAJE EXTRAORDINARIO ✦
            </p>
          </motion.div>
        )}

        {/* STAGE 2 & 3: OPENING ANIMATION AND INNER PAGES VIEW */}
        {(stage === 'opening' || stage === 'inside') && (
          <motion.div 
            key="inside"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center p-3 sm:p-6 py-8 relative z-10"
          >
            {/* Passport Book Open Spread */}
            <div className="w-full relative flex flex-col lg:flex-row bg-[#FAF8F5] text-stone-850 rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-[0_30px_70px_rgba(0,0,0,0.7)]">
              
              {/* Left Spread: Personal Photo & Stamp Overlay */}
              <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col items-center justify-between bg-[#efebd8]/10 border-b lg:border-b-0 lg:border-r border-[#EBE5DA] relative">
                {/* Micro guilloche pattern for luxury ticket feel */}
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-radial-gradient from-stone-900 to-transparent" />

                {/* Subheading stamp of origin */}
                <div className="w-full flex justify-between items-center mb-6 text-[10px] font-bold text-stone-600 tracking-wider">
                  <span className="font-mono flex items-center gap-1">✈️ REGISTRO OFICIAL</span>
                  <span className="text-[#5b1425] font-serif font-black tracking-wide bg-[#c7a75c]/20 px-2 py-0.5 rounded border border-[#c7a75c]/40">GOLDEN NO. 50</span>
                </div>

                {/* Passport Portrait Frame */}
                <div className="relative w-full max-w-[210px] aspect-[4/5] bg-stone-100 border-4 border-white shadow-md rounded-lg overflow-hidden flex-shrink-0 group">
                  <img 
                    src={imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'} 
                    alt={displayHostName} 
                    className="w-full h-full object-cover grayscale contrast-110 sepia-[20%] transition-transform duration-[4000ms] group-hover:scale-105"
                  />
                  {/* Digital Signature line overlay */}
                  <div className="absolute bottom-3 left-4 right-4 bg-black/45 backdrop-blur-xs border border-white/20 rounded py-1 px-2 shadow-sm">
                    <p className="text-[18px] sm:text-[20px] leading-none text-center font-cursive tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] truncate px-1 notranslate" translate="no" style={{ fontFamily: "'Great Vibes', 'Alex Brush', 'Pinyon Script', cursive" }}>
                      {displayHostName}
                    </p>
                  </div>
                  {/* Luxury Stamp overlay */}
                  <div className="absolute top-2 right-2 w-20 h-20 rounded-full border-2 border-dashed border-[#5b1425]/55 text-[#5b1425]/85 font-black text-[8px] flex flex-col items-center justify-center rotate-12 pointer-events-none select-none uppercase tracking-widest text-center p-1.5 font-mono bg-[#FAF8F5]/40 backdrop-blur-[0.5px]">
                    <span className="text-[7px]">CELEBRATION</span>
                    <span className="text-xs font-serif font-bold text-[#c7a75c]">50 YR</span>
                    <span className="text-[6px]">STAMPED OK</span>
                  </div>
                </div>

                {/* Beautiful descriptive note */}
                <div className="text-center mt-6 px-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-bold">PASAJERA DE HONOR</p>
                  <p className="text-lg font-serif font-black text-[#5b1425] mt-1 break-words max-w-[240px] mx-auto notranslate" translate="no">{displayHostName}</p>
                  <p className="text-[9px] font-serif text-stone-500 italic mt-2 leading-relaxed">
                    "Celebrando una vida extraordinaria, un camino lleno de cielos despejados, sueños cumplidos y la alegría de compartir cada escala."
                  </p>
                </div>
              </div>

              {/* Right Spread: Flight Specifications & Stamps */}
              <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between bg-white relative">
                {/* Visa stamps overlay */}
                <div className="absolute top-8 right-8 w-24 h-24 rounded-full border-2 border-[#c7a75c]/30 text-[#c7a75c]/70 text-[8px] flex flex-col items-center justify-center font-mono rotate-[-15deg] pointer-events-none select-none uppercase tracking-wider font-bold bg-[#FAF8F5]/30">
                  <span className="text-[7px] tracking-widest text-[#5b1425]">EMBARQUE</span>
                  <span className="text-sm font-serif font-black my-0.5 text-[#5b1425]">★ 50 ★</span>
                  <span className="text-[6px] tracking-widest">ANIVERSARIO</span>
                </div>

                <div className="w-full flex justify-between items-center mb-6 text-[10px] font-bold text-stone-500 tracking-wider">
                  <span className="font-mono">CLASE: PRIMERA CLASE 50 ANIVERSARIO</span>
                  <span className="text-emerald-700 font-bold">CLASE DIPLOMÁTICA</span>
                </div>

                {/* Structured details in Table Style */}
                <div className="space-y-4 my-auto">
                  <div className="border-b border-stone-100 pb-2">
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">PASAJERA DE HONOR</span>
                    <span className="text-sm font-semibold text-stone-800 tracking-wide font-mono uppercase break-words notranslate" translate="no">{displayHostName}</span>
                  </div>
                  
                  <div className="border-b border-stone-100 pb-2">
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">DESTINO DE ENSUEÑO</span>
                    <span className="text-sm font-serif font-bold text-[#5b1425] break-words">{displayTitle}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b border-stone-100 pb-2">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">FECHA DEL GRAN DESPEGUE</span>
                      <span className="text-xs font-semibold text-stone-800 whitespace-nowrap">{event.date || '2026-11-28'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">HORA DE EMBARQUE (GATE)</span>
                      <span className="text-xs font-semibold text-stone-800 whitespace-nowrap">{event.time || '17:30'} Hrs</span>
                    </div>
                  </div>

                  <div className="pb-2">
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">COORDENADAS / DESTINO</span>
                    <span className="text-xs font-semibold text-stone-800 block break-words">{event.locationName || 'Centro de Eventos'}</span>
                    <span className="text-[10px] text-stone-500 block break-words mt-0.5">{event.locationAddress || 'Dirección del Evento'}</span>
                  </div>
                </div>

                {/* Start Journey Trigger CTA */}
                <div className="mt-8 pt-4 border-t border-stone-100 flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-mono text-[10px] font-bold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="whitespace-nowrap">EMBARQUE INMEDIATO</span>
                  </div>
                  
                  <button
                    onClick={startJourney}
                    className="w-full sm:w-auto bg-[#5b1425] hover:bg-[#4a0d1a] text-white text-xs font-extrabold px-6 py-3 rounded-full flex items-center justify-center gap-2 tracking-widest uppercase transition-all duration-300 shadow-md cursor-pointer hover:shadow-lg hover:scale-102 shrink-0"
                  >
                    <span className="whitespace-nowrap">Comenzar Viaje</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#c7a75c] shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE 4: TRANSITION STORYTELLING SCENE */}
        {stage === 'transition' && (
          <motion.div 
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center p-4 py-16 text-center relative z-10"
          >
            {/* Soft vignette overlay */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#0a0507]/95 pointer-events-none" />

            {/* Flying airplane paths */}
            <motion.div 
              initial={{ x: -100, y: 50, opacity: 0 }}
              animate={{ x: 100, y: -50, opacity: [0, 0.4, 0] }}
              transition={{ duration: 5, ease: "easeInOut" }}
              className="absolute pointer-events-none"
            >
              <Plane className="w-12 h-12 text-[#c7a75c]/25 transform rotate-45" />
            </motion.div>

            {/* Zooming and hovering memory photograph */}
            <motion.div
              initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
              animate={{ scale: 1, rotate: 2, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-64 aspect-[4/5] bg-stone-100 border-8 border-white rounded-lg shadow-2xl overflow-hidden mb-10 relative"
            >
              <img 
                src={imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'} 
                alt={displayHostName} 
                className="w-full h-full object-cover contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </motion.div>

            {/* Narrative Poetic message */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 1.2 }}
              className="space-y-4 px-4"
            >
              <span className="text-[28px] text-[#c7a75c] leading-none" style={{ fontFamily: "'Cinzel', serif" }}>“</span>
              <p className="text-lg sm:text-2xl font-serif text-[#fbf7f4]/95 font-light leading-relaxed tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                “Los mejores viajes de la vida no se miden en kilómetros, sino en las risas compartidas, los sueños cumplidos y los hermosos recuerdos que cargamos en el equipaje del alma. Cincuenta años de vuelo extraordinario, sembrando amor y trazando un destino maravilloso que hoy deseamos celebrar contigo.”
              </p>
              <div className="w-16 h-[1px] bg-[#c7a75c]/30 mx-auto mt-6" />
              <p className="text-[10px] tracking-[0.3em] text-[#c7a75c] uppercase font-bold mt-4 animate-pulse">AUTORIZANDO TU ACCESO DE EMBARQUE...</p>
            </motion.div>
          </motion.div>
        )}

        {/* STAGE 5: PREMIUM BOARDING PASS & BENTO ACTIONS DASHBOARD */}
        {stage === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-2xl px-3 sm:px-6 py-8 relative z-10 flex flex-col gap-6"
          >
            {/* SECTION 1: EMIRATES STYLE LUXURY BOARDING PASS TICKET */}
            <div className="w-full bg-white text-stone-850 rounded-[32px] overflow-hidden shadow-2xl border border-[#D4AF37]/25 relative flex flex-col select-none">
              
              {/* Boarding Pass Header banner */}
              <div className="bg-[#5b1425] text-[#fbf7f4] px-6 py-4 flex items-center justify-between border-b border-[#c7a75c]/25">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#c7a75c]" />
                  <span className="text-[10px] font-extrabold tracking-[0.25em] uppercase text-stone-200">LINA ARIAS GOLDEN JUBILEE</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md text-[#c7a75c] text-[8px] font-extrabold tracking-widest px-3 py-1 rounded-full border border-white/5 shadow-sm">
                  FIRST CLASS / 50 YEARS
                </div>
              </div>

              {/* Ticket Content Grid */}
              <div id="boarding-pass-card" className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                
                {/* Perforated lines divider decoration (Left vs right side of boarding pass) */}
                <div className="hidden md:block absolute right-[30%] top-4 bottom-4 border-l border-dashed border-stone-200" />

                {/* Permanent Golden Stamp Imprint */}
                {stampPlaced && (
                  <motion.div
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 0.9, scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                    className="absolute right-[24%] md:right-[34%] top-[10%] md:top-[12%] w-24 h-24 rounded-full border-2 border-dashed border-[#c7a75c]/60 text-[#c7a75c]/85 flex flex-col items-center justify-center font-serif rotate-[14deg] pointer-events-none select-none uppercase tracking-wider text-center p-1.5 bg-[#FAF8F5]/85 shadow-[0_4px_12px_rgba(199,167,92,0.15)] z-20"
                  >
                    <span className="text-[6px] font-mono tracking-widest font-bold text-stone-500">50 YEARS</span>
                    <span className="text-[10px] font-black text-[#5b1425] my-0.5 tracking-tighter">OFFICIALLY</span>
                    <span className="text-[10px] font-black text-[#5b1425] tracking-tighter leading-none">STAMPED</span>
                    <span className="text-[5px] font-mono text-[#c7a75c] mt-1 font-bold">APPROVED 2026</span>
                  </motion.div>
                )}

                {/* Flight route segment */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-5">
                  
                  {/* Airport flight initials mock style */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[26px] font-mono font-black text-[#5b1425] tracking-tighter leading-none">NCT</p>
                      <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">EL ORIGEN (1976)</p>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                      <div className="w-full h-[1px] bg-stone-200 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center">
                          <Plane className="w-4 h-4 text-[#c7a75c]" />
                        </div>
                      </div>
                      <p className="text-[8px] text-[#c7a75c] font-black uppercase tracking-widest mt-1.5">VUELO LINA-50</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[26px] font-mono font-black text-[#5b1425] tracking-tighter leading-none">50Y</p>
                      <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">DESTINO ORO (2026)</p>
                    </div>
                  </div>

                  {/* Flight Specifications in beautiful columns */}
                  <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-stone-100">
                    <div>
                      <p className="text-[9px] uppercase text-stone-400 font-bold tracking-wider mb-0.5">PASAJERA / PASSENGER</p>
                      <p className="font-extrabold text-stone-800 truncate notranslate" translate="no">{displayHostName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase text-stone-400 font-bold tracking-wider mb-0.5">VUELO / FLIGHT</p>
                      <p className="font-extrabold text-stone-800">CUMPL-50</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase text-stone-400 font-bold tracking-wider mb-0.5">SALIDA / DATE</p>
                      <p className="font-extrabold text-[#5b1425]">{formattedDate}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase text-stone-400 font-bold tracking-wider mb-0.5">HORARIO / GATE</p>
                      <p className="font-extrabold text-stone-800">{event.time || '17:30'} Hrs (EMBARQUE)</p>
                    </div>
                  </div>

                </div>

                {/* Small coupon / Right side seat info */}
                <div className="col-span-1 flex flex-col justify-between pt-4 md:pt-0 border-t md:border-t-0 border-stone-100 md:pl-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[9px] uppercase text-stone-400 font-bold tracking-wider">ASIENTO / SEAT</p>
                      <p className="text-xl font-mono font-black text-stone-850 leading-none mt-0.5">50A</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase text-stone-400 font-bold tracking-wider">LUGAR / COORD</p>
                      <p className="text-[11px] font-extrabold text-stone-800 truncate leading-tight mt-0.5">{event.locationName || 'Centro de Eventos'}</p>
                    </div>
                  </div>

                  {/* High fidelity barcode vector mock */}
                  <div className="pt-4 flex flex-col items-center">
                    <div className="w-full h-8 bg-gradient-to-r from-stone-900 via-stone-300 to-stone-900 opacity-85 rounded-sm" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #1c1917, #1c1917 2px, transparent 2px, transparent 6px, #1c1917 6px, #1c1917 8px)' }} />
                    <p className="text-[7px] text-stone-400 font-mono tracking-[0.4em] uppercase mt-1">LINA50YEARSCELEBRATION</p>
                  </div>
                </div>

              </div>
            </div>

            {/* SECTION 2: BENTO GRID INTERACTIVE CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* COUNTDOWN COMPONENT CARD */}
              <div className="p-5 sm:p-6 bg-[#3d0915] border border-[#c7a75c]/35 rounded-[28px] shadow-lg flex flex-col justify-between text-center min-h-[170px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#5b1425] rounded-full blur-xl opacity-50" />
                <p className="text-[10px] tracking-widest uppercase text-[#c7a75c] font-black mb-3">✨ TIEMPO PARA EL GRAN DESPEGUE</p>
                
                <div className="grid grid-cols-4 gap-1.5 z-10">
                  <div className="bg-black/25 backdrop-blur-xs p-2 rounded-xl border border-white/5 flex flex-col items-center">
                    <span className="text-lg font-mono font-black text-white tabular-nums">{timeLeft.days}</span>
                    <span className="text-[8px] text-stone-400 uppercase tracking-widest">Días</span>
                  </div>
                  <div className="bg-black/25 backdrop-blur-xs p-2 rounded-xl border border-white/5 flex flex-col items-center">
                    <span className="text-lg font-mono font-black text-white tabular-nums">{timeLeft.hours}</span>
                    <span className="text-[8px] text-stone-400 uppercase tracking-widest">Hrs</span>
                  </div>
                  <div className="bg-black/25 backdrop-blur-xs p-2 rounded-xl border border-white/5 flex flex-col items-center">
                    <span className="text-lg font-mono font-black text-white tabular-nums">{timeLeft.minutes}</span>
                    <span className="text-[8px] text-stone-400 uppercase tracking-widest">Min</span>
                  </div>
                  <div className="bg-black/25 backdrop-blur-xs p-2 rounded-xl border border-white/5 flex flex-col items-center">
                    <span className="text-lg font-mono font-black text-white tabular-nums">{timeLeft.seconds}</span>
                    <span className="text-[8px] text-stone-400 uppercase tracking-widest">Seg</span>
                  </div>
                </div>

                <p className="text-[10px] text-stone-400 mt-3 z-10">Para encender motores</p>
              </div>

              {/* REAL-TIME MAPS & NAVIGATION CARD */}
              <div className="p-5 sm:p-6 bg-stone-900/40 border border-white/10 rounded-[28px] shadow-lg flex flex-col justify-between min-h-[170px] group hover:border-[#c7a75c]/50 transition-colors duration-300 text-left">
                <div>
                  <div className="flex items-center gap-1 text-[#c7a75c] font-black text-[10px] tracking-widest uppercase mb-1">
                    <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>MAPA DE ESCALA</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">Coordenadas del Encuentro</h4>
                  <p className="text-[11px] text-stone-300 leading-relaxed truncate">{event.locationName || 'Ubicación'}</p>
                </div>

                {/* Direct buttons to both apps with precise real-time destination query mapping */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <a 
                    href={computedMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-[#4285F4] hover:bg-[#357ae8] text-white text-[10px] font-extrabold py-2 px-3 rounded-full text-center tracking-wider uppercase transition-all duration-300 shadow-sm flex items-center justify-center gap-1"
                  >
                    📍 Google Maps
                  </a>
                  <a 
                    href={computedWazeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-[#33CCFF] hover:bg-[#2bbfe6] text-stone-900 text-[10px] font-extrabold py-2 px-3 rounded-full text-center tracking-wider uppercase transition-all duration-300 shadow-sm flex items-center justify-center gap-1"
                  >
                    🚗 Waze GPS
                  </a>
                </div>
              </div>

              {/* ADD TO CALENDAR CARD */}
              <div className="p-5 sm:p-6 bg-stone-900/40 border border-white/10 rounded-[28px] shadow-lg flex flex-col justify-between min-h-[160px] group hover:border-[#c7a75c]/50 transition-colors duration-300 text-left">
                <div>
                  <span className="text-[10px] tracking-widest uppercase text-[#c7a75c] font-black block mb-1">📅 NUESTRO ITINERARIO</span>
                  <h4 className="text-sm font-bold text-white mb-1.5">Reserva tu Asiento</h4>
                  <p className="text-[11px] text-stone-300 leading-relaxed mb-4">Guarda este gran despegue en tu calendario para no perderte de nada.</p>
                </div>

                <a 
                  href={calendarUrl}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-extrabold py-2.5 rounded-full flex items-center justify-center gap-1.5 uppercase tracking-wider transition-all"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#c7a75c]" />
                  <span>Sellar en Calendario</span>
                </a>
              </div>

              {/* DRESS CODE CARD */}
              <div className="p-5 sm:p-6 bg-stone-900/40 border border-white/10 rounded-[28px] shadow-lg flex flex-col justify-between min-h-[160px] group hover:border-[#c7a75c]/50 transition-colors duration-300 text-left">
                <div>
                  <span className="text-[10px] tracking-widest uppercase text-[#c7a75c] font-black block mb-1">👔👗 VESTIMENTA DE GALA</span>
                  <h4 className="text-sm font-bold text-white mb-1.5">{event.dressCode || 'Formal / Elegante'}</h4>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {event.dressCodeDescription || 'Te sugerimos traje formal para caballeros y vestido de fiesta para damas.'}
                  </p>
                </div>
                <div className="mt-4 text-[9px] font-mono tracking-widest text-[#c7a75c]/70 uppercase">
                  CÓDIGO DE TRAJE RECOMENDADO
                </div>
              </div>

              {/* DIRECT RSVP FORM CARD - LUXURIOUS FULL-WIDTH SPLIT CARD */}
              <div className="col-span-1 sm:col-span-2 p-6 sm:p-8 bg-gradient-to-br from-[#3d0915] via-[#29050d] to-[#1a0106] border border-[#c7a75c]/40 rounded-[32px] shadow-xl relative overflow-hidden text-left">
                {/* Gold glows and background lines */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#c7a75c]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#5b1425]/30 rounded-full blur-2xl pointer-events-none" />
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                  
                  {/* Left Column: Emotional block inviting the user (6 cols) */}
                  <div className="md:col-span-6 flex flex-col justify-between pr-0 md:pr-6 md:border-r border-white/10 text-left pb-4 md:pb-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c7a75c] animate-pulse" />
                        <span className="text-[10px] tracking-[0.25em] uppercase text-[#c7a75c] font-black">TRIPULANTE DE HONOR</span>
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl font-serif font-black text-white leading-tight" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
                        Sella tu Pasaporte para esta Aventura
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-light">
                        Este viaje no estaría completo sin quienes han sido parte de mi ruta. Cada kilómetro de risas, cada sueño alcanzado y los hermosos recuerdos de estos <span className="text-[#c7a75c] font-bold">50 años</span> de vida brillan más gracias a ti.
                      </p>
                      <p className="text-xs text-[#c7a75c]/95 leading-relaxed italic font-serif">
                        Te invito a registrar tu asistencia y unirte como tripulante distinguido en esta noche mágica, donde celebraremos la vida, la amistad y los nuevos destinos. ¡Prepara tu equipaje de recuerdos!
                      </p>
                    </div>

                    <div className="pt-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#c7a75c]">
                        <Plane className="w-4 h-4 transform rotate-45" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-stone-400 font-bold tracking-widest leading-none">DESTINO FINAL</p>
                        <p className="text-xs font-bold text-white mt-1">Celebrar los 50 de Lina María</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: RSVP Form Block (6 cols) */}
                  <div className="md:col-span-6 flex flex-col justify-center">
                    <div className="mb-4">
                      <span className="text-[10px] tracking-widest uppercase text-[#c7a75c] font-black block mb-0.5">✈️ BITÁCORA DE ASISTENCIA</span>
                      <h4 className="text-sm font-bold text-white">Confirma tu lugar en esta aventura</h4>
                      {event.date && (
                        <p className="text-[9px] text-stone-400 mt-0.5">
                          Límite para registrarse: {new Date(new Date(event.date + 'T00:00:00').getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                    </div>

                    {rsvpSuccess ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 py-8 bg-stone-950/40 rounded-2xl border border-[#c7a75c]/20">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center mb-3">
                          <Sparkles className="w-5 h-5 text-[#c7a75c]" />
                        </div>
                        <p className="text-sm font-bold text-white mb-1">¡Registro Exitoso!</p>
                        <p className="text-xs text-stone-300 leading-relaxed px-2">{rsvpSuccess}</p>
                      </div>
                    ) : (
                      <form onSubmit={handleDirectRsvpSubmit} className="flex flex-col gap-3 justify-between text-left">
                        {/* Name Input */}
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-wider text-stone-400 font-bold block">Tu Nombre Completo</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Carmen Elvira Arias"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full bg-stone-950/50 border border-white/10 text-[11px] text-white p-2.5 focus:outline-none focus:border-[#c7a75c] transition-all rounded-xl placeholder:text-stone-600 focus:ring-1 focus:ring-[#c7a75c]/30"
                          />
                        </div>

                        {/* Attendance Buttons */}
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-wider text-stone-400 font-bold block">¿Asistirás?</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setAttending(true)}
                              className={`py-2 text-[10px] font-extrabold rounded-lg uppercase tracking-wider transition-all border ${
                                attending === true
                                  ? 'bg-[#5b1425] text-white border-[#c7a75c]/50 shadow-md'
                                  : 'bg-transparent text-stone-400 border-white/10 hover:bg-white/5'
                              }`}
                            >
                              Sí, asistiré
                            </button>
                            <button
                              type="button"
                              onClick={() => setAttending(false)}
                              className={`py-2 text-[10px] font-extrabold rounded-lg uppercase tracking-wider transition-all border ${
                                attending === false
                                  ? 'bg-stone-850 text-white border-[#c7a75c]/20 shadow-md'
                                  : 'bg-transparent text-stone-400 border-white/10 hover:bg-white/5'
                              }`}
                            >
                              No podré ir
                            </button>
                          </div>
                        </div>

                        {/* Companions */}
                        {attending === true && (
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-wider text-stone-400 font-bold block">Acompañantes adicionales</label>
                            <select
                              value={companions}
                              onChange={(e) => setCompanions(Number(e.target.value))}
                              className="w-full bg-stone-950/70 border border-white/10 text-[10px] text-white p-2 focus:outline-none focus:border-[#c7a75c] rounded-lg cursor-pointer"
                            >
                              <option value="0" className="bg-stone-900">Solo yo (Ninguno)</option>
                              <option value="1" className="bg-stone-900">1 acompañante</option>
                              <option value="2" className="bg-stone-900">2 acompañantes</option>
                              <option value="3" className="bg-stone-900">3 acompañantes</option>
                              <option value="4" className="bg-stone-900">4 acompañantes</option>
                            </select>
                          </div>
                        )}

                        {/* Optional message / diets */}
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-wider text-stone-400 font-bold block">Mensaje / Nota Especial</label>
                          <input
                            type="text"
                            placeholder="Alergias, saludos, etc."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full bg-stone-950/50 border border-white/10 text-[11px] text-white p-2.5 focus:outline-none focus:border-[#c7a75c] transition-all rounded-xl placeholder:text-stone-600 focus:ring-1 focus:ring-[#c7a75c]/30"
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={submittingRsvp || attending === null}
                          className={`w-full font-mono tracking-widest uppercase text-[10px] font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                            submittingRsvp || attending === null
                              ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-transparent'
                              : 'bg-[#c7a75c] hover:bg-[#b0924d] text-stone-950 shadow-md hover:shadow-lg'
                          }`}
                        >
                          {submittingRsvp ? (
                            <span>Procesando...</span>
                          ) : (
                            <>
                              <span>Sellar Asistencia</span>
                              <ArrowRight className="w-3 h-3 text-stone-950" />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>

                </div>
              </div>

            </div>

            {/* SECTION 3: IMMERSIVE GALLERY (TILTED TRAVEL PHOTO ALBUM EFFECT) */}
            <div className="bg-[#1f1217] border border-white/5 p-6 sm:p-8 rounded-[32px] mt-2 relative overflow-hidden text-left">
              <div className="absolute top-[-20%] left-[-20%] w-[50%] aspect-square bg-[#c7a75c]/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-[#c7a75c] font-black">📸 ÁLBUM DE ESCALAS</p>
                  <h3 className="text-lg font-serif font-black text-white mt-0.5">Bitácora de Recuerdos</h3>
                </div>
                <Camera className="w-5 h-5 text-stone-400" />
              </div>

              {/* Tilted photos stack mock for luxury touch */}
              <div className="flex flex-wrap justify-center gap-6 py-4 relative z-10">
                {galleryList.slice(0, 4).map((src, idx) => {
                  // Alternate rotation angles for realistic table scatter look
                  const rotations = [-4, 3, -2, 4];
                  const angle = rotations[idx % rotations.length];
                  
                  return (
                    <motion.div
                      key={src + idx}
                      whileHover={{ scale: 1.06, rotate: 0, zIndex: 20, shadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                      className="bg-white p-2.5 rounded-lg shadow-lg max-w-[120px] sm:max-w-[135px] cursor-zoom-in transition-all duration-300 relative border border-stone-200"
                      style={{ rotate: `${angle}deg` }}
                      onClick={() => setLightboxImage(src)}
                    >
                      <div className="aspect-[4/5] overflow-hidden rounded-md bg-stone-100">
                        <img src={src} className="w-full h-full object-cover grayscale-xs hover:grayscale-0 duration-300" alt="Recuerdo de viaje" referrerPolicy="no-referrer" />
                      </div>
                      <div className="h-6 flex items-center justify-center">
                        <span className="text-[8px] font-mono tracking-wider font-bold text-stone-400 uppercase">MEMORIA 0{idx + 1}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* STAMP DECORATIONS FOOTER */}
            <div className="flex justify-center gap-8 py-6 opacity-35">
              <div className="w-14 h-14 rounded-full border border-dashed border-[#c7a75c]/30 flex flex-col items-center justify-center text-[7px] text-[#c7a75c] font-mono uppercase rotate-[10deg] select-none pointer-events-none text-center">
                <span>BOARDED</span>
                <span>★★</span>
                <span>2026</span>
              </div>
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#c7a75c]/25 flex flex-col items-center justify-center text-[7px] text-[#c7a75c] font-mono uppercase rotate-[-8deg] select-none pointer-events-none text-center">
                <span>APPROVED</span>
                <span>LINA 50</span>
              </div>
              <div className="w-14 h-14 rounded-full border border-dashed border-[#c7a75c]/30 flex flex-col items-center justify-center text-[7px] text-[#c7a75c] font-mono uppercase rotate-[15deg] select-none pointer-events-none text-center">
                <span>DEPARTURE</span>
                <span>PORT</span>
              </div>
            </div>

            {/* LIGHTBOX MODAL VIEWER */}
            <AnimatePresence>
              {lightboxImage && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setLightboxImage(null)}
                  className="fixed inset-0 bg-black/95 backdrop-blur-md z-[999] flex items-center justify-center p-4 cursor-zoom-out"
                >
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    className="max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden bg-white p-3 shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src={lightboxImage} alt="Recuerdo grande" className="max-w-full max-h-[75vh] object-contain rounded-lg" referrerPolicy="no-referrer" />
                    <button 
                      onClick={() => setLightboxImage(null)}
                      className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 text-xs font-bold w-8 h-8 flex items-center justify-center border border-white/10"
                    >
                      ✕
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <DesignerCreditCard styleId={event.style} />

          </motion.div>
        )}

      </AnimatePresence>

      {/* GRAND PASSPORT STAMP "WOW" CRASH OVERLAY */}
      <AnimatePresence>
        {showStampReveal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs pointer-events-none"
          >
            <motion.div
              initial={{ scale: 5, rotate: -30, opacity: 0 }}
              animate={{ 
                scale: 1, 
                rotate: 12, 
                opacity: 1,
              }}
              exit={{ 
                opacity: 0, 
                scale: 1.1,
                transition: { delay: 1, duration: 0.5 }
              }}
              transition={{ 
                type: "spring", 
                damping: 12, 
                stiffness: 180,
                duration: 0.5 
              }}
              onAnimationComplete={() => {
                playStampSound();
                // trigger a brief vibration in browser if supported (e.g. mobile haptics!)
                if (navigator.vibrate) {
                  navigator.vibrate([100, 50, 100]);
                }
                // Add shake effect to ticket card
                const board = document.getElementById('boarding-pass-card');
                if (board) {
                  board.classList.add('animate-shake');
                  setTimeout(() => board.classList.remove('animate-shake'), 600);
                }
                
                // Keep the stamp on screen for 1.8 seconds, then resolve
                setTimeout(() => {
                  setShowStampReveal(false);
                  setStampPlaced(true);
                }, 1800);
              }}
              className="bg-transparent p-6 text-center"
            >
              <div className="w-72 h-72 rounded-full border-[6px] border-double border-[#c7a75c] flex flex-col items-center justify-center font-serif text-[#c7a75c] bg-[#29050d] shadow-[0_0_50px_rgba(199,167,92,0.8),inset_0_0_30px_rgba(199,167,92,0.4)] p-4 select-none rotate-12">
                <span className="text-[10px] font-mono tracking-[0.4em] font-black uppercase text-[#c7a75c]/90">FIRST CLASS VOYAGE</span>
                <div className="w-48 h-[1px] bg-[#c7a75c]/40 my-2" />
                <span className="text-4xl font-extrabold tracking-tighter leading-none text-[#fbf7f4] text-shadow-gold">50 YEARS</span>
                <span className="text-sm tracking-[0.1em] font-sans font-black uppercase text-[#c7a75c] mt-1">OFFICIALLY STAMPED</span>
                <div className="w-48 h-[1px] bg-[#c7a75c]/40 my-2" />
                <span className="text-[8px] font-mono tracking-widest text-[#c7a75c]/60">BOARDING APPROVED 2026</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

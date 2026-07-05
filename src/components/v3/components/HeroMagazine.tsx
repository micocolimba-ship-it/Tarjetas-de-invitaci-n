import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

export const HeroMagazine: React.FC<V3ComponentProps> = ({ event, variables }) => {
  const theme = useV3Theme();

  const title = variables.title || event.title;
  const hostName = variables.hostName || event.hostName;
  const date = variables.date || event.date;
  const time = variables.time || event.time;
  const description = variables.description || event.description;
  const imageUrl = variables.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200';

  return (
    <div className="relative w-full min-h-screen bg-stone-950 flex flex-col justify-center overflow-hidden px-4 select-none">
      {/* Background Cover Photo */}
      <div className="absolute inset-0 z-0">
        <img 
          src={imageUrl} 
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover filter brightness-75 saturate-50 contrast-125 scale-100 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40" />
      </div>

      {/* Decorative vertical lines / barcode look alike */}
      <div className="absolute left-6 bottom-16 z-10 hidden md:flex flex-col gap-1 items-start text-white/40">
        <div className="w-16 h-8 border border-white/20 flex items-center justify-center font-mono text-[9px] tracking-widest">
          VOGUE
        </div>
        <span className="font-mono text-[8px] tracking-[0.2em]">ISSUE #03</span>
      </div>

      {/* Magazine Title overlapping image */}
      <div className="absolute inset-x-4 top-20 z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{ fontFamily: `'${theme.fontTitle}', serif` }}
          className="text-white text-5xl sm:text-8xl md:text-9xl tracking-[0.05em] uppercase font-bold text-center leading-none opacity-90 select-none pointer-events-none drop-shadow-lg"
        >
          {event.type === 'matrimonio' ? 'AMOUR' : 'GALA'}
        </motion.div>
        
        {/* Underline / issue metadata */}
        <div className="flex gap-4 items-center mt-2 text-[9px] tracking-[0.3em] uppercase text-stone-300 font-bold">
          <span>{date}</span>
          <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
          <span>{time || 'SPECIAL ISSUE'}</span>
        </div>
      </div>

      {/* Main cover text content */}
      <div className="relative z-10 max-w-xl mt-auto mb-16 text-left text-white px-4">
        {hostName && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="inline-block bg-[#D4AF37] text-stone-950 text-[10px] tracking-[0.25em] font-extrabold px-3 py-1 uppercase rounded-sm mb-4"
          >
            {hostName}
          </motion.span>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase leading-tight select-text"
        >
          {title}
        </motion.h2>

        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-stone-300 text-sm font-light leading-relaxed mt-4 line-clamp-3 select-text"
          >
            {description}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-wrap gap-4 mt-6 text-[10px] tracking-widest font-bold uppercase text-stone-400"
        >
          <span>• DRESS CODE: FORMAL</span>
          <span>• RSVP CONFIRMATION</span>
          <span>• MUSIC ENGINE ON</span>
        </motion.div>
      </div>
    </div>
  );
};

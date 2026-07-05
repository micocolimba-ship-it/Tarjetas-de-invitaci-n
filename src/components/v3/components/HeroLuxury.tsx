import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

export const HeroLuxury: React.FC<V3ComponentProps> = ({ event, variables }) => {
  const theme = useV3Theme();
  
  const title = variables.title || event.title;
  const hostName = variables.hostName || event.hostName;
  const date = variables.date || event.date;
  const time = variables.time || event.time;
  const imageUrl = variables.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200';

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden px-6 text-center select-none">
      {/* Background Image with elegant overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={imageUrl} 
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover filter brightness-[0.7] scale-105 transition-transform duration-[10000ms]"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      </div>

      {/* Decorative luxury golden frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-4 sm:inset-8 border border-[#D4AF37]/40 pointer-events-none z-10 flex flex-col justify-between p-4"
      >
        <div className="flex justify-between">
          <div className="w-4 h-4 border-t border-l border-[#D4AF37]/70" />
          <div className="w-4 h-4 border-t border-r border-[#D4AF37]/70" />
        </div>
        <div className="flex justify-between">
          <div className="w-4 h-4 border-b border-l border-[#D4AF37]/70" />
          <div className="w-4 h-4 border-b border-r border-[#D4AF37]/70" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl flex flex-col items-center gap-6 text-white my-auto px-4">
        {hostName && (
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold text-[#F3E5AB]"
          >
            {hostName}
          </motion.p>
        )}

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          style={{ fontFamily: `'${theme.fontTitle}', serif` }}
          className="text-4xl sm:text-6xl font-normal leading-tight text-white drop-shadow-md select-text"
        >
          {title}
        </motion.h1>

        {/* Golden Minimalist Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="w-24 h-px bg-[#D4AF37]/60"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-col gap-2"
        >
          <p className="text-sm sm:text-base tracking-[0.25em] uppercase font-light text-stone-200">
            {date}
          </p>
          {time && (
            <p className="text-xs sm:text-sm tracking-[0.15em] uppercase font-extralight text-stone-300">
              {time}
            </p>
          )}
        </motion.div>
      </div>

      {/* Bottom indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        className="absolute bottom-10 z-10 flex flex-col items-center gap-1"
      >
        <span className="text-[9px] tracking-[0.3em] text-white/55 uppercase">Deslizar</span>
        <div className="w-px h-6 bg-white/40" />
      </motion.div>
    </div>
  );
};

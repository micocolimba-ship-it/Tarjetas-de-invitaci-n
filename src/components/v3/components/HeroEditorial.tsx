import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

export const HeroEditorial: React.FC<V3ComponentProps> = ({ event, variables }) => {
  const theme = useV3Theme();

  const title = variables.title || event.title;
  const hostName = variables.hostName || event.hostName;
  const date = variables.date || event.date;
  const time = variables.time || event.time;
  const description = variables.description || event.description;
  const imageUrl = variables.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200';

  return (
    <div className="relative w-full min-h-screen py-16 px-6 md:py-24 md:px-12 flex flex-col justify-between select-none">
      {/* Top Meta info */}
      <div className="w-full flex justify-between items-center border-b border-stone-200/40 pb-4 mb-8">
        <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-bold">
          {event.type ? event.type.toUpperCase() : 'INVITACIÓN'}
        </span>
        <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-light">
          EDICIÓN ESPECIAL
        </span>
      </div>

      {/* Asymmetric layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center my-auto">
        {/* Left: Text Content */}
        <div className="md:col-span-5 flex flex-col gap-6 text-left">
          {hostName && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-xs tracking-[0.25em] uppercase font-semibold text-stone-500"
            >
              {hostName}
            </motion.p>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{ fontFamily: `'${theme.fontTitle}', serif` }}
            className="text-4xl sm:text-5xl font-light text-stone-900 leading-tight select-text"
          >
            {title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-sm text-stone-600 leading-relaxed max-w-sm font-light select-text"
          >
            {description}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="border-l border-stone-400 pl-4 py-1 mt-4"
          >
            <p className="text-xs tracking-[0.2em] uppercase font-bold text-stone-800">
              {date}
            </p>
            {time && (
              <p className="text-xs tracking-[0.1em] text-stone-500 mt-1 font-light">
                {time}
              </p>
            )}
          </motion.div>
        </div>

        {/* Right: Elegant image frame with natural look */}
        <div className="md:col-span-7 flex justify-center items-center relative">
          {/* Subtle background card effect behind image */}
          <div className="absolute -inset-4 bg-stone-100 rounded-lg -rotate-1 z-0" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="w-full h-[55vh] md:h-[65vh] overflow-hidden rounded-lg shadow-md relative z-10"
          >
            <img 
              src={imageUrl} 
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter saturate-[0.85] contrast-[0.95] hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
        </div>
      </div>

      <div className="w-full border-t border-stone-200/40 pt-4 mt-8 flex justify-between text-[10px] text-stone-400">
        <span>KINFOLK EDITORIAL STYLE</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </div>
  );
};

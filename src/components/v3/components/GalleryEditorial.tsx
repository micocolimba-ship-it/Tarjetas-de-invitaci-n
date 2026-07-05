import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

export const GalleryEditorial: React.FC<V3ComponentProps> = ({ event, variables }) => {
  const theme = useV3Theme();

  // Retrieve images from variables or default ones
  const imagesStr = variables.gallery || '';
  const parsedImages = imagesStr ? imagesStr.split(',').map(s => s.trim()) : [];
  
  const finalImages = parsedImages.length > 0 ? parsedImages : [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=600'
  ];

  return (
    <div className={`${theme.spacing.sectionPadding} flex flex-col gap-12 max-w-5xl mx-auto`}>
      <div className="text-center flex flex-col gap-2">
        <h3 
          style={{ fontFamily: `'${theme.fontTitle}', serif` }}
          className="text-2xl sm:text-3xl font-light text-stone-900"
        >
          Nuestros Momentos
        </h3>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-bold">Galería Editorial</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Big landscape picture on the left */}
        <div className="md:col-span-7 flex flex-col gap-3">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="w-full aspect-[4/3] overflow-hidden rounded-md shadow-sm border border-stone-200/50"
          >
            <img 
              src={finalImages[0]} 
              alt="Moment 1" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter saturate-[0.9] hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
          <span className="text-[10px] tracking-widest text-stone-400 uppercase font-mono text-left">CAPÍTULO I: EL COMIENZO</span>
        </div>

        {/* Two smaller pictures stacked on the right */}
        <div className="md:col-span-5 flex flex-col gap-8">
          {finalImages[1] && (
            <div className="flex flex-col gap-3">
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="w-full aspect-[3/2] overflow-hidden rounded-md shadow-sm border border-stone-200/50"
              >
                <img 
                  src={finalImages[1]} 
                  alt="Moment 2" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter saturate-[0.9] hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
              <span className="text-[10px] tracking-widest text-stone-400 uppercase font-mono text-left">CAPÍTULO II: EL CAMINO</span>
            </div>
          )}

          {finalImages[2] && (
            <div className="flex flex-col gap-3">
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="w-full aspect-[1/1] overflow-hidden rounded-md shadow-sm border border-stone-200/50"
              >
                <img 
                  src={finalImages[2]} 
                  alt="Moment 3" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter saturate-[0.9] hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
              <span className="text-[10px] tracking-widest text-stone-400 uppercase font-mono text-left">CAPÍTULO III: LA UNIÓN</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

export const GalleryFilm: React.FC<V3ComponentProps> = ({ event, variables }) => {
  const theme = useV3Theme();

  const imagesStr = variables.gallery || '';
  const parsedImages = imagesStr ? imagesStr.split(',').map(s => s.trim()) : [];
  
  const finalImages = parsedImages.length > 0 ? parsedImages : [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=600'
  ];

  return (
    <div className={`${theme.spacing.sectionPadding} flex flex-col gap-10 overflow-hidden`}>
      <div className="text-center flex flex-col gap-2 px-6">
        <h3 
          style={{ fontFamily: `'${theme.fontTitle}', serif` }}
          className="text-2xl sm:text-3xl font-light text-stone-900"
        >
          Fotogramas de Amor
        </h3>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-bold">Cinta de Recuerdos</p>
      </div>

      {/* Filmstrip Roll / Slider */}
      <div className="relative w-full overflow-x-auto scrollbar-none flex gap-6 px-6 py-4 select-none">
        {finalImages.map((img, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02, rotate: i % 2 === 0 ? 0.5 : -0.5 }}
            className="flex-shrink-0 w-[280px] sm:w-[380px] bg-[#1C1A17] p-3 shadow-lg border border-stone-800 flex flex-col gap-3"
          >
            {/* Film strip sprocket holes decoration top */}
            <div className="flex justify-between px-1">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="w-2.5 h-2.5 bg-[#FAF3F0]/90 rounded-sm" />
              ))}
            </div>

            {/* Main picture */}
            <div className="w-full aspect-[4/3] overflow-hidden bg-stone-900">
              <img 
                src={img} 
                alt={`Film ${i + 1}`} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter brightness-[0.95] saturate-[0.8] contrast-105"
              />
            </div>

            {/* Film strip sprocket holes decoration bottom */}
            <div className="flex justify-between px-1 mt-1">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="w-2.5 h-2.5 bg-[#FAF3F0]/90 rounded-sm" />
              ))}
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono text-stone-400 px-1 mt-1">
              <span>FUJI 400H</span>
              <span>FRAME {i + 1}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

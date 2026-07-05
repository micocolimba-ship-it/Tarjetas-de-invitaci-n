import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

export const GalleryMasonry: React.FC<V3ComponentProps> = ({ event, variables }) => {
  const theme = useV3Theme();

  const imagesStr = variables.gallery || '';
  const parsedImages = imagesStr ? imagesStr.split(',').map(s => s.trim()) : [];
  
  const finalImages = parsedImages.length > 0 ? parsedImages : [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1507504038482-76210062ece1?auto=format&fit=crop&q=80&w=400'
  ];

  return (
    <div className={`${theme.spacing.sectionPadding} flex flex-col gap-10 max-w-5xl mx-auto`}>
      <div className="text-center flex flex-col gap-2">
        <h3 
          style={{ fontFamily: `'${theme.fontTitle}', serif` }}
          className="text-2xl sm:text-3xl font-light text-stone-900"
        >
          Retratos de Amor
        </h3>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-bold">Mosaico de Recuerdos</p>
      </div>

      {/* Asymmetric Columns Collage Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Col 1 */}
        <div className="flex flex-col gap-4">
          <motion.div 
            whileHover={{ y: -4 }}
            className="overflow-hidden rounded-lg shadow-sm border border-stone-200/55"
          >
            <img 
              src={finalImages[0]} 
              alt="Gallery 1" 
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover rounded-lg filter saturate-[0.8]"
            />
          </motion.div>
          {finalImages[3] && (
            <motion.div 
              whileHover={{ y: -4 }}
              className="overflow-hidden rounded-lg shadow-sm border border-stone-200/55"
            >
              <img 
                src={finalImages[3]} 
                alt="Gallery 4" 
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover rounded-lg filter saturate-[0.8]"
              />
            </motion.div>
          )}
        </div>

        {/* Col 2 */}
        <div className="flex flex-col gap-4">
          {finalImages[1] && (
            <motion.div 
              whileHover={{ y: -4 }}
              className="overflow-hidden rounded-lg shadow-sm border border-stone-200/55"
            >
              <img 
                src={finalImages[1]} 
                alt="Gallery 2" 
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover rounded-lg filter saturate-[0.8]"
              />
            </motion.div>
          )}
          {finalImages[4] && (
            <motion.div 
              whileHover={{ y: -4 }}
              className="overflow-hidden rounded-lg shadow-sm border border-stone-200/55"
            >
              <img 
                src={finalImages[4]} 
                alt="Gallery 5" 
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover rounded-lg filter saturate-[0.8]"
              />
            </motion.div>
          )}
        </div>

        {/* Col 3 */}
        <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
          {finalImages[2] && (
            <motion.div 
              whileHover={{ y: -4 }}
              className="overflow-hidden rounded-lg shadow-sm border border-stone-200/55 h-full"
            >
              <img 
                src={finalImages[2]} 
                alt="Gallery 3" 
                referrerPolicy="no-referrer"
                className="w-full h-full min-h-[250px] object-cover rounded-lg filter saturate-[0.8]"
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

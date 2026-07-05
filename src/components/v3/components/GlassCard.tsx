import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

interface CardProps extends V3ComponentProps {
  children?: React.ReactNode;
}

export const GlassCard: React.FC<CardProps> = ({ event, variables, children }) => {
  const theme = useV3Theme();

  const dressCode = variables.dressCode || 'Formal / Elegante';
  const description = variables.dressCodeDescription || 'Te invitamos a vestir tus mejores prendas de gala para celebrar este gran día.';

  return (
    <div className="py-10 px-6 max-w-xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className={theme.card.glass}
      >
        {children ? (
          children
        ) : (
          <div className="text-center flex flex-col items-center gap-4">
            <span className="text-[10px] font-mono tracking-widest text-[#B08E72] uppercase font-bold">Código de Vestimenta</span>
            <h4 
              style={{ fontFamily: `'${theme.fontTitle}', serif` }}
              className="text-xl sm:text-2xl font-light text-stone-900"
            >
              {dressCode}
            </h4>
            <div className="w-12 h-px bg-stone-300/60" />
            <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed max-w-sm select-text">
              {description}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

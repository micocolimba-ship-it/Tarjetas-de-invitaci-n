import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

interface CardProps extends V3ComponentProps {
  children?: React.ReactNode;
}

export const FloatingCard: React.FC<CardProps> = ({ event, variables, children }) => {
  const theme = useV3Theme();

  const title = 'Regalos & Aportes';
  const description = variables.giftLink || 'Tu presencia es nuestro mayor regalo. Sin embargo, si deseas hacernos un obsequio, puedes hacerlo mediante transferencia o mesa de regalos.';

  return (
    <div className="py-10 px-6 max-w-xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className={theme.card.floating}
      >
        {children ? (
          children
        ) : (
          <div className="text-center flex flex-col items-center gap-4">
            <span className="text-[10px] font-mono tracking-widest text-[#B08E72] uppercase font-bold">Mesa de Regalos</span>
            <h4 
              style={{ fontFamily: `'${theme.fontTitle}', serif` }}
              className="text-xl sm:text-2xl font-light text-stone-900"
            >
              {title}
            </h4>
            <div className="w-12 h-px bg-stone-300" />
            <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed max-w-sm select-text">
              {description}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

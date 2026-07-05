import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

export const QuoteLuxury: React.FC<V3ComponentProps> = ({ event, variables }) => {
  const theme = useV3Theme();

  const text = variables.quote || variables.description || event.description || 'El amor todo lo cree, todo lo espera, todo lo soporta.';
  const author = variables.quoteAuthor || 'Corintios 13:7';

  return (
    <div className="py-12 px-6 max-w-2xl mx-auto text-center select-text">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative p-8 md:p-12 border border-[#D4AF37]/20 rounded-sm bg-black/5"
      >
        {/* Floating luxury ornament */}
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FCFBF9] px-4 text-xs text-[#D4AF37] tracking-[0.2em] font-serif">
          ✦
        </span>

        <p 
          style={{ fontFamily: `'${theme.fontTitle}', serif` }}
          className="text-xl sm:text-2xl font-light text-stone-900 leading-relaxed italic"
        >
          "{text}"
        </p>

        {author && (
          <p className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-stone-500 font-bold mt-6">
            — {author}
          </p>
        )}
      </motion.div>
    </div>
  );
};
export default QuoteLuxury;

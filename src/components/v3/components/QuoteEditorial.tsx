import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

export const QuoteEditorial: React.FC<V3ComponentProps> = ({ event, variables }) => {
  const theme = useV3Theme();

  const text = variables.quote || variables.description || event.description || 'La vida no se mide por las veces que respiras, sino por los momentos que te dejan sin aliento.';
  const author = variables.quoteAuthor || '';

  return (
    <div className="py-16 px-6 max-w-xl mx-auto text-left select-text">
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="border-l-2 border-[#8C7A5B] pl-6 md:pl-10 flex flex-col gap-4"
      >
        <span className="text-[9px] tracking-[0.3em] text-[#8C7A5B] uppercase font-bold">PENSAMIENTO</span>
        
        <p 
          style={{ fontFamily: `'${theme.fontTitle}', serif` }}
          className="text-lg sm:text-xl font-light text-stone-800 leading-relaxed italic"
        >
          {text}
        </p>

        {author && (
          <p className="text-[10px] tracking-widest uppercase text-stone-500 font-medium">
            — {author}
          </p>
        )}
      </motion.div>
    </div>
  );
};
export default QuoteEditorial;

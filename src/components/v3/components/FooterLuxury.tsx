import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

export const FooterLuxury: React.FC<V3ComponentProps> = ({ event, variables }) => {
  const theme = useV3Theme();

  const hostName = variables.hostName || event.hostName || 'Los Anfitriones';

  return (
    <div className="w-full py-16 text-center border-t border-[#D4AF37]/15 mt-12 flex flex-col items-center gap-4 px-6 select-text">
      {/* Small luxury seal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-12 h-12 rounded-full border border-[#D4AF37]/40 flex items-center justify-center text-xs tracking-widest text-[#D4AF37] font-serif select-none"
      >
        ✦
      </motion.div>

      <p className="text-[10px] font-mono tracking-[0.3em] text-stone-400 uppercase font-bold">
        HECHO CON AMOR PARA TI
      </p>

      <p 
        style={{ fontFamily: `'${theme.fontTitle}', serif` }}
        className="text-2xl font-light text-[#8C7A5B] italic"
      >
        {hostName}
      </p>
      
      <p className="text-[9px] font-mono text-stone-400 mt-2 select-none">
        DISEÑADO CON EDITORIAL ENGINE V3
      </p>
    </div>
  );
};
export default FooterLuxury;

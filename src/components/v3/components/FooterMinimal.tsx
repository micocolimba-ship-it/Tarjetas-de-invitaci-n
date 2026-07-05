import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

export const FooterMinimal: React.FC<V3ComponentProps> = ({ event, variables }) => {
  const theme = useV3Theme();

  const hostName = variables.hostName || event.hostName || 'Los Anfitriones';

  return (
    <div className="w-full py-12 text-center border-t border-stone-200/40 mt-12 flex flex-col items-center gap-2 px-6 select-text">
      <p className="text-[9px] font-mono tracking-[0.2em] text-stone-400 uppercase font-bold">
        TE ESPERAMOS
      </p>

      <p 
        style={{ fontFamily: `'${theme.fontTitle}', serif` }}
        className="text-xl font-light text-stone-700"
      >
        {hostName}
      </p>
      
      <p className="text-[8px] font-mono text-stone-400/80 mt-1 select-none">
        EDICIÓN DIGITAL KINFOLK • V3
      </p>
    </div>
  );
};
export default FooterMinimal;

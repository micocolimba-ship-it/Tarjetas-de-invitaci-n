import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

export const DividerGold: React.FC<V3ComponentProps> = () => {
  const theme = useV3Theme();

  return (
    <div className="w-full flex justify-center py-6 select-none">
      <motion.div 
        initial={{ opacity: 0, scaleX: 0.5 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className={`${theme.divider.gold} w-full max-w-xs`}
      />
    </div>
  );
};
export default DividerGold;

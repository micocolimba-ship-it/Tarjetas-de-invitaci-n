import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';
import { TimelineItem } from './TimelineElegant';

const DEFAULT_TIMELINE_ITEMS: TimelineItem[] = [
  { timeStr: '19:30 Hrs', title: 'Cóctel de Recepción', description: 'Llegada de invitados, cócteles de bienvenida y sesión de fotos inicial.' },
  { timeStr: '20:30 Hrs', title: 'Ceremonia Central', description: 'Celebración principal, intercambio de votos simbólicos y brindis oficial.' },
  { timeStr: '22:00 Hrs', title: 'Banquete & Fiesta', description: 'Cena gourmet de bodas, baile oficial de novios y fiesta bailable sin límites.' }
];

export const TimelineMinimal: React.FC<V3ComponentProps> = ({ event, variables }) => {
  const theme = useV3Theme();

  let items = DEFAULT_TIMELINE_ITEMS;
  if (variables.schedule) {
    try {
      const parsed = JSON.parse(variables.schedule);
      if (Array.isArray(parsed)) {
        items = parsed.map(it => ({
          timeStr: it.timeStr || it.time || 'Hora',
          title: it.title || 'Evento',
          description: it.description || ''
        }));
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className={`${theme.spacing.sectionPadding} max-w-lg mx-auto flex flex-col gap-8 text-center select-text`}>
      <div className="flex flex-col gap-2">
        <h3 
          style={{ fontFamily: `'${theme.fontTitle}', serif` }}
          className="text-2xl sm:text-3xl font-light text-stone-900"
        >
          Itinerario
        </h3>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-bold">Planificación</p>
      </div>

      <div className="flex flex-col gap-6 items-center">
        {items.map((it, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="flex flex-col items-center gap-1.5 max-w-sm"
          >
            <strong className="text-[10px] font-mono uppercase tracking-[0.25em] text-stone-400">
              {it.timeStr}
            </strong>
            <h4 className="text-sm sm:text-base font-medium text-stone-900 tracking-wide">
              {it.title}
            </h4>
            {it.description && (
              <p className="text-xs text-stone-500 leading-relaxed font-light">
                {it.description}
              </p>
            )}
            
            {i < items.length - 1 && (
              <div className="w-px h-6 bg-stone-300/40 my-3" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

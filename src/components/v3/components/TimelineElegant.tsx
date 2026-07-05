import React from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

export interface TimelineItem {
  timeStr: string;
  title: string;
  description: string;
}

const DEFAULT_TIMELINE_ITEMS: TimelineItem[] = [
  { timeStr: '19:30 Hrs', title: 'Cóctel de Recepción', description: 'Llegada de invitados, cócteles de bienvenida y sesión de fotos inicial.' },
  { timeStr: '20:30 Hrs', title: 'Ceremonia Central', description: 'Celebración principal, intercambio de votos simbólicos y brindis oficial.' },
  { timeStr: '22:00 Hrs', title: 'Banquete & Fiesta', description: 'Cena gourmet de bodas, baile oficial de novios y fiesta bailable sin límites.' }
];

export const TimelineElegant: React.FC<V3ComponentProps> = ({ event, variables }) => {
  const theme = useV3Theme();

  // Parse custom schedule if provided as JSON in variables
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
      // Fallback if not JSON
    }
  }

  return (
    <div className={`${theme.spacing.sectionPadding} max-w-xl mx-auto flex flex-col gap-10`}>
      <div className="text-center flex flex-col gap-2">
        <h3 
          style={{ fontFamily: `'${theme.fontTitle}', serif` }}
          className="text-2xl sm:text-3xl font-light text-stone-900"
        >
          Cronograma del Evento
        </h3>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-bold">Cada Instante Cuenta</p>
      </div>

      <div className="relative border-l border-stone-200/80 pl-8 flex flex-col gap-8 text-left select-text">
        {items.map((it, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="relative"
          >
            {/* Elegant glowing bullet node */}
            <span 
              style={{ backgroundColor: theme.colors.accent }}
              className="absolute -left-[37px] top-1.5 w-3.5 h-3.5 rounded-full border-4 border-[#FCFBF9] shadow-sm"
            />
            
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold" style={{ color: theme.colors.accent }}>
              {it.timeStr}
            </span>
            <h4 className="text-base font-bold text-stone-900 mt-0.5">
              {it.title}
            </h4>
            {it.description && (
              <p className="text-xs text-stone-600 mt-1 leading-relaxed font-light">
                {it.description}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

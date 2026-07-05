import React, { useState } from 'react';
import { motion } from 'motion/react';
import { V3ComponentProps } from '../types';
import { useV3Theme } from '../ThemeProviderV3';

export const RSVPLuxury: React.FC<V3ComponentProps> = ({ event, variables }) => {
  const theme = useV3Theme();

  const [guestName, setGuestName] = useState('');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [companions, setCompanions] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const deadline = variables.confirmationDeadline || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || attending === null) return;
    setSubmitting(true);

    try {
      const response = await fetch('/api/rsvps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 'rsvp-' + Date.now(),
          eventId: event.id,
          guestName: guestName,
          attending: attending,
          companions: attending ? companions : 0,
          comment: comment,
          googleSheetsUrl: event.googleSheetsUrl
        })
      });

      if (response.ok) {
        setSuccessMessage(`¡Muchas gracias ${guestName}! Tu asistencia ha sido confirmada exitosamente.`);
        setGuestName('');
        setComment('');
        setCompanions(0);
        setAttending(null);
      } else {
        alert('Hubo un problema al registrar tu asistencia. Por favor, inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Error submitting RSVP in RSVPLuxury:', err);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-6 max-w-xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="border border-[#D4AF37]/35 p-6 md:p-10 bg-white/5 backdrop-blur-sm relative rounded-none shadow-xl select-text"
      >
        {/* Double golden border frame */}
        <div className="absolute inset-1 border border-[#D4AF37]/15 pointer-events-none" />

        <div className="text-center flex flex-col items-center gap-2 mb-8 relative z-10">
          <span className="text-[10px] font-mono tracking-[0.3em] text-[#D4AF37] uppercase font-bold">R.S.V.P</span>
          <h4 
            style={{ fontFamily: `'${theme.fontTitle}', serif` }}
            className="text-2xl font-light text-stone-900"
          >
            Confirmación de Asistencia
          </h4>
          <div className="w-16 h-px bg-[#D4AF37]/30 my-2" />
          {deadline && (
            <p className="text-[10px] tracking-widest text-[#D4AF37] uppercase font-semibold">
              Fecha límite: {deadline}
            </p>
          )}
        </div>

        {successMessage ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-stone-900/5 border border-[#D4AF37]/30 text-stone-800 text-sm text-center rounded-sm relative z-10"
          >
            <p className="font-serif italic text-base mb-2">¡Confirmación Recibida!</p>
            <p className="text-xs text-stone-600 leading-relaxed">{successMessage}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10 text-left">
            {/* Guest Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-wider text-stone-500 uppercase font-bold">Nombre Completo</label>
              <input
                type="text"
                required
                placeholder="Ej. Sra. Clara Inés Prado"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-stone-100/50 border border-stone-200 text-xs text-stone-800 p-3 focus:outline-none focus:border-[#D4AF37] transition-all rounded-none"
              />
            </div>

            {/* Attendance Choice Buttons */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-wider text-stone-500 uppercase font-bold">¿Asistirás?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAttending(true)}
                  className={`py-3 text-xs font-bold transition-all border rounded-none ${
                    attending === true 
                      ? 'bg-stone-900 text-white border-stone-900' 
                      : 'bg-transparent text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  Sí, asistiré
                </button>
                <button
                  type="button"
                  onClick={() => setAttending(false)}
                  className={`py-3 text-xs font-bold transition-all border rounded-none ${
                    attending === false 
                      ? 'bg-rose-950 text-white border-rose-950' 
                      : 'bg-transparent text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  No podré asistir
                </button>
              </div>
            </div>

            {/* Additional Companions Selection */}
            {attending === true && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col gap-1.5"
              >
                <label className="text-[10px] tracking-wider text-stone-500 uppercase font-bold">Acompañantes adicionales</label>
                <select
                  value={companions}
                  onChange={(e) => setCompanions(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 text-xs text-stone-800 p-3 focus:outline-none focus:border-[#D4AF37] rounded-none shadow-2xs"
                >
                  <option value="0">Ninguno (Asistiré solo/a)</option>
                  <option value="1">Llevo 1 acompañante</option>
                  <option value="2">Llevo 2 acompañantes</option>
                  <option value="3">Llevo 3 acompañantes</option>
                  <option value="4">Llevo 4 acompañantes</option>
                  <option value="5">Llevo 5 o más adicionales</option>
                </select>
              </motion.div>
            )}

            {/* Optional Comment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-wider text-stone-500 uppercase font-bold">Mensaje / Alergia Alimentaria</label>
              <textarea
                rows={3}
                placeholder="Ej. Con muchas ansias de festejar junto a ustedes. Opción vegetariana por favor."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-stone-100/50 border border-stone-200 text-xs text-stone-800 p-3 focus:outline-none focus:border-[#D4AF37] transition-all resize-none rounded-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || attending === null}
              className={`w-full mt-2 font-mono tracking-widest uppercase text-xs px-6 py-4 transition-all duration-300 font-bold border rounded-none ${
                submitting || attending === null
                  ? 'bg-stone-200 text-stone-400 border-stone-200 cursor-not-allowed'
                  : 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800'
              }`}
            >
              {submitting ? 'Confirmando...' : 'Confirmar Asistencia'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
export default RSVPLuxury;

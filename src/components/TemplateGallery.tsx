import React, { useState, useEffect } from 'react';
import { Check, Heart, Sparkles, Star, Calendar, MapPin, Eye, Award, X, Laptop, Smartphone } from 'lucide-react';
import { EventData, TemplateStyle, EventType, CustomTemplate } from '../types';
import { TEMPLATE_STYLES, EVENT_TYPES_METADATA } from '../data/templates';
import InvitationPreview from './InvitationPreview';

interface TemplateGalleryProps {
  activeEvent: EventData;
  imageUrl: string;
  onSelectStyle: (style: TemplateStyle) => void;
  onPreviewStyle: (style: TemplateStyle) => void; // Retained for backwards compatibility
  onSelectCategory: (category: EventType) => void; // Category selector
  customTemplates?: CustomTemplate[];
}

export default function TemplateGallery({ 
  activeEvent, 
  imageUrl, 
  onSelectStyle, 
  onPreviewStyle,
  onSelectCategory,
  customTemplates = []
}: TemplateGalleryProps) {
  const currentCategoryMeta = EVENT_TYPES_METADATA[activeEvent.type];
  
  // State for controlling the beautiful preview Modal pop-up
  const [previewingStyle, setPreviewingStyle] = useState<TemplateStyle | null>(null);
  const [modalMode, setModalMode] = useState<'mobile' | 'web'>('mobile');

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewingStyle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const matchingCustomTemplates = customTemplates.filter(t => t.category === activeEvent.type);

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in pb-16">
      {/* Informative Header inspired by Invita App */}
      <div className="bg-white border border-[#EBE5DA] p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="bg-[#8C7A5F]/10 p-3 rounded-2xl text-[#8C7A5F] flex-shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">Galería de Plantillas de Invitación</h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xl leading-relaxed">
              Inspirado en la refinada estética de <span className="font-semibold text-stone-800">Invita App</span>. 
              Todas nuestras plantillas son dinámicas: se rellenan automáticamente con los datos cargados en tu <span className="font-bold text-[#8C7A5F]">Panel de Carga</span> o las cargadas desde el <span className="font-bold text-emerald-700">Panel de Administrador</span>. 
              Visualiza y elige la que mejor se adapte al ambiente de tu celebración.
            </p>
          </div>
        </div>
        
        {currentCategoryMeta && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-800 max-w-xs flex flex-col gap-1.5 self-stretch lg:self-auto justify-center">
            <span className="font-bold flex items-center gap-1.5">
              💡 Recomendación IA Familiar:
            </span>
            <p className="text-[11px] leading-relaxed text-stone-600">
              Para un evento de <strong className="text-stone-800">{currentCategoryMeta.name}</strong>, el estilo sugerido por excelencia es el <strong className="text-[#8C7A5F]">{TEMPLATE_STYLES[currentCategoryMeta.suggestedStyle]?.name}</strong>.
            </p>
          </div>
        )}
      </div>

      {/* STEP 1: EVENT CATEGORIES (DIRECTLY ON THE LANDING OF PLANTILLAS) */}
      <div className="bg-[#FAF8F5] border border-[#EBE5DA] p-6 sm:p-8 rounded-3xl shadow-xs">
        <div className="flex flex-col gap-1 mb-5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center bg-[#8C7A5F] text-white w-5 h-5 rounded-full text-[10px] font-black">1</span>
            <h3 className="text-xs font-black uppercase tracking-widest text-stone-700">Categoría del Evento</h3>
          </div>
          <p className="text-[11px] text-stone-400 font-medium">
            Selecciona el tipo de evento familiar para cargar su formato especial, títulos sugeridos e íconos:
          </p>
        </div>

        {/* Categories Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          {Object.entries(EVENT_TYPES_METADATA).map(([key, meta]) => {
            const isSelected = activeEvent.type === key;
            return (
              <button
                key={key}
                onClick={() => onSelectCategory(key as EventType)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-300 relative group ${
                  isSelected
                    ? 'bg-[#8C7A5F] border-[#8C7A5F] text-white shadow-md transform scale-[1.02]'
                    : 'bg-white border-[#EBE5DA] text-stone-700 hover:border-[#8C7A5F] hover:bg-stone-50 hover:shadow-xs'
                }`}
              >
                <span className={`text-2xl mb-2 filter drop-shadow-xs transform group-hover:scale-110 transition-transform ${
                  isSelected ? 'scale-105' : ''
                }`}>
                  {meta.emoji}
                </span>
                <span className="text-[11px] font-extrabold tracking-tight block">
                  {meta.name}
                </span>
                
                {/* Visual indicator of active state */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-white/20 p-0.5 rounded-full">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: AVAILABLE STYLES FOR THE SELECTED CATEGORY */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 pb-2 border-b border-[#EBE5DA]">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center bg-[#8C7A5F] text-white w-5 h-5 rounded-full text-[10px] font-black">2</span>
            <h3 className="text-xs font-black uppercase tracking-widest text-stone-700">
              Diseños Predeterminados del Sistema para {currentCategoryMeta?.name || 'tu Evento'}
            </h3>
          </div>
          <p className="text-[11px] text-stone-400 font-medium">
            Todas las plantillas que ves abajo se actualizan en vivo con los datos e información de tu {currentCategoryMeta?.name || 'Evento'}.
          </p>
        </div>

        {/* Grid of Dynamic Premium Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-2">
          {Object.entries(TEMPLATE_STYLES).map(([key, styleDef]) => {
            const isSelected = activeEvent.style === key;
            const isSuggested = currentCategoryMeta?.suggestedStyle === key;
            
            // Create a mock temporary event matching this specific style so we can render its dynamic live miniature preview
            const previewEvent: EventData = {
              ...activeEvent,
              style: key as TemplateStyle
            };

            return (
              <div 
                key={key}
                id={`template-card-${key}`}
                className={`bg-white rounded-3xl border overflow-hidden shadow-md flex flex-col justify-between transition-all duration-300 group hover:shadow-xl ${
                  isSelected 
                    ? 'border-[#8C7A5F] ring-2 ring-[#8C7A5F]/20 scale-[1.01]' 
                    : 'border-[#EBE5DA] hover:border-stone-400'
                }`}
              >
                {/* Card top banner with meta labels */}
                <div className="p-4 border-b border-[#EBE5DA] bg-[#FAF8F5] flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-black text-stone-900 flex items-center gap-1">
                      {styleDef.name}
                    </h3>
                    <p className="text-[10px] text-stone-500 mt-0.5">{styleDef.description}</p>
                  </div>

                  <div className="flex gap-1">
                    {isSuggested && (
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-600" />
                        Recomendado IA
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-[9px] bg-[#8C7A5F] text-white px-2 py-0.5 rounded-full font-bold">
                        Activo
                      </span>
                    )}
                  </div>
                </div>

                {/* Dynamic Live Miniature View Box */}
                <div className="relative aspect-video overflow-hidden border-b border-[#EBE5DA] bg-stone-100/30 flex items-center justify-center p-3 group-hover:bg-stone-100/50 transition-colors">
                  
                  {/* Embedded Live Preview scaled down to look like a preview card */}
                  <div className="w-full h-full rounded-xl overflow-hidden shadow-2xs pointer-events-none transform scale-[0.9] origin-center group-hover:scale-[0.95] transition-transform duration-300">
                    <div className="w-full h-[300px] overflow-y-auto scrollbar-none text-[8px]">
                      <InvitationPreview 
                        event={previewEvent} 
                        imageUrl={imageUrl} 
                        isMobileSize={true} 
                        customTemplates={customTemplates}
                      />
                    </div>
                  </div>

                  {/* Overlaid preview badge - opens the beautiful local Pop-up/Modal inside this page */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => {
                        setPreviewingStyle(key as TemplateStyle);
                        // Default preview to mobile mode first for elegant appearance
                        setModalMode('mobile');
                      }}
                      className="bg-white/95 backdrop-blur-md border border-stone-200 text-stone-800 text-[11px] font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-stone-100 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-stone-600" /> Previsualizar Grande
                    </button>
                  </div>
                </div>

                {/* Action and design specs footer */}
                <div className="p-4 bg-white flex flex-col gap-3">
                  {/* Color and Typography tag badges */}
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                      {key === 'elegante' ? 'Tipografía Serif' : key === 'romantico' ? 'Acuarela Cursiva' : key === 'moderno' ? 'Minimalista Oscuro' : key === 'festivo' ? 'Fiestero Pop' : 'Textura Rústica'}
                    </span>
                    <span className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                      {key === 'elegante' ? 'Fondo Piedra' : key === 'romantico' ? 'Fondo Rosa' : key === 'moderno' ? 'Modo Oscuro' : key === 'festivo' ? 'Fondo Amarillo' : 'Fondo Arcilla'}
                    </span>
                  </div>

                  {/* Template Selection Control Button */}
                  <button
                    onClick={() => onSelectStyle(key as TemplateStyle)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected 
                        ? 'bg-stone-100 text-[#8C7A5F] border border-[#8C7A5F]/20 font-black cursor-default' 
                        : 'bg-[#8C7A5F] hover:bg-[#73634B] text-white shadow-sm'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#8C7A5F]" />
                        PLANTILLA SELECCIONADA Y ACTIVA
                      </>
                    ) : (
                      <>
                        Aplicar Plantilla a mi Invitación
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 3: CUSTOM USER-UPLOADED TEMPLATES FOR THE ACTIVE CATEGORY */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex flex-col gap-1 pb-2 border-b border-[#EBE5DA]">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center bg-emerald-700 text-white w-5 h-5 rounded-full text-[10px] font-black">3</span>
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              Plantillas Personalizadas del Administrador ({currentCategoryMeta?.name || 'tu Evento'})
            </h3>
          </div>
          <p className="text-[11px] text-stone-400 font-medium">
            Estas son las plantillas premium cargadas en formato HTML+Tailwind desde el <strong className="text-stone-700">Panel de Administrador</strong>.
          </p>
        </div>

        {matchingCustomTemplates.length === 0 ? (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8 text-center flex flex-col items-center gap-3">
            <span className="text-2xl">📝</span>
            <h4 className="text-xs font-black text-emerald-900">No hay plantillas personalizadas cargadas para esta categoría</h4>
            <p className="text-[11px] text-stone-500 max-w-md leading-relaxed">
              Crea o sube plantillas personalizadas en formato HTML+Tailwind usando nuestro nuevo <strong className="text-emerald-800">Panel de Administrador</strong> en la barra de navegación superior. ¡Podrás cargar diseños ilimitados hechos con ChatGPT!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-2">
            {matchingCustomTemplates.map((customTemp) => {
              const isSelected = activeEvent.style === customTemp.id;
              
              const previewEvent: EventData = {
                ...activeEvent,
                style: customTemp.id
              };

              return (
                <div 
                  key={customTemp.id}
                  className={`bg-white rounded-3xl border overflow-hidden shadow-md flex flex-col justify-between transition-all duration-300 group hover:shadow-xl ${
                    isSelected 
                      ? 'border-emerald-600 ring-2 ring-emerald-600/20 scale-[1.01]' 
                      : 'border-[#EBE5DA] hover:border-emerald-500'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-[#EBE5DA] bg-emerald-50/20 flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {customTemp.name}
                      </h3>
                      <p className="text-[10px] text-stone-500 mt-0.5">{customTemp.description}</p>
                    </div>

                    <div className="flex gap-1">
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                        Personalizada
                      </span>
                      {isSelected && (
                        <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                          Activa
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Miniature Box Preview */}
                  <div className="relative aspect-video overflow-hidden border-b border-[#EBE5DA] bg-stone-150/30 flex items-center justify-center p-3 group-hover:bg-stone-100/50 transition-colors">
                    <div className="w-full h-full rounded-xl overflow-hidden shadow-2xs pointer-events-none transform scale-[0.9] origin-center group-hover:scale-[0.95] transition-transform duration-300">
                      <div className="w-full h-[300px] overflow-y-auto scrollbar-none text-[8px]">
                        <InvitationPreview 
                          event={previewEvent} 
                          imageUrl={imageUrl} 
                          isMobileSize={true} 
                          customTemplates={customTemplates}
                        />
                      </div>
                    </div>

                    {/* Pop-up trigger */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => {
                          setPreviewingStyle(customTemp.id);
                          setModalMode('mobile');
                        }}
                        className="bg-white/95 backdrop-blur-md border border-stone-200 text-stone-800 text-[11px] font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-stone-100 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" /> Previsualizar Grande
                      </button>
                    </div>
                  </div>

                  {/* Card Footer Info & Controls */}
                  <div className="p-4 bg-white flex flex-col gap-3">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">
                        Título: {customTemp.fontTitle}
                      </span>
                      <span className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                        Cuerpo: {customTemp.fontBody}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectStyle(customTemp.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected 
                          ? 'bg-stone-150 text-emerald-700 border border-emerald-600/20 font-black cursor-default' 
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          PLANTILLA SELECCIONADA Y ACTIVA
                        </>
                      ) : (
                        <>
                          Aplicar Plantilla a mi Invitación
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* IMMERSIVE POP-UP OVERLAY (MODAL PREVIEW)   */}
      {/* ========================================== */}
      {previewingStyle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/80 backdrop-blur-md transition-all duration-300"
          onClick={(e) => {
            // Close modal if clicking on the backdrop area
            if (e.target === e.currentTarget) {
              setPreviewingStyle(null);
            }
          }}
        >
          {/* Modal Card Panel */}
          <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-in">
            
            {/* Pop-up Sticky Header */}
            <div className="p-4 sm:p-5 border-b border-[#EBE5DA] bg-white flex items-center justify-between gap-4 sticky top-0 z-20">
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8C7A5F] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                  PREVISUALIZACIÓN DE PLANTILLA
                </span>
                <h3 className="text-sm sm:text-base font-black text-stone-900 truncate mt-0.5">
                  Diseño: {TEMPLATE_STYLES[previewingStyle as Exclude<TemplateStyle, string>]?.name || customTemplates.find(t => t.id === previewingStyle)?.name}
                </h3>
              </div>

              {/* Header Right Action controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    onSelectStyle(previewingStyle);
                    setPreviewingStyle(null);
                  }}
                  className="bg-[#8C7A5F] hover:bg-[#73634B] text-white text-[11px] font-black px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  APLICAR ESTILO
                </button>
                
                <button
                  onClick={() => setPreviewingStyle(null)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 p-2.5 rounded-xl border border-stone-200 transition-all cursor-pointer"
                  title="Cerrar Previsualización"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub-Header Interactive Switcher Bar */}
            <div className="bg-[#FAF8F5] border-b border-[#EBE5DA] px-5 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-left">
                <p className="text-[11px] text-stone-500 font-medium">
                  Información cargada de tu <strong className="text-stone-800">{currentCategoryMeta?.name || 'Evento'}</strong> adaptada a este diseño familiar.
                </p>
              </div>

              {/* Switcher Device Devices */}
              <div className="flex bg-white border border-[#EBE5DA] p-1 rounded-xl self-start sm:self-auto shadow-2xs">
                <button
                  onClick={() => setModalMode('mobile')}
                  className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    modalMode === 'mobile'
                      ? 'bg-[#8C7A5F] text-white shadow-3xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Celular
                </button>
                <button
                  onClick={() => setModalMode('web')}
                  className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    modalMode === 'web'
                      ? 'bg-[#8C7A5F] text-white shadow-3xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  Escritorio (Web)
                </button>
              </div>
            </div>

            {/* Live Interactive Viewer Canvas */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-stone-100/50 min-h-[400px]">
              {modalMode === 'mobile' ? (
                /* Beautiful Simulated Smartphone Bezel */
                <div className="relative w-full max-w-[340px] h-[550px] rounded-[42px] border-[10px] border-stone-850 bg-stone-900 shadow-2xl overflow-hidden flex flex-col justify-between">
                  {/* Speaker & Camera Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-4.5 bg-stone-850 rounded-b-lg z-30 flex items-center justify-center">
                    <div className="w-8 h-0.5 bg-stone-700/80 rounded-full" />
                  </div>
                  
                  {/* Simple mobile bar */}
                  <div className="h-5 w-full px-4 pt-1 flex justify-between items-center text-[7.5px] text-stone-500 font-bold absolute top-0.5 left-0 z-20 pointer-events-none select-none">
                    <span>12:30 🇨🇱</span>
                    <span>LTE</span>
                  </div>

                  {/* Scrolling Viewport */}
                  <div className="flex-1 overflow-y-auto h-full rounded-[32px] bg-[#FAF8F5] scrollbar-none pt-5 pb-2">
                    <InvitationPreview 
                      event={{ ...activeEvent, style: previewingStyle }} 
                      imageUrl={imageUrl} 
                      isMobileSize={true} 
                      customTemplates={customTemplates}
                    />
                  </div>

                  {/* Indicator bottom bar */}
                  <div className="absolute bottom-1 w-full flex justify-center pointer-events-none select-none z-30">
                    <div className="w-16 h-0.75 bg-stone-600 rounded-full" />
                  </div>
                </div>
              ) : (
                /* Simulated Widescreen Desktop Web Browser Mockup */
                <div className="w-full bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden flex flex-col h-[550px]">
                  {/* Simulated Browser Bar */}
                  <div className="h-8 w-full bg-stone-50 border-b border-stone-200 px-4 flex items-center justify-between text-[10px] text-stone-400 select-none">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                    </div>
                    <div className="bg-white rounded border border-stone-200/80 text-stone-500 text-[8.5px] font-medium py-0.5 px-10 truncate max-w-[280px] text-center">
                      invita.app/ver-invitacion
                    </div>
                    <div className="w-6" />
                  </div>

                  {/* Browser content */}
                  <div className="flex-1 overflow-y-auto">
                    <InvitationPreview 
                      event={{ ...activeEvent, style: previewingStyle }} 
                      imageUrl={imageUrl} 
                      isMobileSize={false} 
                      customTemplates={customTemplates}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pop-up Footer Controls */}
            <div className="p-4 border-t border-[#EBE5DA] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-stone-400 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#8C7A5F]" />
                Diseño activo de fondo: <strong className="text-stone-600">{TEMPLATE_STYLES[activeEvent.style as Exclude<TemplateStyle, string>]?.name || customTemplates.find(t => t.id === activeEvent.style)?.name || 'Personalizado'}</strong>
              </span>
              <span className="hidden sm:inline">
                Presiona <kbd className="bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded-md">Esc</kbd> o haz clic fuera para cerrar.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

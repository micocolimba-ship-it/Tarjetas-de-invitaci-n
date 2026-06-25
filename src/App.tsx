import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Copy, 
  Share2, 
  Heart, 
  CheckCircle, 
  Plus, 
  Trash2, 
  DollarSign, 
  Sparkles, 
  Image as ImageIcon, 
  Search, 
  Smartphone, 
  Laptop, 
  Check, 
  RefreshCw,
  Send,
  Home as HomeIcon,
  User as UserIcon,
  HelpCircle,
  ExternalLink,
  QrCode,
  Info,
  Gift,
  X,
  CreditCard,
  MessageSquare,
  Settings,
  Mail
} from 'lucide-react';

import { EventData, GuestRSVP, DonationConfig, EventType, TemplateStyle, BankAccount, CustomTemplate } from './types';
import { TEMPLATE_STYLES, EVENT_TYPES_METADATA, INITIAL_EVENTS, INITIAL_RSVPS, DEFAULT_DONATION_CONFIG } from './data/templates';
import { EDITORIAL_WHITE_TEMPLATE } from './data/editorialTemplate';
import { CURATED_EVENT_IMAGES, searchPixabayImages, generateAiPromptForEvent } from './services/imageService';
import InvitationPreview from './components/InvitationPreview';
import TemplateGallery from './components/TemplateGallery';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Global View State (Home: Vista Invitación completa, Plantillas: Galería, Usuario: Panel de carga, Admin: Panel del administrador)
  const [currentView, setCurrentView] = useState<'home' | 'plantillas' | 'usuario' | 'admin'>('home');
  const [previewMode, setPreviewMode] = useState<'web' | 'mobile'>('web');

  // Application State persistent via LocalStorage
  const [events, setEvents] = useState<EventData[]>(() => {
    const saved = localStorage.getItem('family_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });
  
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    return INITIAL_EVENTS[0].id;
  });

  const [rsvps, setRsvps] = useState<GuestRSVP[]>(() => {
    const saved = localStorage.getItem('family_rsvps');
    return saved ? JSON.parse(saved) : INITIAL_RSVPS;
  });

  const [donationConfig, setDonationConfig] = useState<DonationConfig>(() => {
    const saved = localStorage.getItem('family_donations');
    return saved ? JSON.parse(saved) : DEFAULT_DONATION_CONFIG;
  });

  // Cover image mapping
  const [customImageUrls, setCustomImageUrls] = useState<Record<string, string>>({
    'ejemplo-matrimonio': 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    'ejemplo-cumpleanos': 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1200'
  });

  // Local Storage Synchronizer
  useEffect(() => {
    localStorage.setItem('family_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('family_rsvps', JSON.stringify(rsvps));
  }, [rsvps]);

  useEffect(() => {
    localStorage.setItem('family_donations', JSON.stringify(donationConfig));
  }, [donationConfig]);

  // Custom Admin Templates State
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(() => {
    const saved = localStorage.getItem('family_custom_templates');
    const loaded: CustomTemplate[] = saved ? JSON.parse(saved) : [];
    // Ensure "Editorial White v1.0" is registered in the list of templates.
    const hasEditorial = loaded.some(t => t.id === 'editorial-white-v1');
    if (!hasEditorial) {
      loaded.unshift(EDITORIAL_WHITE_TEMPLATE);
    }
    return loaded;
  });

  useEffect(() => {
    localStorage.setItem('family_custom_templates', JSON.stringify(customTemplates));
  }, [customTemplates]);

  // Google Font Dynamic Loader
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,700;1,300&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Inter:wght@300;400;600;700;800&family=Italiana&family=Lora:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;700;900&family=Outfit:wght@300;400;700;800&family=Parisienne&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Sacramento&family=Space+Grotesk:wght@400;700&display=swap';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleSaveTemplate = (template: CustomTemplate) => {
    setCustomTemplates(prev => {
      const idx = prev.findIndex(t => t.id === template.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = template;
        return copy;
      }
      return [...prev, template];
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== id));
  };

  // Pixabay Search State
  const [pixabayQuery, setPixabayQuery] = useState<string>('');
  const [pixabayKey, setPixabayKey] = useState<string>('44719280-5b512e9b9cf90176313f8c5b9'); // Demo API key
  const [pixabayResults, setPixabayResults] = useState<any[]>([]);
  const [isSearchingPixabay, setIsSearchingPixabay] = useState<boolean>(false);
  const [pixabaySearched, setPixabaySearched] = useState<boolean>(false);

  // AI Helpers
  const [aiPromptOutput, setAiPromptOutput] = useState<string>('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState<boolean>(false);

  // RSVP Guest form inputs
  const [guestName, setGuestName] = useState<string>('');
  const [guestAttending, setGuestAttending] = useState<boolean>(true);
  const [guestCompanions, setGuestCompanions] = useState<number>(0);
  const [guestComment, setGuestComment] = useState<string>('');
  const [rsvpSuccessMessage, setRsvpSuccessMessage] = useState<string>('');

  // Donation Dialog on 'Crear Invitación'
  const [showDonationPopup, setShowDonationPopup] = useState<boolean>(false);
  const [newCreatedEventUrl, setNewCreatedEventUrl] = useState<string>('');

  // Active event selector helpers
  const activeEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId) || events[0] || INITIAL_EVENTS[0];
  }, [events, selectedEventId]);

  const activeTemplate = useMemo(() => {
    return TEMPLATE_STYLES[activeEvent.style] || TEMPLATE_STYLES.elegante;
  }, [activeEvent.style]);

  // Update active event parameters
  const updateActiveEventField = (field: keyof EventData, value: any) => {
    setEvents(prev => prev.map(e => {
      if (e.id === selectedEventId) {
        let updatedStyle = e.style;
        let updatedTitle = e.title;
        let updatedDescription = e.description;

        if (field === 'type') {
          const newType = value as EventType;
          updatedStyle = EVENT_TYPES_METADATA[newType]?.suggestedStyle || 'elegante';

          // Set default templates text based on selected category type
          const isDefaultTitle = [
            'Nuestra Boda Soñada', 
            '¡Mis 30 Primaveras!', 
            'Celebración de Matrimonio / Boda', 
            'Celebración de Cumpleaños',
            'Celebración de Fiesta / Celebración',
            'Celebración de Reunión Familiar',
            'Celebración de Baby Shower',
            'Celebración de Bautizo',
            'Celebración de Confirmación',
            'Celebración de Otro Evento Especial',
            'Mi Santo Bautizo',
            'Mi Confirmación'
          ].some(t => e.title === t || e.title.startsWith('Celebración de'));

          if (isDefaultTitle) {
            if (newType === 'matrimonio') {
              updatedTitle = 'Nuestra Boda Soñada';
              updatedDescription = 'Querida familia, nos llena de felicidad invitarlos a celebrar nuestra unión matrimonial. Ha sido un camino hermoso y queremos compartir el inicio de esta nueva etapa con las personas que más amamos. \n\nVestimenta: Formal. \nRegalo: Lluvia de sobres o transferencia de apoyo.';
            } else if (newType === 'cumpleanos') {
              updatedTitle = '¡Mis 30 Primaveras!';
              updatedDescription = '¡Se viene el cambio de folio! Quiero celebrar un año más de vida compartiendo ricas comidas, buena música y anécdotas con mi familia chilena y colombiana. \n\n¡Los espero para cantar el cumpleaños feliz! No olviden confirmar su asistencia para preparar los bocadillos.';
            } else if (newType === 'bautizo') {
              updatedTitle = 'Mi Santo Bautizo';
              updatedDescription = 'Querida familia y amigos, nos llena de regocijo invitarlos al bautismo de nuestro hijo/a. Queremos compartir con ustedes esta hermosa bendición y consagración ante Dios, rodeados de fe y mucho amor.';
            } else if (newType === 'confirmacion') {
              updatedTitle = 'Mi Confirmación';
              updatedDescription = 'Tengo la alegría de invitarlos a acompañarme en el sacramento de mi Confirmación. Es un paso muy importante en mi vida de fe y deseo de corazón compartir este día tan especial y bendecido con todos ustedes.';
            } else if (newType === 'babyshower') {
              updatedTitle = 'Baby Shower Especial';
              updatedDescription = '¡Un nuevo milagro está por llegar! Queremos invitarlos a celebrar la dulce espera de nuestro bebé. Compartiremos juegos, risas y mucho cariño para prepararnos para este gran momento familiar.';
            } else if (newType === 'fiesta') {
              updatedTitle = '¡Gran Fiesta Familiar!';
              updatedDescription = '¡Cualquier motivo es excelente para sonreír y festejar juntos! Queremos reunirlos a todos para compartir una velada increíble llena de música, baile, comida deliciosa y momentos inolvidables.';
            } else if (newType === 'reunion') {
              updatedTitle = 'Gran Almuerzo Familiar';
              updatedDescription = '¡Ha pasado mucho tiempo! Queremos reunir a toda la familia bajo un mismo techo para reír, ponernos al día y disfrutar de un asado espectacular. Traigan su mejor sonrisa y muchas ganas de compartir.';
            } else {
              updatedTitle = `Celebración Especial`;
              updatedDescription = 'Querida familia, nos encantaría que nos acompañen en este momento tan bonito y especial. ¡No falten!';
            }

            // Also search for a new curated image or set a default one matching the category
            const defaultImg = CURATED_EVENT_IMAGES[newType]?.[0]?.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200';
            setCustomImageUrls(prev => ({ ...prev, [e.id]: defaultImg }));
          }
        }

        const updatedEvent = { 
          ...e, 
          [field]: value, 
          updatedAt: new Date().toISOString() 
        };

        if (field === 'type') {
          updatedEvent.title = updatedTitle;
          updatedEvent.description = updatedDescription;
          updatedEvent.style = updatedStyle;
        }

        return updatedEvent;
      }
      return e;
    }));
  };

  // Create empty template
  const createNewEvent = (type: EventType) => {
    const meta = EVENT_TYPES_METADATA[type];
    const newId = `evento-${Date.now()}`;
    const newEvent: EventData = {
      id: newId,
      type: type,
      style: meta.suggestedStyle,
      title: `Celebración de ${meta.name}`,
      hostName: 'Hans Lavin & Chefie Arias',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '19:30',
      locationName: 'Salón Familiar Principal',
      locationAddress: 'Santiago, Chile / Medellín, Colombia',
      description: 'Querida familia, nos encantaría que nos acompañen en este momento tan bonito y especial. ¡No falten!',
      whatsappContact: '+56912345678',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEvents(prev => [...prev, newEvent]);
    setSelectedEventId(newId);
    
    const initialImg = CURATED_EVENT_IMAGES[type]?.[0]?.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200';
    setCustomImageUrls(prev => ({ ...prev, [newId]: initialImg }));
  };

  // Click on 'CREAR TARJETA E INVITACIÓN'
  const handleDeployInvitation = () => {
    const uniqueUrl = `${window.location.origin}/invitacion/${activeEvent.id}`;
    setNewCreatedEventUrl(uniqueUrl);
    setShowDonationPopup(true);
  };

  const handleClosePopupAndGoHome = () => {
    setShowDonationPopup(false);
    setCurrentView('home');
  };

  const deleteEvent = (id: string) => {
    if (events.length <= 1) {
      alert('Debes mantener al menos una invitación para previsualizar.');
      return;
    }
    const remaining = events.filter(e => e.id !== id);
    setEvents(remaining);
    setSelectedEventId(remaining[0].id);
  };

  // Pixabay search integration
  const handlePixabaySearch = async () => {
    if (!pixabayQuery) return;
    setIsSearchingPixabay(true);
    setPixabaySearched(true);
    try {
      const results = await searchPixabayImages(pixabayQuery, activeEvent.type, pixabayKey);
      setPixabayResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingPixabay(false);
    }
  };

  const selectCoverImage = (url: string) => {
    setCustomImageUrls(prev => ({
      ...prev,
      [activeEvent.id]: url
    }));
  };

  // AI Text Generator
  const generateDescriptionWithAi = () => {
    setIsGeneratingIdea(true);
    setTimeout(() => {
      let smartText = '';
      if (activeEvent.type === 'matrimonio') {
        smartText = `¡Nos casamos! 💍\n\nCon mucha alegría los invitamos a celebrar con nosotros este inicio de un gran camino de amor. \n\n📍 Lugar: ${activeEvent.locationName}\n📅 Fecha: ${activeEvent.date}\n⏰ Hora: ${activeEvent.time}\n\nCódigo de Vestimenta: Formal de Gala.\n\nPara nosotros lo más importante es su compañía, pero si desean realizarnos un obsequio o aportar para nuestro nuevo hogar, pueden hacerlo en la sección de donaciones bancarias de la invitación. ¡Esperamos verlos pronto!`;
      } else if (activeEvent.type === 'cumpleanos') {
        smartText = `¡Se viene una nueva vuelta al sol! 🎂✨\n\nTe invito a celebrar mi cumpleaños. Disfrutaremos de deliciosa comida, música y el mejor ambiente junto a nuestra hermosa familia de Chile y Colombia.\n\n📍 Ubicación: ${activeEvent.locationName}\n⏰ Hora: ${activeEvent.time}\n\n¡Confirma tu asistencia abajo para que preparemos los mejores platillos!`;
      } else if (activeEvent.type === 'babyshower') {
        smartText = `¡Esperamos con amor la llegada de nuestro bebé! 🍼👶🌸\n\nQuerida familia, están invitados a celebrar con nosotros este hermoso baby shower. Compartiremos divertidos juegos y ricas sorpresas.\n\n📍 Dónde: ${activeEvent.locationName}\n📅 Cuándo: ${activeEvent.date}`;
      } else {
        smartText = `¡Gran Encuentro de la Familia! 🏡🥩\n\nInvitamos a toda la familia a este día especial de reencuentro. Traigan todas sus ganas de conversar, comer rico y pasar un domingo maravilloso.\n\n📍 Lugar: ${activeEvent.locationName}\n🍔 Coordinemos la comida compartida.\n\n¡Por favor, confirmen asistencia!`;
      }
      updateActiveEventField('description', smartText);
      setIsGeneratingIdea(false);
    }, 600);
  };

  // AI Prompt compiler
  const triggerPromptGeneration = () => {
    setIsGeneratingPrompt(true);
    setTimeout(() => {
      const prompt = generateAiPromptForEvent(activeEvent.type, activeEvent.style, activeEvent.title, activeEvent.description);
      setAiPromptOutput(prompt);
      setIsGeneratingPrompt(false);
    }, 500);
  };

  // RSVP Form handler
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const newRsvp: GuestRSVP = {
      id: `r-${Date.now()}`,
      eventId: activeEvent.id,
      guestName: guestName,
      attending: guestAttending,
      companions: guestCompanions,
      comment: guestComment,
      confirmedAt: new Date().toISOString()
    };

    setRsvps(prev => [newRsvp, ...prev]);
    setGuestName('');
    setGuestComment('');
    setGuestCompanions(0);
    setRsvpSuccessMessage(`¡Gracias ${guestName}! Tu confirmación se ha registrado exitosamente.`);
    
    setTimeout(() => {
      setRsvpSuccessMessage('');
    }, 5000);
  };

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const copyInvitationLink = () => {
    const shareUrl = `${window.location.origin}/invitacion/${activeEvent.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const activeEventRsvps = useMemo(() => {
    return rsvps.filter(r => r.eventId === activeEvent.id);
  }, [rsvps, activeEvent.id]);

  const stats = useMemo(() => {
    const attendingList = activeEventRsvps.filter(r => r.attending);
    const totalAdults = attendingList.length;
    const totalCompanions = attendingList.reduce((sum, r) => sum + r.companions, 0);
    return {
      confirmedCount: attendingList.length,
      declinedCount: activeEventRsvps.filter(r => !r.attending).length,
      totalGuests: totalAdults + totalCompanions,
      companionsCount: totalCompanions
    };
  }, [activeEventRsvps]);

  return (
    // Global Styling Theme: Cream, Warm Beige, Sand Colors for exquisite elegant family vibes. Fully light/cream theme!
    <div className="min-h-screen bg-[#F9F6F0] text-stone-800 flex flex-col font-sans-modern selection:bg-[#E6DFD3] selection:text-stone-900">
      
      {/* Exquisite Top Bar Navigation */}
      <header className="border-b border-[#EBE5DA] bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 py-4 sm:px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="bg-[#8C7A5F] p-2.5 rounded-xl text-white shadow-sm">
              <Heart className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-stone-900 flex items-center gap-2">
                Tarjeta Familiar Lavin Arias
              </h1>
              <p className="text-[11px] text-stone-500 font-medium">Diseño, plantillas de eventos y confirmaciones para Chile y Colombia 🇨🇱 🇨🇴</p>
            </div>
          </div>

          {/* Nav Links: "Home", "Plantillas" and "Usuario" separated requested */}
          <nav className="flex items-center gap-1 bg-[#F1EBE0] p-1 rounded-xl border border-[#E6DFD3]">
            <button
              id="nav-home-btn"
              onClick={() => setCurrentView('home')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                currentView === 'home'
                  ? 'bg-[#8C7A5F] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
              }`}
            >
              <HomeIcon className="w-3.5 h-3.5" />
              VER INVITACIÓN (Home)
            </button>

            <button
              id="nav-plantillas-btn"
              onClick={() => setCurrentView('plantillas')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                currentView === 'plantillas'
                  ? 'bg-[#8C7A5F] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              PLANTILLAS (Diseños)
            </button>
            
            <button
              id="nav-usuario-btn"
              onClick={() => setCurrentView('usuario')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                currentView === 'usuario'
                  ? 'bg-[#8C7A5F] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              PANEL DE CARGA (Usuario)
            </button>

            <button
              id="nav-admin-btn"
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                currentView === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              ADMIN (Plantillas)
            </button>
          </nav>

          {/* Event Quick switch */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-500 font-semibold hidden md:inline">Selección:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-white border border-[#DCD5C9] text-xs text-stone-800 px-3 py-2 rounded-xl focus:outline-none focus:border-[#8C7A5F]"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {EVENT_TYPES_METADATA[ev.type]?.emoji} {ev.title}
                </option>
              ))}
            </select>
          </div>

        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-8">
        
        {/* ========================================================= */}
        {/* VIEW: HOME (The Invitation Card spans full-width)        */}
        {/* ========================================================= */}
        {currentView === 'home' && (
          <div className="flex flex-col gap-8 w-full">
            
            {/* Header info bar */}
            <div className="bg-[#FAF8F5] border border-[#EBE5DA] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <p className="text-xs text-stone-600 font-medium">
                  Vista preliminar de la invitación para compartir. Los invitados confirmados se registran abajo.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={copyInvitationLink}
                  className="bg-white border border-[#DCD5C9] hover:bg-[#FAF8F5] text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all text-stone-700"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Enlace Copiado' : 'Copiar URL Único'}
                </button>
              </div>
            </div>

            {/* Device Switcher Bar for Web vs Mobile View */}
            <div className="flex justify-center bg-white border border-[#EBE5DA] p-1.5 rounded-2xl max-w-sm mx-auto w-full shadow-sm">
              <button
                id="preview-web-btn"
                onClick={() => setPreviewMode('web')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                  previewMode === 'web'
                    ? 'bg-[#8C7A5F] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                Vista Web (Escritorio)
              </button>
              <button
                id="preview-mobile-btn"
                onClick={() => setPreviewMode('mobile')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                  previewMode === 'mobile'
                    ? 'bg-[#8C7A5F] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Vista Móvil (Celular)
              </button>
            </div>

            {/* CONDITIONAL DEVICE INVITATION RENDERING */}
            {previewMode === 'web' ? (
              <div className="w-full bg-white rounded-3xl border border-[#EBE5DA] overflow-hidden shadow-xl transition-all duration-300">
                <InvitationPreview 
                  event={activeEvent} 
                  imageUrl={customImageUrls[activeEvent.id]} 
                  isMobileSize={false} 
                  customTemplates={customTemplates}
                />
              </div>
            ) : (
              /* Simulated Physical Smartphone */
              <div className="flex flex-col items-center justify-center py-2 w-full">
                <div className="relative w-full max-w-[375px] h-[720px] rounded-[50px] border-[12px] border-stone-850 bg-stone-900 shadow-2xl overflow-hidden flex flex-col justify-between">
                  
                  {/* Notch / Dynamic Island */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-5.5 bg-stone-850 rounded-b-xl z-30 flex items-center justify-center">
                    <div className="w-10 h-0.75 bg-stone-700/80 rounded-full" />
                    <div className="w-2 h-2 bg-stone-800 rounded-full ml-2.5 border border-stone-700/50" />
                  </div>
                  
                  {/* Mobile Status Bar */}
                  <div className="h-7 w-full bg-transparent px-5 pt-1.5 flex justify-between items-center text-[9px] text-stone-500 font-bold absolute top-0.5 left-0 z-20 pointer-events-none select-none">
                    <span>12:30 🇨🇱 🇨🇴</span>
                    <div className="flex items-center gap-1">
                      <span>LTE</span>
                      <div className="w-4 h-2.5 border border-stone-500 rounded-xs flex p-0.5">
                        <div className="w-full h-full bg-stone-500 rounded-2xs"></div>
                      </div>
                    </div>
                  </div>
  
                  {/* Viewport Frame with native vertical scroll */}
                  <div className="flex-1 overflow-y-auto h-full rounded-[38px] bg-[#FAF8F5] scrollbar-none pt-7 pb-4">
                    <InvitationPreview 
                      event={activeEvent} 
                      imageUrl={customImageUrls[activeEvent.id]} 
                      isMobileSize={true} 
                      customTemplates={customTemplates}
                    />
                    
                    {/* Immersive Mobile RSVP form inside Mobile Viewport */}
                    <div className="bg-[#FAF8F5] p-4 border-t border-stone-200">
                      <div className="text-center flex flex-col items-center gap-1.5 pb-4 border-b border-stone-200">
                        <span className="text-xl">✨</span>
                        <h4 className="text-xs font-black text-stone-900">Confirmar Mi Asistencia</h4>
                        <p className="text-[9px] text-stone-400 max-w-[200px]">
                          Formulario optimizado para celulares de la familia.
                        </p>
                      </div>

                      <form onSubmit={handleRsvpSubmit} className="flex flex-col gap-2.5 mt-3">
                        <input
                          type="text"
                          required
                          placeholder="Tu Nombre Completo"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="bg-white border border-[#DCD5C9] text-[10px] text-stone-800 rounded-lg p-2 focus:outline-none focus:border-[#8C7A5F]"
                        />

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setGuestAttending(true)}
                            className={`py-1.5 text-[9px] font-extrabold rounded-lg border transition-all ${
                              guestAttending ? 'bg-[#8C7A5F] text-white border-[#8C7A5F]' : 'bg-white text-stone-600 border-[#DCD5C9]'
                            }`}
                          >
                            Sí, asistiré
                          </button>
                          <button
                            type="button"
                            onClick={() => setGuestAttending(false)}
                            className={`py-1.5 text-[9px] font-extrabold rounded-lg border transition-all ${
                              !guestAttending ? 'bg-rose-700 text-white border-rose-700' : 'bg-white text-stone-600 border-[#DCD5C9]'
                            }`}
                          >
                            No podré
                          </button>
                        </div>

                        {guestAttending && (
                          <select
                            value={guestCompanions}
                            onChange={(e) => setGuestCompanions(Number(e.target.value))}
                            className="bg-white border border-[#DCD5C9] text-[10px] text-stone-850 rounded-lg p-2"
                          >
                            <option value="0">Voy solo/a</option>
                            <option value="1">1 acompañante</option>
                            <option value="2">2 acompañantes</option>
                            <option value="3">3 acompañantes</option>
                          </select>
                        )}

                        <textarea
                          rows={2}
                          placeholder="Mensaje o alergia..."
                          value={guestComment}
                          onChange={(e) => setGuestComment(e.target.value)}
                          className="bg-white border border-[#DCD5C9] text-[10px] text-stone-800 rounded-lg p-2 resize-none"
                        />

                        <button
                          type="submit"
                          className="bg-[#8C7A5F] text-white font-extrabold py-2 px-3 rounded-lg text-[9px] tracking-wider uppercase transition-all"
                        >
                          Enviar Confirmación
                        </button>
                      </form>
                    </div>

                  </div>

                  {/* Physical home indicator line */}
                  <div className="absolute bottom-1 w-full flex justify-center pointer-events-none select-none z-30">
                    <div className="w-20 h-1 bg-stone-600 rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {/* RSVP CARD (FORM DE REGISTRO) - APPEARS AT THE BOTTOM AND MUST BE LIGHT / CREAM COLOR (not black) */}
            <div className="w-full bg-[#FAF8F5] rounded-3xl border border-[#EBE5DA] p-6 sm:p-10 shadow-md">
              
              <div className="max-w-xl mx-auto flex flex-col gap-6">
                
                <div className="text-center flex flex-col items-center gap-1.5 border-b border-[#EBE5DA] pb-5">
                  <div className="bg-[#8C7A5F]/10 p-3 rounded-full text-[#8C7A5F]">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-stone-900 mt-2">Confirmar Mi Asistencia</h3>
                  <p className="text-xs text-stone-500 leading-relaxed max-w-sm">
                    Ayuda a los anfitriones con la preparación de bocadillos, comida y espacio para niños. Tu respuesta se registra inmediatamente.
                  </p>
                </div>

                {rsvpSuccessMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl flex items-center gap-2.5 shadow-xs">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <p className="font-medium">{rsvpSuccessMessage}</p>
                  </div>
                )}

                <form onSubmit={handleRsvpSubmit} className="flex flex-col gap-4">
                  
                  {/* Guest Name input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-stone-600 font-bold">Nombre Completo del Invitado</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Tía María Sol Lavin"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="bg-white border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F] transition-all shadow-2xs"
                    />
                  </div>

                  {/* Attendance validation option buttons */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-stone-600 font-bold">¿Asistirás al Evento?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGuestAttending(true)}
                        className={`py-3 text-xs font-extrabold rounded-xl border transition-all ${
                          guestAttending 
                            ? 'bg-[#8C7A5F] text-white border-[#8C7A5F] shadow-xs' 
                            : 'bg-white text-stone-600 border-[#DCD5C9] hover:bg-[#F9F6F0]'
                        }`}
                      >
                        👍 Sí, asistiré con gusto
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuestAttending(false)}
                        className={`py-3 text-xs font-extrabold rounded-xl border transition-all ${
                          !guestAttending 
                            ? 'bg-rose-700 text-white border-rose-700 shadow-xs' 
                            : 'bg-white text-stone-600 border-[#DCD5C9] hover:bg-[#F9F6F0]'
                        }`}
                      >
                        👎 No podré asistir
                      </button>
                    </div>
                  </div>

                  {/* Companions counter toggle */}
                  {guestAttending && (
                    <div className="flex flex-col gap-1.5 animate-fadeIn">
                      <label className="text-xs text-stone-600 font-bold">Acompañantes adicionales</label>
                      <select
                        value={guestCompanions}
                        onChange={(e) => setGuestCompanions(Number(e.target.value))}
                        className="bg-white border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F] shadow-2xs"
                      >
                        <option value="0">Ninguno (Voy solo/a)</option>
                        <option value="1">Llevo 1 acompañante</option>
                        <option value="2">Llevo 2 acompañantes</option>
                        <option value="3">Llevo 3 acompañantes</option>
                        <option value="4">Llevo 4 acompañantes</option>
                        <option value="5">Llevo 5 o más adicionales</option>
                      </select>
                      <p className="text-[10px] text-stone-400">
                        *Indica si viajan niños o adultos en los comentarios para organizar la comida típica.
                      </p>
                    </div>
                  )}

                  {/* Comment input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-stone-600 font-bold">Mensaje / Alergias Alimentarias</label>
                    <textarea
                      rows={3}
                      placeholder="Ej. ¡Felicitaciones! Estaré feliz de acompañar a la familia. Viajo desde Medellín."
                      value={guestComment}
                      onChange={(e) => setGuestComment(e.target.value)}
                      className="bg-white border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F] transition-all resize-none shadow-2xs"
                    />
                  </div>

                  {/* Submit RSVP btn */}
                  <button
                    type="submit"
                    className="bg-[#8C7A5F] hover:bg-[#73634B] text-white font-extrabold py-3.5 px-6 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    <Send className="w-3.5 h-3.5" /> Enviar Confirmación Familiar
                  </button>

                </form>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW: PLANTILLAS (TEMPLATE SELECTOR GALLERY)              */}
        {/* ========================================================= */}
        {currentView === 'plantillas' && (
          <TemplateGallery 
            activeEvent={activeEvent}
            imageUrl={customImageUrls[activeEvent.id]}
            onSelectStyle={(style) => updateActiveEventField('style', style)}
            onPreviewStyle={(style) => {
              updateActiveEventField('style', style);
              setCurrentView('home');
            }}
            onSelectCategory={(category) => updateActiveEventField('type', category)}
            customTemplates={customTemplates}
          />
        )}

        {/* ========================================================= */}
        {/* VIEW: ADMIN (TEMPLATE CREATION AND CUSTOM MANAGEMENT)     */}
        {/* ========================================================= */}
        {currentView === 'admin' && (
          <AdminPanel 
            customTemplates={customTemplates}
            onSaveTemplate={handleSaveTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />
        )}

        {/* ========================================================= */}
        {/* VIEW: USUARIO (PANEL DE CARGA DE LA INFORMACIÓN)          */}
        {/* ========================================================= */}
        {currentView === 'usuario' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
            
            {/* Left side (cols 1-6): Information Panel loader input */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              <div className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-md">
                
                <div className="border-b border-[#EBE5DA] pb-4">
                  <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#8C7A5F]" /> Panel de Carga de Información
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Carga los datos del evento familiar. Las plantillas se repondrán automáticamente con esta información.
                  </p>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Categoría del Evento</label>
                    <select
                      value={activeEvent.type}
                      onChange={(e) => updateActiveEventField('type', e.target.value as EventType)}
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    >
                      {Object.entries(EVENT_TYPES_METADATA).map(([key, value]) => (
                        <option key={key} value={key}>{value.emoji} {value.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Plantilla / Estilo Visual</label>
                    <select
                      value={activeEvent.style}
                      onChange={(e) => updateActiveEventField('style', e.target.value as TemplateStyle)}
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    >
                      {Object.entries(TEMPLATE_STYLES).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                      ))}
                      {customTemplates.filter(ct => ct.category === activeEvent.type).map(ct => (
                        <option key={ct.id} value={ct.id}>✨ {ct.name} (Pers.)</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Título de la Tarjeta</label>
                  <input
                    type="text"
                    value={activeEvent.title}
                    onChange={(e) => updateActiveEventField('title', e.target.value)}
                    placeholder="Ej. Matrimonio de Hans & Chefie"
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                  />
                </div>

                {/* Hosts & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Nombres Anfitriones</label>
                    <input
                      type="text"
                      value={activeEvent.hostName}
                      onChange={(e) => updateActiveEventField('hostName', e.target.value)}
                      placeholder="Ej. Hans & Chefie"
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Contacto de Ayuda (WhatsApp)</label>
                    <input
                      type="text"
                      value={activeEvent.whatsappContact || ''}
                      onChange={(e) => updateActiveEventField('whatsappContact', e.target.value)}
                      placeholder="Ej. +56912345678"
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    />
                  </div>
                </div>

                {/* Date / Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Fecha de Celebración</label>
                    <input
                      type="date"
                      value={activeEvent.date}
                      onChange={(e) => updateActiveEventField('date', e.target.value)}
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Hora de inicio</label>
                    <input
                      type="time"
                      value={activeEvent.time}
                      onChange={(e) => updateActiveEventField('time', e.target.value)}
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    />
                  </div>
                </div>

                {/* Physical Location Address */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Lugar del Evento</label>
                    <input
                      type="text"
                      value={activeEvent.locationName}
                      onChange={(e) => updateActiveEventField('locationName', e.target.value)}
                      placeholder="Ej. Casa de Hans & Chefie"
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Dirección Física</label>
                    <input
                      type="text"
                      value={activeEvent.locationAddress}
                      onChange={(e) => updateActiveEventField('locationAddress', e.target.value)}
                      placeholder="Ej. Av. Vitacura 5400, Santiago"
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    />
                  </div>
                </div>

                {/* Detailed Description message + AI writer */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Mensaje de Invitación</label>
                    <button
                      type="button"
                      onClick={generateDescriptionWithAi}
                      disabled={isGeneratingIdea}
                      className="text-[10px] text-[#8C7A5F] hover:text-[#73634B] font-bold flex items-center gap-1 bg-[#8C7A5F]/10 border border-[#8C7A5F]/20 px-2.5 py-1 rounded-lg transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      {isGeneratingIdea ? 'Escribiendo...' : 'Asistente IA'}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={activeEvent.description}
                    onChange={(e) => updateActiveEventField('description', e.target.value)}
                    placeholder="Describe los detalles principales del evento de tu familia."
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F] resize-none"
                  />
                </div>

                {/* Envelope Opening Experience Setting */}
                <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-2xl p-4 flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <Mail className="w-4 h-4 text-[#8C7A5F]" /> Experiencia de Apertura de Sobre
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">Controla cómo se presenta la invitación a tus invitados la primera vez que la abren.</p>
                  </div>

                  {/* Selector options */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateActiveEventField('envelopeExperience', 'none')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        activeEvent.envelopeExperience !== 'elegant'
                          ? 'bg-white border-[#8C7A5F] ring-1 ring-[#8C7A5F]/20 shadow-2xs'
                          : 'bg-white/50 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className="text-base mb-1">⚡</span>
                      <span className="text-xs font-bold text-stone-850">Desactivada</span>
                      <span className="text-[9px] text-stone-400 mt-0.5">Ver contenido directo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateActiveEventField('envelopeExperience', 'elegant')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        activeEvent.envelopeExperience === 'elegant'
                          ? 'bg-white border-[#8C7A5F] ring-1 ring-[#8C7A5F]/20 shadow-2xs'
                          : 'bg-white/50 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className="text-base mb-1">✉️</span>
                      <span className="text-xs font-bold text-stone-850">Sobre elegante</span>
                      <span className="text-[9px] text-stone-400 mt-0.5">Apertura física 3D</span>
                    </button>
                  </div>

                  {/* Settings if active */}
                  {activeEvent.envelopeExperience === 'elegant' && (
                    <div className="border-t border-[#EBE5DA] pt-3 flex flex-col gap-3.5 animate-fade-in">
                      {/* Guest Name input */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wide">Nombre del Invitado en el Sobre</label>
                        <input
                          type="text"
                          value={activeEvent.guestName || ''}
                          onChange={(e) => updateActiveEventField('guestName', e.target.value)}
                          placeholder="E.g., Familia Lavin Arias"
                          className="bg-white border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-2.5 focus:outline-none focus:border-[#8C7A5F]"
                        />
                        <p className="text-[9px] text-stone-400">Si dejas este campo en blanco, mostrará "Querida Familia y Amigos".</p>
                      </div>

                      {/* Color selection */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wide">Color de Fondo del Sobre</label>
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          {[
                            { name: 'Forest Green', value: '#1C2E24' },
                            { name: 'Burgundy', value: '#4A2E2B' },
                            { name: 'Navy Blue', value: '#1E2A38' },
                            { name: 'Amber Gold', value: '#8C7A5F' },
                            { name: 'Charcoal', value: '#222222' },
                            { name: 'Soft Rose', value: '#A17F7F' }
                          ].map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => updateActiveEventField('envelopeColor', color.value)}
                              className={`w-6 h-6 rounded-full border shadow-3xs transition-all ${
                                activeEvent.envelopeColor === color.value ? 'scale-115 ring-2 ring-amber-400' : 'hover:scale-105'
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeEvent.envelopeColor || '#1C2E24'}
                            onChange={(e) => updateActiveEventField('envelopeColor', e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-[#DCD5C9] p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={activeEvent.envelopeColor || '#1C2E24'}
                            onChange={(e) => updateActiveEventField('envelopeColor', e.target.value)}
                            placeholder="#1C2E24"
                            className="bg-white border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-2 w-28 font-mono focus:outline-none focus:border-[#8C7A5F]"
                          />
                        </div>
                      </div>

                      {/* Monogram / Seal option */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wide">Sello / Monograma de Cera</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'heart', label: '❤️ Corazón' },
                            { id: 'sparkles', label: '✨ Destellos' },
                            { id: 'monogram', label: '✍️ Monograma' }
                          ].map((seal) => (
                            <button
                              key={seal.id}
                              type="button"
                              onClick={() => {
                                if (seal.id === 'monogram') {
                                  updateActiveEventField('envelopeSeal', 'H&C');
                                } else {
                                  updateActiveEventField('envelopeSeal', seal.id);
                                }
                              }}
                              className={`py-2 px-2.5 rounded-lg border text-center text-[10px] font-bold transition-all ${
                                (seal.id === 'monogram' && activeEvent.envelopeSeal !== 'heart' && activeEvent.envelopeSeal !== 'sparkles') ||
                                (seal.id === 'heart' && activeEvent.envelopeSeal === 'heart') ||
                                (seal.id === 'sparkles' && activeEvent.envelopeSeal === 'sparkles')
                                  ? 'bg-[#8C7A5F] text-white border-[#8C7A5F]'
                                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              {seal.label}
                            </button>
                          ))}
                        </div>

                        {activeEvent.envelopeSeal !== 'heart' && activeEvent.envelopeSeal !== 'sparkles' && (
                          <div className="mt-1.5 flex flex-col gap-1 animate-fade-in">
                            <span className="text-[9px] text-stone-400 font-bold">Texto del monograma (máx 3 caracteres):</span>
                            <input
                              type="text"
                              maxLength={3}
                              value={activeEvent.envelopeSeal || 'H&C'}
                              onChange={(e) => updateActiveEventField('envelopeSeal', e.target.value)}
                              className="bg-white border border-[#DCD5C9] text-xs font-bold text-stone-850 rounded-xl p-2 w-20 text-center uppercase focus:outline-none focus:border-[#8C7A5F]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ACTION BUTTON TO SAVE / DEPLOY & TRIGGER POPUP WITH BANK ACCOUNTS */}
                <button
                  type="button"
                  id="deploy-invitacion-btn"
                  onClick={handleDeployInvitation}
                  className="bg-[#8C7A5F] hover:bg-[#73634B] text-white font-extrabold py-4 px-6 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 mt-1"
                >
                  <Sparkles className="w-4 h-4 animate-bounce" />
                  ✨ CREAR TARJETA E INVITACIÓN
                </button>

              </div>

              {/* Gallery selection for background image */}
              <div className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-md">
                <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#8C7A5F]" /> Imagen de Portada de la Tarjeta
                </h3>
                <p className="text-xs text-stone-500">
                  Selecciona una imagen de nuestro banco de imágenes familiares pre-curadas para la cabecera:
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {(CURATED_EVENT_IMAGES[activeEvent.type] || CURATED_EVENT_IMAGES['otro']).map((img, i) => (
                    <div 
                      key={i} 
                      onClick={() => selectCoverImage(img.url)}
                      className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        customImageUrls[activeEvent.id] === img.url ? 'border-[#8C7A5F] scale-98 shadow-sm' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={img.thumbnailUrl} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {customImageUrls[activeEvent.id] === img.url && (
                        <div className="absolute top-1 right-1 bg-[#8C7A5F] p-1 rounded-full">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right side (cols 7-12): MANDATORY "APOYO AL DESARROLLO Y MEJORA DE LA PLATAFORMA" panel inside Usuario section */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              {/* APOYO AL DESARROLLO Y MEJORA DE LA PLATAFORMA */}
              <div className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-md">
                
                <div className="border-b border-[#EBE5DA] pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-[#8C7A5F] animate-pulse" /> APOYO PARA LA PLATAFORMA
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">Para continuar desarrollando y mejorando la plataforma cada día.</p>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-bold">
                    100% Directo
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Este es un apoyo voluntario para continuar desarrollando y mejorando la plataforma cada día. Dado que esta aplicación es gratis para nuestra familia Lavin Arias, hemos colocado estas cuentas por defecto para recibir aportes de Chile 🇨🇱 y Colombia 🇨🇴. Puedes revisarlas y modificarlas aquí.
                </p>

                {/* Chile Accounts review list */}
                <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-xs font-bold text-stone-800 flex items-center gap-1">
                    🇨🇱 Chile (Soporte y Desarrollo)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {donationConfig.chileAccounts.map((account, index) => (
                      <div key={index} className="bg-white p-3 rounded-xl border border-[#EBE5DA] text-[11px] text-stone-700">
                        <p className="font-bold text-[#8C7A5F]">{account.bankName}</p>
                        <p className="font-medium text-stone-600">{account.accountType}</p>
                        <p className="font-mono text-stone-900 font-semibold mt-1">{account.accountNumber}</p>
                        <p className="text-stone-500 mt-0.5">RUT: {account.holderId}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colombia Accounts review list */}
                <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-xs font-bold text-stone-800 flex items-center gap-1">
                    🇨🇴 Colombia (Soporte y Desarrollo)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {donationConfig.colombiaAccounts.map((account, index) => (
                      <div key={index} className="bg-white p-3 rounded-xl border border-[#EBE5DA] text-[11px] text-stone-700">
                        <p className="font-bold text-[#8C7A5F]">{account.bankName}</p>
                        <p className="font-medium text-stone-600">{account.accountType}</p>
                        <p className="font-mono text-stone-900 font-semibold mt-1">{account.accountNumber}</p>
                        <p className="text-stone-500 mt-0.5">CC: {account.holderId}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Electronic Payment Links */}
                <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-xs font-bold text-stone-800 flex items-center gap-1">
                    🌐 Enlaces Rápidos Electrónicos
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[#EBE5DA] text-xs">
                      <span className="text-stone-600 font-medium">Link Mercado Pago</span>
                      <span className="font-mono text-stone-500 select-all">{donationConfig.mercadoPagoUrl}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[#EBE5DA] text-xs">
                      <span className="text-stone-600 font-medium">Link PayPal</span>
                      <span className="font-mono text-stone-500 select-all">{donationConfig.paypalUrl}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Guest RSVP control list dashboard inside USUARIO page */}
              <div className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-md">
                
                <div className="flex items-center justify-between border-b border-[#EBE5DA] pb-3">
                  <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#8C7A5F]" /> Panel de Invitados Confirmados ({activeEventRsvps.length})
                  </h3>
                  
                  {/* Small stats badges */}
                  <span className="text-[10px] bg-[#8C7A5F]/10 text-[#8C7A5F] px-2 py-0.5 rounded-full font-bold">
                    Asistirán: {stats.totalGuests}
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {activeEventRsvps.length === 0 ? (
                    <div className="text-center py-6 text-stone-400 text-xs">
                      No hay registros aún para esta plantilla.
                    </div>
                  ) : (
                    activeEventRsvps.map(r => (
                      <div key={r.id} className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EBE5DA] flex flex-col gap-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-stone-800">{r.guestName}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            r.attending ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {r.attending ? `Sí (${r.companions + 1})` : 'No asistirá'}
                          </span>
                        </div>
                        {r.comment && <p className="text-stone-500 italic mt-1">"{r.comment}"</p>}
                      </div>
                    ))
                  )}
                </div>

              </div>

              {/* Pixabay real-time image fetcher */}
              <div className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-md">
                <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#8C7A5F]" /> Buscador en Banco de Fotos (Pixabay)
                </h3>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe palabra clave (ej. flores, boda, cake)"
                    value={pixabayQuery}
                    onChange={(e) => setPixabayQuery(e.target.value)}
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl px-3 py-2 flex-1 focus:outline-none focus:border-[#8C7A5F]"
                  />
                  <button
                    onClick={handlePixabaySearch}
                    disabled={isSearchingPixabay}
                    className="bg-[#8C7A5F] text-white hover:bg-[#73634B] text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    {isSearchingPixabay ? '...' : 'Buscar'}
                  </button>
                </div>

                {pixabaySearched && (
                  <div className="grid grid-cols-4 gap-1.5 max-h-[140px] overflow-y-auto mt-2">
                    {pixabayResults.map((img, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => selectCoverImage(img.url)}
                        className="aspect-video relative rounded-lg overflow-hidden cursor-pointer border border-[#EBE5DA] hover:border-[#8C7A5F] transition-all"
                      >
                        <img src={img.thumbnailUrl} alt="Pixabay" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* DIALOG POPUP: APORTE VOLUNTARIO (Cuentas de Banco Chile-Col) */}
      {/* Triggers on clicking 'Crear Invitación' inside Usuario tab */}
      {/* ========================================================= */}
      {showDonationPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#EBE5DA] animate-scaleUp">
            
            {/* Header banner decoration inside modal */}
            <div className="bg-[#8C7A5F] text-white p-6 relative flex flex-col items-center text-center">
              <Gift className="w-10 h-10 mb-2 animate-bounce" />
              <h3 className="text-lg font-extrabold">¡Invitación Creada Exitosamente!</h3>
              <p className="text-xs text-stone-200 mt-1 max-w-xs leading-relaxed">
                ¡Tu enlace URL único de la tarjeta ha sido generado! Tus invitados ya pueden ingresar y confirmar asistencia.
              </p>
            </div>

            {/* Content list with financial support details */}
            <div className="p-6 flex flex-col gap-4 max-h-[420px] overflow-y-auto">
              
              <div className="bg-[#FAF8F5] border border-[#EBE5DA] p-3.5 rounded-xl flex items-start gap-2 text-xs text-stone-600 leading-relaxed">
                <Info className="w-4 h-4 text-[#8C7A5F] flex-shrink-0 mt-0.5" />
                <p>
                  Este es un apoyo voluntario para continuar desarrollando y mejorando la plataforma cada día. Puedes realizar aportes directos a las siguientes cuentas de la familia Lavin Arias:
                </p>
              </div>

              {/* Chile Direct Account support details */}
              <div className="border border-[#EBE5DA] rounded-xl p-3 bg-[#FAF8F5]">
                <p className="text-xs font-extrabold text-stone-800 mb-2">🇨🇱 Transferencias en Chile (Soporte y Desarrollo)</p>
                <div className="flex flex-col gap-2">
                  {donationConfig.chileAccounts.map((account, index) => (
                    <div key={index} className="bg-white p-2.5 rounded-lg border border-[#EBE5DA] text-[11px] text-stone-700">
                      <p className="font-bold text-stone-800">{account.bankName} — <span className="font-semibold text-stone-500">{account.accountType}</span></p>
                      <p className="font-mono text-[#8C7A5F] font-bold mt-0.5">N° {account.accountNumber}</p>
                      <p className="text-[10px] text-stone-500">Titular: {account.holderName} | RUT: {account.holderId}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colombia Direct Account support details */}
              <div className="border border-[#EBE5DA] rounded-xl p-3 bg-[#FAF8F5]">
                <p className="text-xs font-extrabold text-stone-800 mb-2">🇨🇴 Transferencias en Colombia (Soporte y Desarrollo)</p>
                <div className="flex flex-col gap-2">
                  {donationConfig.colombiaAccounts.map((account, index) => (
                    <div key={index} className="bg-white p-2.5 rounded-lg border border-[#EBE5DA] text-[11px] text-stone-700">
                      <p className="font-bold text-stone-800">{account.bankName} — <span className="font-semibold text-stone-500">{account.accountType}</span></p>
                      <p className="font-mono text-[#8C7A5F] font-bold mt-0.5">Celular: {account.accountNumber}</p>
                      <p className="text-[10px] text-stone-500">Titular: {account.holderName} | CC: {account.holderId}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Electronic methods */}
              <div className="flex gap-2">
                <a 
                  href={donationConfig.paypalUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-800 py-2.5 rounded-xl text-center text-xs font-bold transition-all"
                >
                  🌐 PayPal Internacional
                </a>
                <a 
                  href={donationConfig.mercadoPagoUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 bg-[#009EE3]/10 border border-[#009EE3]/20 hover:bg-[#009EE3]/20 text-[#009EE3] py-2.5 rounded-xl text-center text-xs font-bold transition-all"
                >
                  💳 Mercado Pago Chile
                </a>
              </div>

            </div>

            {/* Footer with actions */}
            <div className="bg-[#FAF8F5] border-t border-[#EBE5DA] p-4 flex gap-2">
              <button
                onClick={handleClosePopupAndGoHome}
                className="w-full bg-[#8C7A5F] hover:bg-[#73634B] text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Listo, ver mi Tarjeta en la Home
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Footer credit note */}
      <footer className="border-t border-[#EBE5DA] bg-white py-5 px-4 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Familia Lavin Arias. Todos los derechos reservados.</p>
          <p className="font-semibold text-stone-700">Desarrollado con amor para Chile y Colombia 🇨🇱 ❤️ 🇨🇴</p>
        </div>
      </footer>

    </div>
  );
}

import React, { useState } from 'react';
import { 
  Sparkles, 
  Code, 
  Plus, 
  Trash2, 
  Check, 
  Info, 
  ArrowRight, 
  Copy, 
  Type, 
  FileText, 
  AlertCircle,
  Eye,
  Settings,
  History,
  Braces,
  HelpCircle,
  ArrowLeftRight,
  RefreshCw,
  Wand2
} from 'lucide-react';
import { EventType, CustomTemplate, TemplateConfig } from '../types';
import { EVENT_TYPES_METADATA } from '../data/templates';

interface AdminPanelProps {
  customTemplates: CustomTemplate[];
  onSaveTemplate: (template: CustomTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

const PRESET_FONTS = {
  titles: [
    { name: 'Great Vibes', type: 'cursive', description: 'Cursiva muy fluida, romántica y clásica' },
    { name: 'Playfair Display', type: 'serif', description: 'Serif elegante, editorial y formal' },
    { name: 'Cinzel', type: 'serif', description: 'Mayúsculas de estilo romano, ideal para bodas' },
    { name: 'Dancing Script', type: 'cursive', description: 'Cursiva moderna, alegre e informal' },
    { name: 'Alex Brush', type: 'cursive', description: 'Cursiva elegante de trazo fino' },
    { name: 'Sacramento', type: 'cursive', description: 'Caligrafía fina, delicada y artística' },
    { name: 'Parisienne', type: 'cursive', description: 'Cursiva clásica con aire parisino' },
    { name: 'Italiana', type: 'serif', description: 'Serif inspirada en caligrafía clásica italiana' },
    { name: 'Cormorant Garamond', type: 'serif', description: 'Serif tradicional muy sofisticada' },
    { name: 'Montserrat', type: 'sans-serif', description: 'Geométrica, moderna y de gran impacto' },
    { name: 'Space Grotesk', type: 'sans-serif', description: 'Tech vanguardista, brutalista y limpia' }
  ],
  bodies: [
    { name: 'Inter', type: 'sans-serif', description: 'Neutral, súper legible y limpia' },
    { name: 'Montserrat', type: 'sans-serif', description: 'Moderna, geométrica y con mucha personalidad' },
    { name: 'Lora', type: 'serif', description: 'Serif con un toque literario muy legible' },
    { name: 'Cormorant Garamond', type: 'serif', description: 'Serif delgada y sumamente distinguida' },
    { name: 'Outfit', type: 'sans-serif', description: 'Moderna de esquinas suaves y amigables' },
    { name: 'JetBrains Mono', type: 'monospace', description: 'Estilo técnico de espaciado perfecto' }
  ]
};

const REQUIRED_PLACEHOLDERS = [
  { name: 'title', label: '{{title}}', desc: 'Título principal' },
  { name: 'hostName', label: '{{hostName}}', desc: 'Anfitriones' },
  { name: 'date', label: '{{date}}', desc: 'Fecha formateada' },
  { name: 'time', label: '{{time}}', desc: 'Hora' },
  { name: 'locationName', label: '{{locationName}}', desc: 'Nombre del lugar' },
  { name: 'locationAddress', label: '{{locationAddress}}', desc: 'Dirección física' },
  { name: 'description', label: '{{description}}', desc: 'Descripción o párrafo' },
  { name: 'imageUrl', label: '{{imageUrl}}', desc: 'URL de imagen de portada' },
  { name: 'whatsappContact', label: '{{whatsappContact}}', desc: 'WhatsApp de contacto' },
];

const EXTENDED_PLACEHOLDERS = [
  { name: 'countdown', label: '{{countdown}}', desc: 'Reloj de Cuenta Regresiva Activa' },
  { name: 'spotify', label: '{{spotify}}', desc: 'Buzón para Sugerir Canción / Música' },
  { name: 'gallery', label: '{{gallery}}', desc: 'Galería de Álbum de Fotos' },
  { name: 'video', label: '{{video}}', desc: 'Contenedor de Video del Evento' },
  { name: 'giftLink', label: '{{giftLink}}', desc: 'Botón Elegante para Regalos/Aportes' },
  { name: 'maps', label: '{{maps}}', desc: 'Botón Directo a Google Maps' },
  { name: 'waze', label: '{{waze}}', desc: 'Botón Directo a Waze' },
  { name: 'qrCode', label: '{{qrCode}}', desc: 'Código QR para Confirmaciones' },
  { name: 'dressCode', label: '{{dressCode}}', desc: 'Sección del Código de Vestimenta' },
  { name: 'hotel', label: '{{hotel}}', desc: 'Hospedajes recomendados' },
  { name: 'schedule', label: '{{schedule}}', desc: 'Cronograma / Itinerario de actividades' },
  { name: 'menu', label: '{{menu}}', desc: 'Menú o plato del banquete' },
  { name: 'children', label: '{{children}}', desc: 'Nota/Icono sobre admisión de niños' },
  { name: 'instagram', label: '{{instagram}}', desc: 'Redes Sociales y hashtag del evento' },
  { name: 'confirmationDeadline', label: '{{confirmationDeadline}}', desc: 'Banner de Fecha Límite' },
  { name: 'eventType', label: '{{eventType}}', desc: 'Categoría en mayúsculas' },
  { name: 'theme', label: '{{theme}}', desc: 'Tema cromático' }
];

const DEFAULT_SAMPLE_HTML = `<div class="bg-white border-2 border-[#8C7A5F]/20 rounded-[32px] p-6 sm:p-10 text-center flex flex-col gap-6 shadow-xl max-w-xl mx-auto my-4 relative overflow-hidden">
  
  <!-- Ornamento Superior Sutil -->
  <div class="flex items-center justify-center gap-2 text-stone-400">
    <span class="w-8 h-[1px] bg-stone-300"></span>
    <span class="text-lg">✨</span>
    <span class="w-8 h-[1px] bg-stone-300"></span>
  </div>

  <!-- Título con Fuente Personalizable de Google Fonts -->
  <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-800 leading-tight" style="font-family: '{{fontTitle}}', serif;">
    {{title}}
  </h1>
  
  <p class="text-[11px] text-[#8C7A5F] tracking-widest uppercase font-black">
    Anfitriones: {{hostName}}
  </p>

  <!-- Imagen de Portada Dinámica con Borde Redondeado -->
  <div class="rounded-2xl overflow-hidden shadow-md aspect-[16/9] border border-stone-100">
    <img src="{{imageUrl}}" class="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-500" alt="Invitación" />
  </div>

  <!-- Componente de Cuenta Regresiva Reutilizable -->
  {{countdown}}

  <!-- Grilla Informativa Estilo Minimalista -->
  <div class="grid grid-cols-2 gap-4 border-y border-stone-200/60 py-5 text-left text-xs text-stone-700">
    <div class="border-r border-stone-200/60 pr-2">
      <p class="font-extrabold uppercase text-[9px] text-stone-400 tracking-wider">Cuándo</p>
      <p class="font-black text-stone-800 mt-1">{{date}}</p>
      <p class="text-stone-500 text-[10px] mt-0.5">A las {{time}} hrs</p>
    </div>
    <div class="pl-2">
      <p class="font-extrabold uppercase text-[9px] text-stone-400 tracking-wider">Dónde</p>
      <p class="font-black text-stone-800 mt-1 truncate">{{locationName}}</p>
      <p class="text-stone-500 text-[10px] mt-0.5 truncate">{{locationAddress}}</p>
    </div>
  </div>

  <!-- Itinerario de actividades -->
  {{schedule}}

  <!-- Cuerpo Narrativo del Evento con Fuente de Google Fonts -->
  <p class="text-xs italic leading-relaxed text-stone-600 font-light" style="font-family: '{{fontBody}}', sans-serif;">
    {{description}}
  </p>

  <!-- Código de vestimenta -->
  {{dressCode}}

  <!-- Playlist de música y sugerencias -->
  {{spotify}}

  <!-- Botones de Navegación -->
  <div class="flex flex-wrap justify-center gap-2 mt-2">
    {{maps}}
    {{waze}}
  </div>

  <!-- Botón WhatsApp de Consultas Dinámico -->
  <div class="flex justify-center mt-2">
    <a href="https://wa.me/{{whatsappContact}}" target="_blank" class="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-850 text-white text-[10px] font-bold px-4 py-2 rounded-full transition-all">
      💬 Contactar a Anfitriones
    </a>
  </div>

</div>`;

export default function AdminPanel({ 
  customTemplates, 
  onSaveTemplate, 
  onDeleteTemplate 
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'crear' | 'guia' | 'tipografias'>('crear');
  
  // Create / Edit Template Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [templateCategory, setTemplateCategory] = useState<EventType>('matrimonio');
  const [fontTitle, setFontTitle] = useState('Great Vibes');
  const [fontBody, setFontBody] = useState('Inter');
  const [htmlContent, setHtmlContent] = useState(DEFAULT_SAMPLE_HTML);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [engine, setEngine] = useState<'classic' | 'v2'>('classic');

  // Advanced Config State (Request 9)
  const [author, setAuthor] = useState('Administrador');
  const [version, setVersion] = useState('1.0.0');
  const [tags, setTags] = useState('boda, elegante, premium');
  const [status, setStatus] = useState<'Borrador' | 'Publicado' | 'Activo'>('Publicado');
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  // AI Assistant States (Request 2)
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuccess, setAiSuccess] = useState('');

  const detectVariables = (html: string): string[] => {
    const matches = html.match(/\{\{([^}]+)\}\}/g) || [];
    return Array.from(new Set(matches.map(m => m.replace(/[\{\}]/g, '').trim())));
  };

  const currentVariables = detectVariables(htmlContent);

  // Real-time Placeholders analyzer (Request 8)
  const missingRequiredPlaceholders = REQUIRED_PLACEHOLDERS.filter(
    p => !currentVariables.includes(p.name)
  );

  const handleEditInit = (t: CustomTemplate) => {
    setEditingId(t.id);
    setTemplateName(t.name);
    setTemplateDesc(t.description);
    setTemplateCategory(t.category);
    setFontTitle(t.fontTitle);
    setFontBody(t.fontBody);
    setHtmlContent(t.htmlContent);
    setEngine(t.engine || 'classic');

    if (t.config) {
      setAuthor(t.config.author || 'Administrador');
      setVersion(t.config.version || '1.0.0');
      setTags(t.config.tags?.join(', ') || 'boda, elegante, premium');
      setStatus(t.config.status || 'Publicado');
    } else {
      setAuthor('Administrador');
      setVersion('1.0.0');
      setTags('boda, elegante, premium');
      setStatus('Publicado');
    }
    setAiError('');
    setAiSuccess('');
    setActiveTab('crear');
  };

  const handleResetForm = () => {
    setEditingId(null);
    setTemplateName('');
    setTemplateDesc('');
    setTemplateCategory('matrimonio');
    setFontTitle('Great Vibes');
    setFontBody('Inter');
    setHtmlContent(DEFAULT_SAMPLE_HTML);
    setAuthor('Administrador');
    setVersion('1.0.0');
    setTags('boda, elegante, premium');
    setStatus('Publicado');
    setEngine('classic');
    setAiError('');
    setAiSuccess('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || !htmlContent.trim()) return;

    // Detect versions list
    const existing = customTemplates.find(ct => ct.id === editingId);
    let updatedVersions = existing?.versions || [];

    // Push previous version to history if we are updating (Request 12)
    if (existing) {
      const prevVer = existing.config?.version || '1.0.0';
      const isAlreadyInHistory = updatedVersions.some(v => v.versionNumber === prevVer && v.htmlContent === existing.htmlContent);
      if (!isAlreadyInHistory) {
        updatedVersions = [
          {
            versionId: `v-${Date.now()}`,
            versionNumber: prevVer,
            date: existing.config?.date || new Date().toISOString().split('T')[0],
            htmlContent: existing.htmlContent,
            fontTitle: existing.fontTitle,
            fontBody: existing.fontBody,
            engine: existing.engine || 'classic',
            config: existing.config || {
              name: existing.name,
              category: existing.category,
              author: 'Administrador',
              version: prevVer,
              date: new Date().toISOString().split('T')[0],
              description: existing.description,
              tags: [],
              variablesUsed: detectVariables(existing.htmlContent),
              fontTitle: existing.fontTitle,
              fontBody: existing.fontBody,
              status: 'Publicado',
              engine: existing.engine || 'classic'
            }
          },
          ...updatedVersions
        ];
      }
    }

    const configObj: TemplateConfig = {
      name: templateName,
      category: templateCategory,
      author: author || 'Administrador',
      version: version || '1.0.0',
      date: new Date().toISOString().split('T')[0],
      description: templateDesc || 'Diseño personalizado para eventos familiares.',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      variablesUsed: currentVariables,
      fontTitle,
      fontBody,
      status,
      engine
    };

    const newTemplate: CustomTemplate = {
      id: editingId || `custom-${Date.now()}`,
      name: templateName,
      description: templateDesc || 'Plantilla de diseño personalizado creada por el administrador.',
      category: templateCategory,
      fontTitle,
      fontBody,
      htmlContent,
      createdAt: editingId ? (existing?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      config: configObj,
      versions: updatedVersions,
      engine
    };

    onSaveTemplate(newTemplate);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
    handleResetForm();
  };

  const handleLoadSample = () => {
    setHtmlContent(DEFAULT_SAMPLE_HTML);
  };

  const handleRestoreVersion = (v: any) => {
    setHtmlContent(v.htmlContent);
    setFontTitle(v.fontTitle);
    setFontBody(v.fontBody);
    if (v.config) {
      setTemplateName(v.config.name || templateName);
      setTemplateDesc(v.config.description || templateDesc);
      setAuthor(v.config.author || author);
      setVersion(v.versionNumber || version);
      setTags(v.config.tags?.join(', ') || tags);
      setStatus(v.config.status || status);
    }
    setAiSuccess(`Restaurada con éxito la versión ${v.versionNumber} en el editor activo.`);
  };

  // AI Generation Fetch (Request 2)
  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setAiError('');
    setAiSuccess('');

    try {
      const response = await fetch('/api/generate-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promptDescription: aiPrompt,
          category: templateCategory
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error de conexión con el motor de IA.');
      }

      setTemplateName(data.name);
      setTemplateDesc(data.description);
      setFontTitle(data.fontTitle);
      setFontBody(data.fontBody);
      setHtmlContent(data.htmlContent);
      setTags(data.tags?.join(', ') || 'ia, ' + templateCategory);
      setVersion('1.0.0');
      setAuthor('Asistente Gemini');

      setAiSuccess(`✨ ¡Plantilla "${data.name}" generada con éxito! Se ha cargado el HTML, las variables y las tipografías recomendadas ("${data.fontTitle}" y "${data.fontBody}") en el editor.`);
      setAiPrompt('');
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'No se pudo generar la plantilla. Por favor verifica que tu GEMINI_API_KEY esté guardada en la configuración del proyecto.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in pb-16">
      
      {/* Visual Admin Dashboard Header */}
      <div className="bg-white border border-[#EBE5DA] p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-700 flex-shrink-0">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">Motor de Plantillas Familiares</h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xl leading-relaxed">
              Diseña, guarda y conecta plantillas HTML dinámicas. Nuestro <strong className="text-stone-850">Motor de Plantillas Inteligentes</strong> compila layouts modulares con Tailwind CSS, Google Fonts y más de 20 variables en tiempo real.
            </p>
          </div>
        </div>
        
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-800 max-w-xs flex flex-col gap-1.5 self-stretch lg:self-auto justify-center">
          <span className="font-bold flex items-center gap-1.5">
            🔑 Motor de Plantillas Activo:
          </span>
          <p className="text-[11px] leading-relaxed text-stone-600">
            Soporta widgets interactivos de <strong className="text-stone-800">Cuenta regresiva, Spotify, Videos, Regalos y Mapas</strong> automáticamente al colocar sus llaves correspondientes.
          </p>
        </div>
      </div>

      {/* Navigation tabs inside Admin Panel */}
      <div className="flex border-b border-[#EBE5DA] gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('crear')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'crear' 
              ? 'border-b-2 border-emerald-600 text-emerald-800 font-extrabold' 
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <Code className="w-4 h-4" />
          {editingId ? 'Editar Plantilla y Versiones' : 'Subir / Generar Plantilla con IA'}
        </button>
        <button
          onClick={() => setActiveTab('guia')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'guia' 
              ? 'border-b-2 border-emerald-600 text-emerald-800 font-extrabold' 
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Guía de Formato & Variables
        </button>
        <button
          onClick={() => setActiveTab('tipografias')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tipografias' 
              ? 'border-b-2 border-emerald-600 text-emerald-800 font-extrabold' 
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <Type className="w-4 h-4" />
          Conector de Tipografías
        </button>
      </div>

      {/* TAB CONTENT: GUIA DE FORMATO */}
      {activeTab === 'guia' && (
        <div className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> ¿Cómo subir tus plantillas hechas con ChatGPT?
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Es sumamente fácil. Puedes pedirle a ChatGPT u otra IA que genere un fragmento HTML elegante con clases de <strong className="text-stone-700">Tailwind CSS</strong> y soporte responsivo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            
            {/* Left Col: Step by step instructions */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-widest border-b border-stone-100 pb-2">Variables Soportadas (Placeholders)</h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Utiliza estas variables exactas encerradas en dobles llaves <code className="bg-stone-150 px-1 py-0.5 rounded text-rose-600 font-semibold text-[10px]">{"{{ variable }}"}</code> en tu HTML. El sistema las reemplazará automáticamente con la información cargada en vivo por el usuario:
              </p>

              <div className="flex flex-col gap-2 max-h-[450px] overflow-y-auto pr-2 scrollbar-none">
                <p className="text-[10px] text-stone-400 font-bold uppercase mt-2">Obligatorias (Básicas)</p>
                {REQUIRED_PLACEHOLDERS.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] p-2 bg-[#FAF8F5] border border-stone-200/60 rounded-xl">
                    <span className="font-mono text-emerald-700 font-bold">{p.label}</span>
                    <span className="text-stone-500">{p.desc}</span>
                  </div>
                ))}

                <p className="text-[10px] text-stone-400 font-bold uppercase mt-4">Expandidas (Widgets Modulares)</p>
                {EXTENDED_PLACEHOLDERS.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] p-2 bg-stone-50 border border-stone-200/40 rounded-xl">
                    <span className="font-mono text-indigo-700 font-bold">{p.label}</span>
                    <span className="text-stone-500">{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Prompts and examples */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-widest border-b border-stone-100 pb-2">Prompt Sugerido para ChatGPT</h4>
              
              <div className="bg-stone-900 text-stone-300 text-xs p-4 rounded-2xl font-mono relative leading-relaxed overflow-x-auto max-h-[350px]">
                <p className="text-emerald-400 font-bold mb-2"># Copia este prompt para enviarlo a ChatGPT o Gemini:</p>
                <p>
                  "Diseña un fragmento HTML para una invitación familiar elegante usando clases de Tailwind CSS. El diseño debe ser responsivo y verse hermoso tanto en móvil como en escritorio. Usa colores suaves con fondo blanco o crema sutil. Utiliza exactamente estas variables entre llaves para que los textos sean dinámicos:
                  - Titulo principal: {"{{title}}"} usando la fuente '{"{{fontTitle}}"}'.
                  - Anfitriones: {"{{hostName}}"}.
                  - Imagen de portada: {"{{imageUrl}}"} en un contenedor redondeado con aspect-video.
                  - Bloque de fecha: {"{{date}}"} a las {"{{time}}"} hrs.
                  - Bloque de ubicación: {"{{locationName}}"} en {"{{locationAddress}}"}.
                  - Descripción: {"{{description}}"} usando la fuente '{"{{fontBody}}"}'.
                  - Componentes especiales opcionales: {"{{countdown}}"} (reloj de cuenta regresiva), {"{{dressCode}}"} (código de vestimenta), {"{{spotify}}"} (playlist oficial), y los botones de ubicación {"{{maps}}"} y {"{{waze}}"}.

                  Entrega solo el código HTML del contenedor principal sin CSS externo ni etiquetas de script."
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900 text-xs">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="leading-relaxed">
                  <strong className="block font-bold">¿Cómo aplicar las fuentes de Google Fonts?</strong>
                  Al usar las variables <code className="bg-amber-100/50 px-1 py-0.5 rounded font-mono text-rose-700">{"{{fontTitle}}"}</code> y <code className="bg-amber-100/50 px-1 py-0.5 rounded font-mono text-rose-700">{"{{fontBody}}"}</code> en las propiedades de estilo <code className="bg-amber-100/50 px-1 py-0.5 rounded font-mono text-stone-700">style="font-family: '{"{{fontTitle}}"}';"</code>, el sistema cargará e inyectará automáticamente esas fuentes de Google Fonts en tiempo real.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: CONECTOR DE TIPOGRAFIAS */}
      {activeTab === 'tipografias' && (
        <div className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-600 animate-pulse" /> Catálogo de Google Fonts Conectadas
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Estas son las fuentes tipográficas de Google Fonts que el sistema pre-carga. Puedes usarlas en tus plantillas personalizadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
            
            {/* Left: Titles fonts */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-black text-[#8C7A5F] uppercase tracking-widest border-b border-stone-100 pb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Fuentes Recomendadas para Títulos (Elegancia y Caligrafía)
              </h4>

              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-none">
                {PRESET_FONTS.titles.map((f, idx) => (
                  <div key={idx} className="p-4 border border-[#EBE5DA] bg-[#FAF8F5] rounded-2xl flex flex-col gap-1 hover:border-stone-300 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-stone-800">{f.name}</span>
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase">{f.type}</span>
                    </div>
                    {/* Visual Live font preview */}
                    <div className="text-xl py-1 text-stone-900 truncate" style={{ fontFamily: `'${f.name}', serif` }}>
                      Celebramos Nuestro Matrimonio Soñado
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium">{f.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Body fonts */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-black text-[#8C7A5F] uppercase tracking-widest border-b border-stone-100 pb-2 flex items-center gap-1">
                <Type className="w-3.5 h-3.5" />
                Fuentes Recomendadas para Textos de Cuerpo (Alta Legibilidad)
              </h4>

              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-none">
                {PRESET_FONTS.bodies.map((f, idx) => (
                  <div key={idx} className="p-4 border border-[#EBE5DA] bg-[#FAF8F5] rounded-2xl flex flex-col gap-1 hover:border-stone-300 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-stone-800">{f.name}</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">{f.type}</span>
                    </div>
                    {/* Visual Live font preview */}
                    <div className="text-xs py-1 text-stone-600 leading-relaxed truncate" style={{ fontFamily: `'${f.name}', sans-serif` }}>
                      Querida familia, nos llena de regocijo invitarlos al santo bautizo de nuestro hijo. ¡Los esperamos!
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium">{f.description}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: CREAR / GESTIONAR PLANTILLAS */}
      {activeTab === 'crear' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          
          {/* Left Column (cols 1-7): Form to create or edit */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* AI ASSISTANT PANEL (Request 2) */}
            <div className="bg-gradient-to-br from-indigo-50/70 via-[#FAF8F5] to-emerald-50/50 border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-6xl">✨</div>
              
              <div>
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  Crear Plantilla Profesional con IA (Asistente Gemini)
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  Describe detalladamente el estilo estético que buscas. Nuestro motor de IA autocompletará el HTML con Tailwind CSS y vinculará las mejores tipografías.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                <input
                  type="text"
                  placeholder="Ej. Bautizo rústico italiano, con ramas de olivo verdes, fondo de papel crema sutil, flores blancas, código de vestimenta y agenda del evento..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={isGenerating}
                  className="flex-1 bg-white border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                />
                
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-black text-[11px] px-5 py-3 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      Generar con IA
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="font-semibold leading-relaxed">{aiError}</p>
                </div>
              )}

              {aiSuccess && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] p-3 rounded-xl flex items-start gap-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p className="font-semibold leading-relaxed">{aiSuccess}</p>
                </div>
              )}
            </div>
            
            {/* Main Template Editor Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-md">
              
              <div className="border-b border-[#EBE5DA] pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                    <Code className="w-5 h-5 text-emerald-600" />
                    {editingId ? 'Modificar Plantilla Personalizada' : 'Editor Manual de Plantilla HTML'}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Ingresa el nombre de la plantilla, la categoría del evento familiar y el código HTML.
                  </p>
                </div>
                
                {editingId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-600 px-2.5 py-1.5 rounded-lg border border-stone-200 font-bold"
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>

              {saveSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl flex items-center gap-2 shadow-xs">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <p className="font-bold">¡Plantilla guardada y conectada al sistema con éxito!</p>
                </div>
              )}

              {/* Form parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-stone-600 font-extrabold uppercase">Nombre de la Plantilla</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Bautizo Ángeles de Oro"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Category Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-stone-600 font-extrabold uppercase">Categoría Destino</label>
                  <select
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value as EventType)}
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  >
                    {Object.entries(EVENT_TYPES_METADATA).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.emoji} {value.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Description and Engine Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Description */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs text-stone-600 font-extrabold uppercase">Breve Descripción / Detalles</label>
                  <input
                    type="text"
                    placeholder="Ej. Estilo sagrado y refinado con flores blancas, ideal para bautizos o confirmaciones."
                    value={templateDesc}
                    onChange={(e) => setTemplateDesc(e.target.value)}
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-3 focus:outline-none focus:border-emerald-600 w-full"
                  />
                </div>

                {/* Engine Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-stone-600 font-extrabold uppercase">Motor de Renderizado</label>
                  <select
                    value={engine}
                    onChange={(e) => setEngine(e.target.value as 'classic' | 'v2')}
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-3 focus:outline-none focus:border-emerald-600 font-bold"
                  >
                    <option value="classic">Classic Engine (HTML/CSS)</option>
                    <option value="v2">Editorial Engine V2 (Premium)</option>
                  </select>
                </div>

              </div>

              {/* Font settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Title Google Font Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-stone-600 font-extrabold uppercase">Tipografía para Títulos (Google Font)</label>
                  <select
                    value={fontTitle}
                    onChange={(e) => setFontTitle(e.target.value)}
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-3 focus:outline-none focus:border-emerald-600 font-bold"
                  >
                    {PRESET_FONTS.titles.map((f, i) => (
                      <option key={i} value={f.name}>
                        {f.name} ({f.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Body Google Font Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-stone-600 font-extrabold uppercase">Tipografía de Cuerpo (Google Font)</label>
                  <select
                    value={fontBody}
                    onChange={(e) => setFontBody(e.target.value)}
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-3 focus:outline-none focus:border-emerald-600 font-bold"
                  >
                    {PRESET_FONTS.bodies.map((f, i) => (
                      <option key={i} value={f.name}>
                        {f.name} ({f.type})
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Dynamic JSON Config Button (Request 9) */}
              <div className="border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowConfigPanel(!showConfigPanel)}
                  className="text-xs font-black text-stone-700 hover:text-stone-900 flex items-center gap-1.5 bg-[#FAF8F5] px-4 py-2.5 rounded-xl border border-stone-200 transition-all cursor-pointer"
                >
                  <Braces className="w-4 h-4 text-indigo-600" />
                  {showConfigPanel ? 'Ocultar Configuración JSON' : 'Mostrar Configuración JSON de la Plantilla'}
                </button>

                {showConfigPanel && (
                  <div className="bg-stone-50 border border-stone-200 p-4 sm:p-6 rounded-2xl flex flex-col gap-4 mt-3 animate-fade-in text-xs">
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Metadatos de la Plantilla (Configuración de Motor)</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-extrabold text-stone-600 uppercase text-[10px]">Autor de la Plantilla</label>
                        <input 
                          type="text" 
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          className="bg-white border border-stone-250 p-2.5 rounded-lg text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-extrabold text-stone-600 uppercase text-[10px]">Versión Actual</label>
                        <input 
                          type="text" 
                          value={version}
                          onChange={(e) => setVersion(e.target.value)}
                          className="bg-white border border-stone-250 p-2.5 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-extrabold text-stone-600 uppercase text-[10px]">Tags / Etiquetas (Separadas por Comas)</label>
                        <input 
                          type="text" 
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          className="bg-white border border-stone-250 p-2.5 rounded-lg text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-extrabold text-stone-600 uppercase text-[10px]">Estado de Publicación</label>
                        <select 
                          value={status}
                          onChange={(e) => setStatus(e.target.value as any)}
                          className="bg-white border border-stone-250 p-2.5 rounded-lg text-xs font-bold"
                        >
                          <option value="Borrador">📁 Borrador</option>
                          <option value="Publicado">🟢 Publicado</option>
                          <option value="Activo">🔥 Activo en Producción</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-stone-900 text-stone-300 font-mono text-[10px] p-4 rounded-xl leading-relaxed mt-2 overflow-x-auto max-h-[150px]">
                      <span className="text-indigo-400 block mb-1 font-bold">// JSON Auto-Generado del Motor:</span>
                      {JSON.stringify({
                        id: editingId || 'nuevo',
                        name: templateName,
                        category: templateCategory,
                        author,
                        version,
                        date: new Date().toISOString().split('T')[0],
                        description: templateDesc,
                        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                        variablesUsed: currentVariables,
                        fontTitle,
                        fontBody,
                        status
                      }, null, 2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom HTML Content Textarea with Dynamic variables */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-stone-600 font-extrabold uppercase">Código HTML + Clases de Tailwind</label>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-[10px] text-emerald-800 hover:text-emerald-950 font-black underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" /> Cargar Código Base de Ejemplo
                  </button>
                </div>

                <textarea
                  rows={14}
                  required
                  placeholder="Pega aquí tu código HTML personalizado hecho en ChatGPT..."
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="bg-stone-900 text-stone-200 font-mono text-xs rounded-xl p-4 focus:outline-none focus:ring-1 focus:ring-emerald-600 resize-y leading-relaxed border border-stone-800"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  *Asegúrate de incluir las llaves dobles como <code className="bg-stone-100 text-stone-800 font-bold px-1 rounded">{"{{title}}"}</code>, <code className="bg-stone-100 text-stone-800 font-bold px-1 rounded">{"{{date}}"}</code>, etc. para que sea dinámico.
                </p>
              </div>

              {/* PLACEHOLDER ANALYZER WIDGET (Request 8) */}
              <div className="bg-[#FAF8F5] border border-[#DCD5C9] p-4 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-stone-200/60 pb-2">
                  <span className="text-[10px] font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    Analizador de Placeholders Integrado
                  </span>
                  
                  {missingRequiredPlaceholders.length === 0 ? (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Perfecto: 100% Soportado
                    </span>
                  ) : (
                    <span className="text-[9px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" />
                      Faltan {missingRequiredPlaceholders.length} básicos
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {REQUIRED_PLACEHOLDERS.map((p, idx) => {
                    const isPresent = currentVariables.includes(p.name);
                    return (
                      <div 
                        key={idx} 
                        className={`p-2 rounded-xl border flex items-center gap-2 text-[10px] font-medium transition-all ${
                          isPresent 
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 font-bold' 
                            : 'bg-stone-50 border-stone-200 text-stone-400'
                        }`}
                      >
                        <span className="flex-shrink-0">
                          {isPresent ? '🟢' : '⚪'}
                        </span>
                        <div className="truncate">
                          <code className="font-mono text-[9px] block text-stone-800">{p.label}</code>
                          <span className="text-[8px] text-stone-400 font-medium block">{p.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {missingRequiredPlaceholders.length > 0 && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 p-2.5 rounded-xl text-[10px] mt-1 flex gap-1.5 font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <p className="leading-relaxed">
                      Advertencia: Tu plantilla no tiene los placeholders obligatorios: {missingRequiredPlaceholders.map(p => p.label).join(', ')}. Recuerda que los usuarios no verán estos datos si se omiten.
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {editingId ? 'Guardar Nueva Versión de Plantilla' : 'Publicar Plantilla en el Sistema'}
              </button>

            </form>
          </div>

          {/* Right Column (cols 8-12): Custom templates saved manager list */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-3xl p-6 flex flex-col gap-4 shadow-xs">
              
              <div>
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#8C7A5F]" />
                  Tus Plantillas Guardadas ({customTemplates.length})
                </h4>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Lista de plantillas personalizadas guardadas localmente en este navegador.
                </p>
              </div>

              {customTemplates.length === 0 ? (
                <div className="text-center py-10 bg-white border border-stone-200 border-dashed rounded-2xl flex flex-col items-center justify-center p-4">
                  <span className="text-2xl mb-1">📁</span>
                  <p className="text-xs text-stone-400 font-semibold">Aún no has guardado plantillas</p>
                  <p className="text-[10px] text-stone-400 mt-1 max-w-[200px] leading-relaxed">
                    Sube una plantilla en el panel de la izquierda para verla listada aquí.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-1">
                  {customTemplates.map((t) => (
                    <div 
                      key={t.id} 
                      className={`bg-white border p-4 rounded-2xl flex flex-col gap-3 transition-colors shadow-2xs ${
                        editingId === t.id ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-[#EBE5DA] hover:border-emerald-500'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              {EVENT_TYPES_METADATA[t.category]?.name || t.category}
                            </span>
                            {t.config?.version && (
                              <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold">
                                v{t.config.version}
                              </span>
                            )}
                            {t.engine === 'v2' ? (
                              <span className="text-[9px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                Editorial V2
                              </span>
                            ) : (
                              <span className="text-[9px] bg-stone-100 border border-stone-200 text-stone-500 px-2 py-0.5 rounded-full font-bold">
                                Classic
                              </span>
                            )}
                          </div>
                          <h5 className="text-xs font-extrabold text-stone-900 truncate mt-1">
                            {t.name}
                          </h5>
                          <p className="text-[10px] text-stone-400 font-medium truncate mt-0.5">
                            {t.description}
                          </p>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEditInit(t)}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-600 p-2 rounded-lg border border-stone-200/60 transition-colors"
                            title="Editar plantilla"
                          >
                            <Code className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTemplate(t.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-lg border border-rose-200 transition-colors"
                            title="Eliminar plantilla"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Version history sub-widget (Request 12) */}
                      {t.versions && t.versions.length > 0 && (
                        <div className="border-t border-stone-100 pt-2 flex flex-col gap-1.5">
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                            <History className="w-3 h-3 text-stone-400" /> Historial de Cambios ({t.versions.length})
                          </span>
                          <div className="flex flex-col gap-1">
                            {t.versions.map((v) => (
                              <div key={v.versionId} className="flex justify-between items-center text-[9px] bg-stone-50 hover:bg-stone-100 p-1.5 rounded-lg border border-stone-100 transition-colors">
                                <span className="font-medium text-stone-600">
                                  Versión <strong className="text-indigo-700 font-mono">v{v.versionNumber}</strong> ({new Date(v.date).toLocaleDateString()})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRestoreVersion(v)}
                                  className="text-[8px] bg-white border border-stone-250 text-stone-700 px-2 py-0.5 rounded-md hover:border-emerald-600 hover:text-emerald-800 font-bold transition-all uppercase"
                                >
                                  Restaurar
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display Font specifications */}
                      <div className="grid grid-cols-2 gap-2 text-[9px] bg-stone-50 p-2 rounded-xl border border-stone-200/50">
                        <div>
                          <span className="text-stone-400 font-semibold block">Título:</span>
                          <strong className="text-stone-700">{t.fontTitle}</strong>
                        </div>
                        <div>
                          <span className="text-stone-400 font-semibold block">Cuerpo:</span>
                          <strong className="text-stone-700">{t.fontBody}</strong>
                        </div>
                      </div>

                      {t.config?.tags && t.config.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {t.config.tags.map((tag, i) => (
                            <span key={i} className="text-[8px] bg-stone-100 text-stone-500 border border-stone-200 px-1.5 py-0.5 rounded font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-[10px] text-stone-400 flex justify-between items-center border-t border-stone-100 pt-2 font-medium">
                        <span>Creado: {new Date(t.createdAt).toLocaleDateString()}</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Conectado en Galería
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

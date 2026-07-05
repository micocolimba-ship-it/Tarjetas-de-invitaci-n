import React, { Suspense, useMemo } from 'react';
import { EventData } from '../../types';
import { ThemeProviderV3 } from './ThemeProviderV3';
import { componentRegistry } from './componentRegistry';
import { DesignerCreditCard } from '../DesignerCreditCard';

interface V3LayoutComponent {
  type: string;
  variant?: string;
  props?: Record<string, any>;
}

interface V3LayoutJSON {
  engine: 'v3';
  theme?: string;
  palette?: string;
  components: V3LayoutComponent[];
}

interface LayoutEngineV3Props {
  htmlContent: string;
  event: EventData;
  variables: Record<string, string>;
}

export const LayoutEngineV3: React.FC<LayoutEngineV3Props> = ({ htmlContent, event, variables }) => {
  const layout = useMemo<V3LayoutJSON | null>(() => {
    try {
      const parsed = JSON.parse(htmlContent);
      if (parsed && parsed.engine === 'v3' && Array.isArray(parsed.components)) {
        return parsed as V3LayoutJSON;
      }
    } catch (e) {
      console.warn('LayoutEngineV3 failed to parse JSON htmlContent, trying to convert V2/HTML structure if possible', e);
    }
    return null;
  }, [htmlContent]);

  // If parsing fails, provide a gorgeous default V3 template structure based on the event style or defaults!
  const finalLayout = useMemo<V3LayoutJSON>(() => {
    if (layout) return layout;

    // Detect theme/palette from event style (e.g. 'editorial-black-v1' or 'editorial-rose')
    let defaultPalette = 'white';
    if (event.style.includes('black')) defaultPalette = 'black';
    if (event.style.includes('olive')) defaultPalette = 'olive';
    if (event.style.includes('beige')) defaultPalette = 'beige';
    if (event.style.includes('rose')) defaultPalette = 'rose';
    if (event.style.includes('navy')) defaultPalette = 'navy';

    // Generate responsive components order list
    return {
      engine: 'v3',
      palette: defaultPalette,
      components: [
        { type: defaultPalette === 'black' ? 'HeroMagazine' : 'HeroEditorial' },
        { type: 'DividerOlive' },
        { type: 'QuoteEditorial' },
        { type: 'GalleryEditorial' },
        { type: 'DividerGold' },
        { type: 'TimelineElegant' },
        { type: 'RSVPLuxury' },
        { type: 'FooterMinimal' }
      ]
    };
  }, [layout, event.style]);

  return (
    <ThemeProviderV3 palette={finalLayout.palette} theme={finalLayout.theme}>
      <div className="w-full flex flex-col relative">
        {finalLayout.components.map((comp, idx) => {
          const Component = componentRegistry[comp.type];
          if (!Component) {
            console.warn(`Component type "${comp.type}" not found in componentRegistry.`);
            return null;
          }

          return (
            <Suspense 
              key={`${comp.type}-${idx}`}
              fallback={
                <div className="w-full h-40 bg-stone-100/10 flex items-center justify-center border-t border-stone-200/5 select-none animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-[#8C7A5B]/30 animate-ping" />
                </div>
              }
            >
              <Component 
                event={event} 
                variables={variables} 
                variant={comp.variant}
                {...(comp.props || {})}
              />
            </Suspense>
          );
        })}
        <DesignerCreditCard styleId={event.style} />
      </div>
    </ThemeProviderV3>
  );
};
export default LayoutEngineV3;

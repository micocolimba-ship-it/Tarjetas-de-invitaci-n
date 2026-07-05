import React, { lazy } from 'react';
import { V3ComponentProps } from './types';

export const componentRegistry: Record<string, React.ComponentType<V3ComponentProps>> = {
  HeroLuxury: lazy(() => import('./components/HeroLuxury').then(m => ({ default: m.HeroLuxury }))),
  HeroEditorial: lazy(() => import('./components/HeroEditorial').then(m => ({ default: m.HeroEditorial }))),
  HeroMagazine: lazy(() => import('./components/HeroMagazine').then(m => ({ default: m.HeroMagazine }))),
  GalleryEditorial: lazy(() => import('./components/GalleryEditorial').then(m => ({ default: m.GalleryEditorial }))),
  GalleryMasonry: lazy(() => import('./components/GalleryMasonry').then(m => ({ default: m.GalleryMasonry }))),
  GalleryFilm: lazy(() => import('./components/GalleryFilm').then(m => ({ default: m.GalleryFilm }))),
  TimelineElegant: lazy(() => import('./components/TimelineElegant').then(m => ({ default: m.TimelineElegant }))),
  TimelineMinimal: lazy(() => import('./components/TimelineMinimal').then(m => ({ default: m.TimelineMinimal }))),
  PaperCard: lazy(() => import('./components/PaperCard').then(m => ({ default: m.PaperCard }))),
  GlassCard: lazy(() => import('./components/GlassCard').then(m => ({ default: m.GlassCard }))),
  FloatingCard: lazy(() => import('./components/FloatingCard').then(m => ({ default: m.FloatingCard }))),
  DividerGold: lazy(() => import('./components/DividerGold').then(m => ({ default: m.DividerGold }))),
  DividerOlive: lazy(() => import('./components/DividerOlive').then(m => ({ default: m.DividerOlive }))),
  DividerMinimal: lazy(() => import('./components/DividerMinimal').then(m => ({ default: m.DividerMinimal }))),
  QuoteLuxury: lazy(() => import('./components/QuoteLuxury').then(m => ({ default: m.QuoteLuxury }))),
  QuoteEditorial: lazy(() => import('./components/QuoteEditorial').then(m => ({ default: m.QuoteEditorial }))),
  RSVPLuxury: lazy(() => import('./components/RSVPLuxury').then(m => ({ default: m.RSVPLuxury }))),
  FooterLuxury: lazy(() => import('./components/FooterLuxury').then(m => ({ default: m.FooterLuxury }))),
  FooterMinimal: lazy(() => import('./components/FooterMinimal').then(m => ({ default: m.FooterMinimal }))),
};
export default componentRegistry;

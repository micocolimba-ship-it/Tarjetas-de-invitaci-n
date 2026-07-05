import { V3ThemeConfig } from '../themeTypes';
import { editorialWhite } from './editorial-white';
import { editorialOlive } from './editorial-olive';
import { editorialBlack } from './editorial-black';
import { editorialBeige } from './editorial-beige';
import { editorialRose } from './editorial-rose';
import { editorialNavy } from './editorial-navy';

export const v3Themes: Record<string, V3ThemeConfig> = {
  white: editorialWhite,
  olive: editorialOlive,
  black: editorialBlack,
  beige: editorialBeige,
  rose: editorialRose,
  navy: editorialNavy,
  editorial: editorialWhite, // default mapping if palette is called 'editorial'
};

export function getV3Theme(palette: string | undefined): V3ThemeConfig {
  if (!palette) return editorialWhite;
  const normalized = palette.toLowerCase().replace('editorial-', '');
  return v3Themes[normalized] || v3Themes.white;
}

export interface V3ThemeConfig {
  id: string;
  name: string;
  fontTitle: string;
  fontBody: string;
  spacing: {
    sectionPadding: string;
    itemGap: string;
    cardPadding: string;
  };
  shadows: {
    card: string;
    button: string;
  };
  borders: {
    radius: string;
    style: string;
    cardBorder: string;
  };
  colors: {
    background: string; // Tailwind class
    textPrimary: string; // Tailwind class
    textSecondary: string; // Tailwind class
    accent: string; // Hex value
    accentHover: string; // Hex value
    border: string; // Tailwind class
    cardBg: string; // Tailwind class
    overlayBg: string; // Tailwind class for modals/envelopes
    inputBg: string; // Tailwind class
  };
  animation: {
    transition: string;
  };
  button: {
    base: string;
    primary: string;
    outline: string;
  };
  card: {
    base: string;
    luxury: string;
    glass: string;
    floating: string;
    paper: string;
  };
  divider: {
    gold: string;
    olive: string;
    minimal: string;
    floral: string;
    luxury: string;
  };
}

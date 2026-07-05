/**
 * Domain Models for the Family Event Invitations Framework.
 * Represents the structured foundation of events, templates, RSVPs, and donations.
 */

export type EventType = 'matrimonio' | 'cumpleanos' | 'fiesta' | 'reunion' | 'babyshower' | 'bautizo' | 'confirmacion' | 'otro';

export type TemplateStyle = 'elegante' | 'romantico' | 'moderno' | 'festivo' | 'rustico' | string;

export interface TemplateConfig {
  name: string;
  category: string;
  author: string;
  version: string;
  date: string;
  description: string;
  tags: string[];
  thumbnailUrl?: string;
  variablesUsed: string[];
  fontTitle: string;
  fontBody: string;
  status: 'Borrador' | 'Publicado' | 'Activo';
  engine?: 'classic' | 'v2' | 'v3';
}

export interface CustomTemplateVersion {
  versionId: string;
  versionNumber: string;
  date: string;
  htmlContent: string;
  fontTitle: string;
  fontBody: string;
  config: TemplateConfig;
  engine?: 'classic' | 'v2' | 'v3';
}

export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  category: EventType;
  fontTitle: string; // E.g., "Great Vibes" or "Playfair Display"
  fontBody: string; // E.g., "Montserrat" or "Inter"
  htmlContent: string; // Raw HTML or JSON with Tailwind CSS and {{placeholders}}
  createdAt: string;
  config?: TemplateConfig;
  versions?: CustomTemplateVersion[];
  engine?: 'classic' | 'v2' | 'v3';
}

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export interface EventData {
  id: string;
  type: EventType;
  style: TemplateStyle;
  title: string;
  hostName: string; // E.g., "Hans & Chefie" or "Abuelito Juan"
  date: string;
  time: string;
  locationName: string; // E.g., "Casa de Hans" or "Restaurante La Cabrera"
  locationAddress: string;
  locationMapsUrl?: string; // Optional Google Maps link
  description: string; // Detailed invitation text, dress code, etc.
  dressCode?: string; // E.g., "Formal / Elegante"
  dressCodeDescription?: string; // E.g., "Sugerimos traje formal para caballeros y vestido de gala para damas"
  whatsappContact?: string; // To let guests ask questions
  envelopeExperience?: 'none' | 'elegant'; // Opening experience setting
  envelopeColor?: string; // E.g., hex code like "#1c2e24" or "#4a3c31"
  envelopeSeal?: string; // E.g. monogram like "H&C" or icon like "heart", "sparkles"
  guestName?: string; // E.g., "Familia Lavin Arias"
  googleSheetsUrl?: string; // Optional Google Sheets URL for storing / synchronizing RSVPs
  googleSheetsId?: string; // ID of the connected Google Sheet
  googleSheetsName?: string; // Name of the connected Google Sheet
  googleSheetsToken?: string; // Cache the OAuth access token for background guest saves
  googleSheetsLastSync?: string; // Timestamp of last RSVP sync
  musicConfig?: MusicConfig; // New Music Experience Integration
  schedule?: ScheduleItem[]; // Custom editable itinerary list
  galleryImages?: string[]; // Custom gallery images for memory album
  videoUrl?: string; // Custom video URL (YouTube, Vimeo, direct MP4, or Base64 upload)
  imageUrl?: string; // Stored cover image URL
  userId?: string; // Optional user association for security & multi-user scoping
  createdAt: string;
  updatedAt: string;
}

export interface MusicConfig {
  enabled: boolean;
  audioUrl?: string; // Stored MP3 source (Base64 data URL, preset, or custom URL)
  fileName?: string; // Optional name of file
  songName?: string; // Optional song name
  artist?: string; // Optional artist
  initialVolume: number; // 0 to 100
  autoplayOnOpen: boolean;
  loop: boolean;
  showMuteButton: boolean;
  showReplayButton: boolean;
}

export interface GuestRSVP {
  id: string;
  eventId: string;
  guestName: string;
  attending: boolean;
  companions: number; // Number of additional guests
  comment?: string; // Optional message, dietary restrictions, etc.
  confirmedAt: string;
}

export interface BankAccount {
  country: 'Chile' | 'Colombia';
  bankName: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
  holderId: string; // RUT in Chile, CC/NIT in Colombia
  holderEmail?: string;
}

export interface DonationConfig {
  chileAccounts: BankAccount[];
  colombiaAccounts: BankAccount[];
  paypalUrl?: string;
  mercadoPagoUrl?: string;
  qrCodeText?: string; // Text/link inside the QR
}

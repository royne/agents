export const PLATFORMS = {
  META: 'META',
  TIKTOK: 'TIKTOK',
  WHATSAPP: 'WHATSAPP'
} as const;

export type PlatformType = keyof typeof PLATFORMS;

export const PLATFORM_COLORS = {
  [PLATFORMS.META]: 'bg-blue-600',
  [PLATFORMS.TIKTOK]: 'bg-red-600',
  [PLATFORMS.WHATSAPP]: 'bg-green-600'
};

export const PLATFORM_OPTIONS = [
  { value: PLATFORMS.META, label: 'Meta', color: PLATFORM_COLORS[PLATFORMS.META] },
  { value: PLATFORMS.TIKTOK, label: 'TikTok', color: PLATFORM_COLORS[PLATFORMS.TIKTOK] },
  { value: PLATFORMS.WHATSAPP, label: 'WhatsApp', color: PLATFORM_COLORS[PLATFORMS.WHATSAPP] }
];

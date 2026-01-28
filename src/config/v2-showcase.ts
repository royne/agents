/**
 * V2 Showcase Static Configuration
 * Centraliza los activos locales para la Landing Pública y el Dashboard inicial.
 * Estos assets deben estar físicamente en /public/assets/v2/showcase/
 */

export interface ShowcaseAd {
  id: string;
  title: string;
  imageUrl: string;
  hook: string;
  adCta: string;
}

export interface ShowcaseLanding {
  sectionId: string;
  title: string;
  imageUrl: string;
  headline: string;
  body: string;
}

export const SHOWCASE_ADS: ShowcaseAd[] = [
  {
    id: "static-ad-1",
    title: "Minimalist Elegance",
    imageUrl: "/assets/v2/showcase/ads/ad1.webp",
    hook: "Diseño minimalista que eleva el valor percibido de tu marca.",
    adCta: "DESCUBRE MÁS"
  },
  {
    id: "static-ad-2",
    title: "Viral Hooks",
    imageUrl: "/assets/v2/showcase/ads/ad2.webp",
    hook: "Captura la atención en 3 segundos con composiciones dinámicas.",
    adCta: "COMPRAR AHORA"
  },
  {
    id: "static-ad-3",
    title: "Lifestyle Authority",
    imageUrl: "/assets/v2/showcase/ads/ad3.webp",
    hook: "Conecta emocionalmente con tu audiencia ideal.",
    adCta: "PRUÉBALO GRATIS"
  },
  {
    id: "static-ad-4",
    title: "Premium Tech",
    imageUrl: "/assets/v2/showcase/ads/ad4.webp",
    hook: "Resalta cada detalle técnico con iluminación de estudio.",
    adCta: "VER DETALLES"
  },
  {
    id: "static-ad-5",
    title: "Viral Hooks",
    imageUrl: "/assets/v2/showcase/ads/ad5.webp",
    hook: "Captura la atención en 3 segundos con composiciones dinámicas.",
    adCta: "COMPRAR AHORA"
  },
  {
    id: "static-ad-6",
    title: "Lifestyle Authority",
    imageUrl: "/assets/v2/showcase/ads/ad6.webp",
    hook: "Conecta emocionalmente con tu audiencia ideal.",
    adCta: "PRUÉBALO GRATIS"
  }
];

export const SHOWCASE_LANDING_SECTIONS: ShowcaseLanding[] = [
  {
    sectionId: "hero",
    title: "HERO IMPACT",
    imageUrl: "/assets/v2/showcase/landing/landing1.webp",
    headline: "Transforma tu Realidad",
    body: "La primera impresión es la que cierra la venta."
  },
  {
    sectionId: "beneficios",
    title: "BENEFICIOS",
    imageUrl: "/assets/v2/showcase/landing/landing2.webp",
    headline: "Puntos de Dolor Resueltos",
    body: "Soluciones diseñadas para las necesidades reales."
  },
  {
    sectionId: "testimonios",
    title: "PRUEBA SOCIAL",
    imageUrl: "/assets/v2/showcase/landing/landing3.webp",
    headline: "Confianza de Élite",
    body: "Lo que otros dicen de tu marca es tu mayor activo."
  },
  {
    sectionId: "cierre",
    title: "OFERTA IRRESISTIBLE",
    imageUrl: "/assets/v2/showcase/landing/landing4.webp",
    headline: "El Momento es Ahora",
    body: "Cierra la jornada con un llamado a la acción potente."
  },
  {
    sectionId: "section5",
    title: "OFERTA IRRESISTIBLE",
    imageUrl: "/assets/v2/showcase/landing/landing5.webp",
    headline: "El Momento es Ahora",
    body: "Cierra la jornada con un llamado a la acción potente."
  },
  {
    sectionId: "section6",
    title: "HERO IMPACT",
    imageUrl: "/assets/v2/showcase/landing/landing6.webp",
    headline: "Transforma tu Realidad",
    body: "La primera impresión es la que cierra la venta."
  },
  {
    sectionId: "section7",
    title: "BENEFICIOS",
    imageUrl: "/assets/v2/showcase/landing/landing7.webp",
    headline: "Puntos de Dolor Resueltos",
    body: "Soluciones diseñadas para las necesidades reales."
  },
  {
    sectionId: "section8",
    title: "PRUEBA SOCIAL",
    imageUrl: "/assets/v2/showcase/landing/landing8.webp",
    headline: "Confianza de Élite",
    body: "Lo que otros dicen de tu marca es tu mayor activo."
  },
  {
    sectionId: "section9",
    title: "OFERTA IRRESISTIBLE",
    imageUrl: "/assets/v2/showcase/landing/landing9.webp",
    headline: "El Momento es Ahora",
    body: "Cierra la jornada con un llamado a la acción potente."
  },
  {
    sectionId: "section10",
    title: "OFERTA IRRESISTIBLE",
    imageUrl: "/assets/v2/showcase/landing/landing10.webp",
    headline: "El Momento es Ahora",
    body: "Cierra la jornada con un llamado a la acción potente."
  }
];

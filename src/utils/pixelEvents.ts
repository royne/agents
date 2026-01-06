/**
 * Utility to track events with Meta Pixel
 */
export const trackPixelEvent = (eventName: string, options?: object) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, options);
    console.log(`[Meta Pixel] Event tracked: ${eventName}`, options);
  } else {
    console.warn(`[Meta Pixel] fbq not found, event ${eventName} not tracked.`);
  }
};

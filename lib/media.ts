/**
 * Shared media helper utilities for ElectricRate site
 */

export const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.m4v', '.avi', '.mkv'] as const;

export const isVideoMedia = (url?: string | null): boolean => {
  if (!url) return false;
  const clean = url.split('#')[0].split('?')[0].toLowerCase();
  return (
    VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext)) ||
    url.includes('/videos/') ||
    url.includes('#t=')
  );
};

export const isVideoUrl = isVideoMedia;

export const cleanMediaUrl = (url?: string | null): string => {
  if (!url) return '';
  return url.split('#')[0].split('?')[0];
};

export const extractTimecode = (url?: string | null): number => {
  if (!url || !url.includes('#t=')) return 0;
  const tStr = url.split('#t=')[1];
  const parsed = parseFloat(tStr);
  return isNaN(parsed) ? 0 : parsed;
};

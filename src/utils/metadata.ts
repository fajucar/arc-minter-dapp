/**
 * Metadata URL utilities for NFT tokenURI generation
 * Ensures URLs work both locally and in production (GitHub Pages, Vercel, etc.)
 */

/**
 * Get the absolute base URL for the current deployment
 * Handles BASE_URL correctly for GitHub Pages and other deployments
 */
export function getAbsoluteBaseUrl(): string {
  // Use window.location for deployment (works in browser)
  if (typeof window === 'undefined') {
    // SSR fallback - use BASE_URL if available, otherwise empty (will be set at runtime)
    const baseUrl = import.meta.env.BASE_URL || '/';
    return baseUrl;
  }
  
  const origin = window.location.origin;
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // Remove trailing slash from origin and ensure baseUrl starts with /
  const cleanOrigin = origin.replace(/\/$/, '');
  const cleanBase = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
  const cleanBaseUrl = cleanBase.replace(/\/$/, '');
  
  return `${cleanOrigin}${cleanBaseUrl}`;
}

/**
 * Generate tokenURI for NFT metadata JSON
 * @param metadataFileName - Name of the metadata file (e.g., 'arc1.json')
 */
export function getTokenURI(metadataFileName: string): string {
  const base = getAbsoluteBaseUrl();
  return `${base}/metadata/${metadataFileName}`;
}

/**
 * Generate absolute URL for an image in the public folder
 * @param imagePath - Path relative to public folder (e.g., '/arc-nfts/arc1.png')
 */
export function getImageUrl(imagePath: string): string {
  const base = getAbsoluteBaseUrl();
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${base}${cleanPath}`;
}


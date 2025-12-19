/**
 * IPFS Utilities
 * 
 * Converte URLs IPFS para HTTP gateway URLs para garantir que navegadores e carteiras
 * (MetaMask, Rabby, etc.) possam exibir as imagens corretamente.
 */

/**
 * Convert IPFS URLs to HTTP gateway URLs
 * Supports various IPFS URL formats:
 * - ipfs://QmHash...
 * - ipfs://ipfs/QmHash...
 * - https://ipfs.io/ipfs/QmHash...
 * - https://gateway.pinata.cloud/ipfs/QmHash...
 */
export function ipfsToHttp(ipfsUrl: string | undefined | null): string {
  if (!ipfsUrl) {
    return '';
  }

  // If it's already an HTTP URL, return as-is
  if (ipfsUrl.startsWith('http://') || ipfsUrl.startsWith('https://')) {
    return ipfsUrl;
  }

  // Handle ipfs:// protocol
  if (ipfsUrl.startsWith('ipfs://')) {
    // Remove ipfs:// prefix
    let hash = ipfsUrl.replace('ipfs://', '');

    // Remove ipfs/ prefix if present
    if (hash.startsWith('ipfs/')) {
      hash = hash.replace('ipfs/', '');
    }

    // Use ipfs.io gateway (most reliable public gateway)
    return `https://ipfs.io/ipfs/${hash}`;
  }

  // If it doesn't match any pattern, return as-is
  return ipfsUrl;
}

/**
 * Ensure a URL is an absolute HTTP URL
 * Converts relative paths to absolute URLs using the current origin
 */
export function ensureAbsoluteUrl(url: string, baseUrl?: string): string {
  if (!url) {
    return '';
  }

  // Already absolute HTTP URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // IPFS URL - convert to HTTP
  if (url.startsWith('ipfs://')) {
    return ipfsToHttp(url);
  }

  // Relative URL - make it absolute
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}




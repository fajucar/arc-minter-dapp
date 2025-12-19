/**
 * Arc Collection Configuration
 * 
 * This file defines the collection of Arc NFTs that users can mint.
 * Each NFT has:
 * - id: Unique identifier
 * - name: Display name
 * - description: Description of the NFT
 * - image: Path to the image file in public/arc-nfts/
 * - tokenURI: URL to the metadata JSON (ERC-721 standard)
 * 
 * TODO: Replace the tokenURI placeholders with actual hosted metadata URLs
 * The metadata JSON should follow ERC-721 standard:
 * {
 *   "name": "Arc Genesis #1",
 *   "description": "Primeiro NFT oficial da coleção Arc na testnet.",
 *   "image": "https://YOUR-HOSTED-URL/arc-nfts/arc1.png"
 * }
 */

export type ArcNFTItem = {
  id: number;
  name: string;
  description: string;
  image: string;    // Path to image in public/arc-nfts/
  tokenURI: string; // URL to metadata JSON (ERC-721 standard)
};

// IMPORTANT:
// The tokenURI is stored onchain at mint time.
// Wallets (MetaMask, Rabby, etc.) will fetch metadata from that URL.
// Therefore tokenURI must be an ABSOLUTE URL (http/https) that will remain accessible.
//
// Using window.location + Vite BASE_URL keeps it correct for:
// - Local dev (http://localhost:3000)
// - GitHub Pages (https://<user>.github.io/<repo>/)
// - Production deployments
export const SITE_BASE_URL = (
  (import.meta.env.VITE_SITE_BASE_URL as string | undefined) ||
  (typeof window !== 'undefined' 
    ? `${window.location.origin}${import.meta.env.BASE_URL}`
    : 'http://localhost:3000')
).replace(/\/$/, '');

/**
 * Helper function to convert relative image paths to absolute HTTP URLs
 * This ensures MetaMask and other wallets can display NFT images correctly
 */
export function getAbsoluteImageUrl(imagePath: string): string {
  // If already absolute URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Convert relative path to absolute URL
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${SITE_BASE_URL}${path}`;
}

/**
 * Helper function to get metadata URL with absolute image URL
 * This ensures the metadata JSON has absolute URLs for images
 */
export async function getMetadataWithAbsoluteUrls(metadataUrl: string): Promise<any> {
  try {
    const response = await fetch(metadataUrl);
    const metadata = await response.json();
    
    // Convert relative image path to absolute URL
    if (metadata.image && !metadata.image.startsWith('http')) {
      metadata.image = getAbsoluteImageUrl(metadata.image);
    }
    
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
}

export const ARC_COLLECTION: ArcNFTItem[] = [
  {
    id: 1,
    name: "Arc Genesis #1",
    description: "Primeiro NFT oficial da coleção Arc na testnet. Representa o início da jornada na Arc Network.",
    image: "/arc-nfts/arc1.png",
    tokenURI: `${SITE_BASE_URL}/metadata/arc1.json`
  },
  {
    id: 2,
    name: "Arc Genesis #2",
    description: "Segundo NFT da coleção Arc. Simboliza o crescimento e expansão da rede.",
    image: "/arc-nfts/arc2.png",
    tokenURI: `${SITE_BASE_URL}/metadata/arc2.json`
  },
  {
    id: 3,
    name: "Arc Genesis #3",
    description: "Terceiro NFT da coleção Arc. Celebra a inovação e tecnologia da Arc Network.",
    image: "/arc-nfts/arc3.png",
    tokenURI: `${SITE_BASE_URL}/metadata/arc3.json`
  },
  {
    id: 4,
    name: "Arc Genesis #4",
    description: "Quarto NFT da coleção Arc. Representa a comunidade e colaboração na Arc Testnet.",
    image: "/arc-nfts/arc4.png",
    tokenURI: `${SITE_BASE_URL}/metadata/arc4.json`
  },
  {
    id: 5,
    name: "Arc Genesis #5",
    description: "Quinto e último NFT da coleção Arc Genesis. Marca o futuro promissor da Arc Network.",
    image: "/arc-nfts/arc5.png",
    tokenURI: `${SITE_BASE_URL}/metadata/arc5.json`
  }
];













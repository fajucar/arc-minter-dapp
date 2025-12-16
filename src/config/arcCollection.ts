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

export const ARC_COLLECTION: ArcNFTItem[] = [
  {
    id: 1,
    name: "Arc Genesis #1",
    description: "Primeiro NFT oficial da coleção Arc na testnet. Representa o início da jornada na Arc Network.",
    image: "/arc-nfts/arc1.png",
    tokenURI: "https://YOUR-HOSTED-URL/metadata/arc1.json" // TODO: Replace with actual hosted URL
  },
  {
    id: 2,
    name: "Arc Genesis #2",
    description: "Segundo NFT da coleção Arc. Simboliza o crescimento e expansão da rede.",
    image: "/arc-nfts/arc2.png",
    tokenURI: "https://YOUR-HOSTED-URL/metadata/arc2.json" // TODO: Replace with actual hosted URL
  },
  {
    id: 3,
    name: "Arc Genesis #3",
    description: "Terceiro NFT da coleção Arc. Celebra a inovação e tecnologia da Arc Network.",
    image: "/arc-nfts/arc3.png",
    tokenURI: "https://YOUR-HOSTED-URL/metadata/arc3.json" // TODO: Replace with actual hosted URL
  },
  {
    id: 4,
    name: "Arc Genesis #4",
    description: "Quarto NFT da coleção Arc. Representa a comunidade e colaboração na Arc Testnet.",
    image: "/arc-nfts/arc4.png",
    tokenURI: "https://YOUR-HOSTED-URL/metadata/arc4.json" // TODO: Replace with actual hosted URL
  },
  {
    id: 5,
    name: "Arc Genesis #5",
    description: "Quinto e último NFT da coleção Arc Genesis. Marca o futuro promissor da Arc Network.",
    image: "/arc-nfts/arc5.png",
    tokenURI: "https://YOUR-HOSTED-URL/metadata/arc5.json" // TODO: Replace with actual hosted URL
  }
];













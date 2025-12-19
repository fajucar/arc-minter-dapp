/**
 * Script to generate metadata JSON files with absolute image URLs
 * Run this after deployment to update metadata with production URLs
 * Usage: VITE_SITE_BASE_URL=https://your-domain.com node scripts/generate-metadata.js
 */

const fs = require('fs');
const path = require('path');

const baseUrl = process.env.VITE_SITE_BASE_URL || 'http://localhost:3000';
const metadataDir = path.join(__dirname, '..', 'public', 'metadata');

const metadataConfig = [
  {
    file: 'arc1.json',
    name: 'Arc Genesis #1',
    description: 'Arc Genesis collection on Arc Testnet. Minted via Arc Minter dApp.',
    image: `${baseUrl}/arc-nfts/arc1.png`,
    edition: '1/5',
  },
  {
    file: 'arc2.json',
    name: 'Arc Genesis #2',
    description: 'Arc Genesis collection on Arc Testnet. Minted via Arc Minter dApp.',
    image: `${baseUrl}/arc-nfts/arc2.png`,
    edition: '2/5',
  },
  {
    file: 'arc3.json',
    name: 'Arc Genesis #3',
    description: 'Arc Genesis collection on Arc Testnet. Minted via Arc Minter dApp.',
    image: `${baseUrl}/arc-nfts/arc3.png`,
    edition: '3/5',
  },
];

console.log(`Generating metadata files with base URL: ${baseUrl}\n`);

metadataConfig.forEach((config) => {
  const metadata = {
    name: config.name,
    description: config.description,
    image: config.image,
    external_url: baseUrl,
    attributes: [
      {
        trait_type: 'Collection',
        value: 'Arc Genesis',
      },
      {
        trait_type: 'Edition',
        value: config.edition,
      },
      {
        trait_type: 'Network',
        value: 'Arc Testnet',
      },
    ],
  };

  const filePath = path.join(metadataDir, config.file);
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2) + '\n', 'utf-8');
  console.log(`✅ Generated ${config.file}`);
  console.log(`   Image URL: ${config.image}`);
});

console.log('\n✨ Metadata files generated!');
console.log('\n⚠️  IMPORTANT:');
console.log('   - For production, set VITE_SITE_BASE_URL and run this script');
console.log('   - For local dev, metadata uses relative paths that resolve correctly');




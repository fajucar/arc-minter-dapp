/**
 * Script para atualizar metadados JSON com URLs públicas
 * Execute após configurar VITE_SITE_BASE_URL no .env
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Base URL do .env ou localhost como fallback
const BASE_URL = process.env.VITE_SITE_BASE_URL || 'http://localhost:3000';

const metadataDir = path.join(__dirname, '..', 'public', 'metadata');

// Mapear metadados para imagens
const metadataMap = [
  { metadata: 'arc1.json', image: 'arc1.png' },
  { metadata: 'arc2.json', image: 'arc2.png' },
  { metadata: 'arc3.json', image: 'arc3.png' },
  { metadata: 'arc4.json', image: 'arc4.png' },
  { metadata: 'arc5.json', image: 'arc5.png' },
];

console.log(`🔄 Atualizando metadados com base URL: ${BASE_URL}\n`);

if (BASE_URL.includes('localhost')) {
  console.warn('⚠️  AVISO: Você está usando localhost!');
  console.warn('   Isso NÃO funcionará na MetaMask.');
  console.warn('   Use uma URL pública (ngrok, Netlify, GitHub Pages, etc.)\n');
}

let updatedCount = 0;

metadataMap.forEach(({ metadata, image }) => {
  const metadataPath = path.join(metadataDir, metadata);
  
  if (!fs.existsSync(metadataPath)) {
    console.warn(`⚠️  Arquivo não encontrado: ${metadataPath}`);
    return;
  }

  try {
    const content = fs.readFileSync(metadataPath, 'utf-8');
    const data = JSON.parse(content);
    
    // Atualizar URL da imagem para URL HTTP completa
    const oldImage = data.image;
    data.image = `${BASE_URL}/arc-nfts/${image}`;
    
    // Atualizar external_url se existir
    if (data.external_url) {
      data.external_url = BASE_URL;
    }
    
    // Salvar de volta
    fs.writeFileSync(metadataPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    console.log(`✅ ${metadata}`);
    console.log(`   Image: ${oldImage} → ${data.image}`);
    updatedCount++;
  } catch (error) {
    console.error(`❌ Erro ao processar ${metadata}:`, error.message);
  }
});

console.log(`\n✨ ${updatedCount} metadados atualizados!`);

if (BASE_URL.includes('localhost')) {
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('   1. Configure uma URL pública (veja COMO-FAZER-NFT-APARECER.md)');
  console.log('   2. Adicione VITE_SITE_BASE_URL=https://sua-url.com no .env');
  console.log('   3. Execute este script novamente');
} else {
  console.log('\n✅ URLs públicas configuradas!');
  console.log('   Agora você pode fazer novos mints e as imagens aparecerão na MetaMask!');
}

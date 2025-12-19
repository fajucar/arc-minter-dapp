import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente explicitamente
  const env = loadEnv(mode, process.cwd(), '')
  
  // Verifica se o arquivo .env existe na raiz e lê diretamente para debug
  try {
    const envPath = resolve(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf-8')
    console.log('ENV SOURCE: root .env')
    console.log('🔍 [vite.config.ts] Arquivo .env encontrado na raiz e lido')
  } catch (e) {
    console.warn('⚠️  [vite.config.ts] Arquivo .env não encontrado na raiz ou não pôde ser lido')
    console.warn('   Esperado em:', resolve(process.cwd(), '.env'))
  }
  
  // Log para debug - sempre executa para verificar variáveis
  console.log('═══════════════════════════════════════════════════════')
  console.log('🔍 [vite.config.ts] VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE')
  console.log('═══════════════════════════════════════════════════════')
  console.log('VITE_GIFT_CARD_NFT_ADDRESS:', env.VITE_GIFT_CARD_NFT_ADDRESS || '❌ UNDEFINED')
  console.log('VITE_ARC_COLLECTION_ADDRESS:', env.VITE_ARC_COLLECTION_ADDRESS || '❌ UNDEFINED')
  console.log('VITE_GIFT_CARD_MINTER_ADDRESS:', env.VITE_GIFT_CARD_MINTER_ADDRESS || '❌ UNDEFINED (opcional)')
  console.log('VITE_MOCK_USDC_ADDRESS:', env.VITE_MOCK_USDC_ADDRESS || '❌ UNDEFINED (opcional)')
  console.log('═══════════════════════════════════════════════════════')
  
  // Check if at least one NFT address is configured
  const nftAddressResolved = env.VITE_GIFT_CARD_NFT_ADDRESS || env.VITE_ARC_COLLECTION_ADDRESS;
  if (nftAddressResolved) {
    console.log(`✅ NFT Address Resolved: ${nftAddressResolved}`);
    console.log(`   Primary (VITE_GIFT_CARD_NFT_ADDRESS): ${env.VITE_GIFT_CARD_NFT_ADDRESS || 'not set'}`);
    console.log(`   Fallback (VITE_ARC_COLLECTION_ADDRESS): ${env.VITE_ARC_COLLECTION_ADDRESS || 'not set'}`);
  } else {
    console.error('❌ ERRO: Nenhum endereço NFT configurado! Configure VITE_GIFT_CARD_NFT_ADDRESS ou VITE_ARC_COLLECTION_ADDRESS');
  }
  
  // Log para debug (apenas em desenvolvimento)
  if (mode === 'development') {
    console.log('🔍 [vite.config.ts] Variáveis de ambiente carregadas:')
    console.log('  VITE_MOCK_USDC_ADDRESS:', env.VITE_MOCK_USDC_ADDRESS || '❌ UNDEFINED (opcional)')
    console.log('  VITE_GIFT_CARD_NFT_ADDRESS:', env.VITE_GIFT_CARD_NFT_ADDRESS || '❌ UNDEFINED')
    console.log('  VITE_ARC_COLLECTION_ADDRESS:', env.VITE_ARC_COLLECTION_ADDRESS || '❌ UNDEFINED')
    console.log('  VITE_GIFT_CARD_MINTER_ADDRESS:', env.VITE_GIFT_CARD_MINTER_ADDRESS || '❌ UNDEFINED (opcional)')
    
    // Only NFT address is required - check if at least one is set
    const nftAddressSet = env.VITE_GIFT_CARD_NFT_ADDRESS || env.VITE_ARC_COLLECTION_ADDRESS;
    if (!nftAddressSet) {
      console.error('')
      console.error('❌ ERRO: Nenhum endereço NFT configurado!')
      console.error('   Certifique-se de que:')
      console.error('   1. O arquivo .env existe na raiz do projeto (mesmo nível de package.json)')
      console.error('   2. O servidor foi reiniciado após criar/modificar o .env')
      console.error('   3. O arquivo .env contém VITE_GIFT_CARD_NFT_ADDRESS ou VITE_ARC_COLLECTION_ADDRESS')
      console.error('')
    } else {
      console.log('✅ Endereço NFT configurado com sucesso!')
    }
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
  }
})

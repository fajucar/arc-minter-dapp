import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente explicitamente
  const env = loadEnv(mode, process.cwd(), '')
  
  // Verifica se o arquivo .env existe e lê diretamente para debug
  try {
    const envPath = resolve(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf-8')
    console.log('🔍 [vite.config.ts] Arquivo .env encontrado e lido')
  } catch (e) {
    console.warn('⚠️  [vite.config.ts] Arquivo .env não encontrado ou não pôde ser lido')
  }
  
  // Log para debug (apenas em desenvolvimento)
  if (mode === 'development') {
    console.log('🔍 [vite.config.ts] Variáveis de ambiente carregadas:')
    console.log('  VITE_MOCK_USDC_ADDRESS:', env.VITE_MOCK_USDC_ADDRESS || '❌ UNDEFINED')
    console.log('  VITE_GIFT_CARD_NFT_ADDRESS:', env.VITE_GIFT_CARD_NFT_ADDRESS || '❌ UNDEFINED')
    console.log('  VITE_GIFT_CARD_MINTER_ADDRESS:', env.VITE_GIFT_CARD_MINTER_ADDRESS || '❌ UNDEFINED')
    
    if (!env.VITE_MOCK_USDC_ADDRESS || !env.VITE_GIFT_CARD_NFT_ADDRESS || !env.VITE_GIFT_CARD_MINTER_ADDRESS) {
      console.error('')
      console.error('❌ ERRO: Variáveis de ambiente não foram carregadas!')
      console.error('   Certifique-se de que:')
      console.error('   1. O arquivo .env existe em frontend/.env')
      console.error('   2. O servidor foi reiniciado após criar/modificar o .env')
      console.error('   3. O arquivo .env contém as 3 variáveis necessárias')
      console.error('')
    } else {
      console.log('✅ Todas as variáveis foram carregadas com sucesso!')
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

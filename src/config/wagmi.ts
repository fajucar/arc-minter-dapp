import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { arcTestnet } from './chains'

// === Injected wallets (MetaMask, Rabby, Rainbow, Coinbase Extension, etc)
const injectedConnector = injected({
  shimDisconnect: true,
})

// === WalletConnect (somente se projectId existir)
const walletConnectConnector =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
    ? walletConnect({
        projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
        metadata: {
          name: 'Arc Network',
          description: 'Blockchain with deterministic finality',
          url: 'https://arc.network',
          icons: ['https://arc.network/logo.png'],
        },
        showQrModal: true,
      })
    : null

export const config = createConfig({
  chains: [arcTestnet, mainnet, sepolia],
  connectors: [
    injectedConnector,
    ...(walletConnectConnector ? [walletConnectConnector] : []),
  ],
  transports: {
    [arcTestnet.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false,
})

import { useMemo } from 'react'
import { useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

type InjectedProvider = {
  isMetaMask?: boolean
  isRabby?: boolean
  isCoinbaseWallet?: boolean
  isOkxWallet?: boolean
}

function getInjectedProviders(): InjectedProvider[] {
  const eth: any = (window as any).ethereum
  if (!eth) return []

  // Alguns navegadores expõem vários providers em ethereum.providers
  const providers: any[] = Array.isArray(eth.providers) ? eth.providers : [eth]
  return providers.filter(Boolean)
}

function isInstalled(check: (p: InjectedProvider) => boolean): boolean {
  const providers = getInjectedProviders()
  return providers.some((p) => {
    try {
      return check(p)
    } catch {
      return false
    }
  })
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, isPending } = useConnect()

  // Recalcula quando o modal abre (garante detecção atualizada)
  const wallets = useMemo(() => {
    const hasMetaMask = isInstalled((p) => Boolean(p?.isMetaMask))
    const hasRabby = isInstalled((p) => Boolean(p?.isRabby))
    const hasCoinbase = isInstalled((p) => Boolean(p?.isCoinbaseWallet))
    const hasOkx = isInstalled((p) => Boolean(p?.isOkxWallet))

    const list = [
      { id: 'metamask', name: 'MetaMask', recommended: true, installed: hasMetaMask },
      { id: 'rabby', name: 'Rabby Wallet', recommended: false, installed: hasRabby },
      { id: 'coinbase', name: 'Coinbase Wallet', recommended: false, installed: hasCoinbase },
      { id: 'okx', name: 'OKX Wallet', recommended: false, installed: hasOkx },
    ]

    // Fallback: se existir window.ethereum mas nenhuma flag foi detectada
    const hasAnyInjected = getInjectedProviders().length > 0
    const noneDetected = list.every((w) => !w.installed)

    if (hasAnyInjected && noneDetected) {
      list.push({
        id: 'injected',
        name: 'Injected Wallet (Browser)',
        recommended: false,
        installed: true,
      })
    }

    return list
  }, [isOpen])

  if (!isOpen) return null

  const handleConnect = async () => {
    try {
      await connect({ connector: injected({ shimDisconnect: true }) })
      onClose()
    } catch (err) {
      // se falhar, não fecha o modal (melhor UX)
      console.error('Wallet connect error:', err)
    }
  }

  return (
    // Overlay (clique fora fecha)
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Painel ancorado no topo-direita (ajuste top/right se precisar) */}
      <div
        className="absolute right-6 top-16 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-xl bg-slate-900 p-4 text-white shadow-xl border border-slate-700">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Connect Wallet</h2>
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-slate-300 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
            {wallets.map((w) => (
              <button
                key={w.id}
                onClick={handleConnect}
                disabled={isPending || !w.installed}
                className={[
                  'w-full rounded-lg border px-4 py-3 text-left transition',
                  w.installed
                    ? 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                    : 'cursor-not-allowed border-slate-800 bg-slate-950/40 opacity-70',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">{w.name}</span>
                    <span className="text-sm text-slate-400">
                      {w.recommended
                        ? 'Recommended'
                        : w.installed
                          ? 'Installed'
                          : 'Not installed'}
                    </span>
                  </div>

                  <span className="text-slate-400">↗</span>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full rounded-lg border border-slate-700 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

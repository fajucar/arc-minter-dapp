import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useReadContract } from 'wagmi'
import { Sparkles, Loader2, CheckCircle2, ExternalLink, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { arcTestnet } from '@/config/chains'
import { CONSTANTS } from '@/config/constants'
// import { CONTRACT_ADDRESSES } from '@/config/contracts' // Not used in this component
import { parseAbiItem, decodeEventLog } from 'viem'

// ABI do contrato ArcNFT com mint público
const ARC_NFT_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_type', type: 'uint8' }
    ],
    outputs: [
      { name: '', type: 'uint256' }
    ],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenId', type: 'uint256' }
    ],
    outputs: [
      { name: '', type: 'string' }
    ],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '', type: 'uint256' }
    ],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' }
    ],
    outputs: [
      { name: '', type: 'uint256' }
    ],
  },
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenId', type: 'uint256' }
    ],
    outputs: [
      { name: '', type: 'address' }
    ],
  },
] as const

// ERC-721 Transfer event ABI
const ERC721_TRANSFER_ABI = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)')

// NFT options - types 0, 1, 2
const NFT_OPTIONS = [
  {
    id: 1,
    name: 'Arc Explorer',
    description: 'A brave explorer discovering the Arc Network. The Explorer represents the pioneers who venture into the future of deterministic finality.',
    image: '/assets/nfts/arc_explorer.png',
    nftType: 0, // Type 0 = Explorer
  },
  {
    id: 2,
    name: 'Arc Builder',
    description: 'A builder creating the future on Arc Network. The Builder represents developers who build innovative dApps on Arc\'s stable infrastructure.',
    image: '/assets/nfts/arc_builder.png',
    nftType: 1, // Type 1 = Builder
  },
  {
    id: 3,
    name: 'Arc Guardian',
    description: 'A guardian protecting the Arc ecosystem. The Guardian represents the security and stability that Arc Network provides.',
    image: '/assets/nfts/arc_guardian.png',
    nftType: 2, // Type 2 = Guardian
  },
]

interface MintPageProps {
  contractAddress?: `0x${string}`
}

export function ArcNFTMintPage({ contractAddress }: MintPageProps) {
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const [mintingId, setMintingId] = useState<number | null>(null)
  const [mintedTokenIds, setMintedTokenIds] = useState<Record<number, string>>({})
  const [hasMinted, setHasMinted] = useState<Record<number, boolean>>({})
  const [mintErrors, setMintErrors] = useState<Record<number, string>>({})
  const [txTimeoutId, setTxTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const { writeContract, data: hash, error, isPending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError: receiptError, data: receipt } = useWaitForTransactionReceipt({ 
    hash: hash || undefined,
  })

  // Check user balance
  const { data: _balance } = useReadContract({
    address: contractAddress,
    abi: ARC_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!contractAddress && isConnected },
  })

  /**
   * Handle mint function - calls contract.mint(uint8 _type)
   * @param nftId The NFT card ID (1, 2, or 3)
   */
  const handleMint = async (nftId: number) => {
    try {
      // Reset previous transaction state
      reset()
      setMintErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[nftId]
        return newErrors
      })

      if (!isConnected) {
        toast.error('Please connect your wallet first')
        return
      }

      if (chain?.id !== arcTestnet.id) {
        toast.error('Please switch to Arc Testnet')
        try {
          switchChain({ chainId: arcTestnet.id })
        } catch (switchError) {
          console.error('Failed to switch chain:', switchError)
        }
        return
      }

      if (!address) {
        toast.error('Wallet address not found')
        return
      }

      if (!contractAddress) {
        toast.error('NFT contract address not configured')
        return
      }

      const nft = NFT_OPTIONS.find(n => n.id === nftId)
      if (!nft) {
        toast.error('NFT not found')
        return
      }

      // Check if already minted
      if (hasMinted[nft.nftType]) {
        toast.error('You have already minted this NFT type')
        return
      }

      // Set pending state
      setMintingId(nftId)
      const nftType = nft.nftType as 0 | 1 | 2

      console.log('🟢 MINT START:', {
        nftType,
        nftName: nft.name,
        contractAddress,
        userAddress: address,
      })

      // Clear any existing timeout
      if (txTimeoutId) {
        clearTimeout(txTimeoutId)
      }

      // Set timeout to detect stalled transactions
      const timeoutId = setTimeout(() => {
        console.error('TX TIMEOUT: Transaction taking longer than 45s')
        toast.error('Network slow—check wallet activity')
      }, 45000)
      setTxTimeoutId(timeoutId)

      // Call contract.mint(uint8 _type)
      writeContract({
        address: contractAddress,
        abi: ARC_NFT_ABI,
        functionName: 'mint',
        args: [nftType],
      })

      console.log('⏳ MINT PENDING: Waiting for user confirmation in wallet...')
    } catch (err: any) {
      console.error('❌ MINT ERROR:', err)
      toast.error(err.message || 'Failed to mint NFT')
      setMintingId(null)
      if (txTimeoutId) {
        clearTimeout(txTimeoutId)
        setTxTimeoutId(null)
      }
    }
  }

  // Handle transaction success - extract tokenId from Transfer event
  useEffect(() => {
    if (isSuccess && hash && receipt && mintingId && contractAddress && address) {
      // Clear timeout
      if (txTimeoutId) {
        clearTimeout(txTimeoutId)
        setTxTimeoutId(null)
      }

      console.log('✅ MINT TX CONFIRMED:', receipt.transactionHash)
      console.log('📋 Receipt logs:', receipt.logs)

      const nft = NFT_OPTIONS.find(n => n.id === mintingId)
      if (!nft) {
        setMintingId(null)
        return
      }

      let tokenId: string | null = null
      const userAddressLower = address.toLowerCase()

      // Parse logs to find Transfer event
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: [ERC721_TRANSFER_ABI],
            data: log.data,
            topics: log.topics,
          })

          if (decoded.eventName === 'Transfer') {
            const { from, to, tokenId: id } = decoded.args as { 
              from: `0x${string}`; 
              to: `0x${string}`; 
              tokenId: bigint 
            }

            // Check if Transfer is to the user (from address(0) means mint)
            if (to.toLowerCase() === userAddressLower && from === '0x0000000000000000000000000000000000000000') {
              tokenId = id.toString()
              console.log('✅ TOKEN ID FOUND:', tokenId)
              break
            }
          }
        } catch (decodeError) {
          // Not a Transfer event, continue
          continue
        }
      }

      if (tokenId) {
        // Store token ID
        setMintedTokenIds(prev => ({ ...prev, [mintingId]: tokenId! }))
        setHasMinted(prev => ({ ...prev, [nft.nftType]: true }))
        
        toast.success(`${nft.name} minted successfully! Token ID: ${tokenId} 🎉`)
        console.log('✅ MINT SUCCESS - Token ID:', tokenId)
      } else {
        console.error('❌ Token ID not found in Transfer event')
        const errorMsg = 'Mint succeeded but tokenId not found in transaction logs'
        setMintErrors(prev => ({ ...prev, [mintingId]: errorMsg }))
        toast.error('Mint succeeded but tokenId not found. Check explorer.')
      }

      setMintingId(null)
    }
  }, [isSuccess, hash, receipt, mintingId, contractAddress, address, txTimeoutId])

  // Handle transaction errors
  useEffect(() => {
    if (error || receiptError) {
      if (txTimeoutId) {
        clearTimeout(txTimeoutId)
        setTxTimeoutId(null)
      }
      const err = error || receiptError
      if (err && typeof err === 'object' && 'message' in err) {
        const errorMessage = String(err.message || '')
        if (!errorMessage.includes('User rejected') && !errorMessage.includes('denied')) {
          console.error('❌ TX ERROR:', err)
          if (mintingId) {
            setMintErrors(prev => ({ ...prev, [mintingId]: errorMessage }))
          }
        }
      }
      setMintingId(null)
    }
  }, [error, receiptError, mintingId, txTimeoutId])

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <Sparkles className="h-16 w-16 mx-auto text-cyan-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-slate-400">Connect your wallet to start minting NFTs</p>
      </div>
    )
  }

  if (chain?.id !== arcTestnet.id) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Wrong Network</h2>
        <p className="text-slate-400 mb-6">Please switch to Arc Testnet to mint NFTs</p>
        <button
          onClick={() => switchChain({ chainId: arcTestnet.id })}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all"
        >
          Switch to Arc Testnet
        </button>
      </div>
    )
  }

  if (!contractAddress) {
    return (
      <div className="text-center py-20 px-4">
        <AlertTriangle className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-white">Contract Not Configured</h2>
        <p className="text-slate-300 mb-6">
          ArcNFT contract address is not set. Please configure VITE_ARC_NFT_CONTRACT_ADDRESS in your .env file.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Mint Your <span className="text-cyan-400">Arc NFTs</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Each wallet can mint one of each type. Choose from 3 unique Arc Network NFTs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {NFT_OPTIONS.map((nft) => {
          const isMinting = mintingId === nft.id
          const isProcessing = isMinting && (isPending || isConfirming)
          const tokenId = mintedTokenIds[nft.id]
          const mintError = mintErrors[nft.id]
          const alreadyMinted = hasMinted[nft.nftType] || !!tokenId

          return (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: nft.id * 0.1 }}
              className="rounded-2xl border border-cyan-500/25 bg-slate-900/50 backdrop-blur-xl overflow-hidden hover:border-cyan-500/50 transition-all"
            >
              {/* NFT Image */}
              <div className="relative aspect-square bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/400x400/06b6d4/ffffff?text=${encodeURIComponent(nft.name)}`
                  }}
                />
                {alreadyMinted && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-500 rounded-full p-2">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* NFT Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{nft.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{nft.description}</p>

                {/* Mint Button */}
                <button
                  onClick={() => handleMint(nft.id)}
                  disabled={isProcessing || alreadyMinted}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{isPending ? 'Confirm in wallet...' : 'Minting...'}</span>
                    </>
                  ) : alreadyMinted ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Minted ✔</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Mint NFT</span>
                    </>
                  )}
                </button>

                {/* Token ID Display */}
                {tokenId && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-slate-400 text-center">
                      Token ID: <span className="font-mono text-cyan-400">{tokenId}</span>
                    </p>
                    
                    {/* View on Explorer */}
                    <a
                      href={`${CONSTANTS.LINKS.explorer}/token/${contractAddress}?a=${tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      View on Explorer <ExternalLink className="inline h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}

                {/* Mint Error */}
                {mintError && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/25 rounded text-xs text-red-400">
                    <p className="font-semibold mb-1">⚠️ Mint Issue:</p>
                    <p className="text-red-300">{mintError}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}


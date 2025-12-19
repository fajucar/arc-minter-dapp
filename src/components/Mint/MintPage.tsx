import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useReadContract, usePublicClient } from 'wagmi'
import { Sparkles, Loader2, CheckCircle2, ExternalLink, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { arcTestnet } from '@/config/chains'
import { CONSTANTS } from '@/config/constants'
import { CONTRACT_ADDRESSES } from '@/config/contracts'
import { getTokenURI } from '@/utils/metadata'
import { parseAbiItem, decodeEventLog } from 'viem'
import { MintPageErrorBoundary } from './ErrorBoundary'

// ABI do contrato GiftCardMinter (que chama o NFT contract)
const GIFT_CARD_MINTER_ABI = [
  {
    name: 'mintImageNFT',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenURI', type: 'string' }
    ],
    outputs: [
      { name: '', type: 'uint256' }
    ],
  },
  // Event emitted by minter contract
  {
    name: 'ImageNFTRequested',
    type: 'event',
    inputs: [
      { name: 'minter', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'tokenURI', type: 'string' },
    ],
  },
] as const

// ABI do contrato ERC-721 (GiftCardNFT) - apenas para leitura
const ERC721_NFT_ABI = [
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
  {
    name: 'minterContract',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '', type: 'address' }
    ],
  },
] as const


// ERC-721 Transfer event ABI for parsing logs
const ERC721_TRANSFER_ABI = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)')

// ImageNFTRequested event ABI for parsing logs from minter contract
const IMAGE_NFT_REQUESTED_ABI = parseAbiItem('event ImageNFTRequested(address indexed minter, uint256 indexed tokenId, string tokenURI)')

// Helper to get NFT options with dynamic tokenURI - with error handling
function getNFTOptions() {
  try {
    return [
      {
        id: 1,
        name: 'Arc Explorer',
        description: 'A brave explorer discovering the Arc Network. The Explorer represents the pioneers who venture into the future of deterministic finality.',
        image: '/assets/nfts/arc_explorer.png',
        nftType: 1, // 1 = Explorer
        tokenURI: getTokenURI('arc1.json') || '/metadata/arc1.json', // Absolute URL for metadata JSON with fallback
      },
      {
        id: 2,
        name: 'Arc Builder',
        description: 'A builder creating the future on Arc Network. The Builder represents developers who build innovative dApps on Arc\'s stable infrastructure.',
        image: '/assets/nfts/arc_builder.png',
        nftType: 2, // 2 = Builder
        tokenURI: getTokenURI('arc2.json') || '/metadata/arc2.json', // Absolute URL for metadata JSON with fallback
      },
      {
        id: 3,
        name: 'Arc Guardian',
        description: 'A guardian protecting the Arc ecosystem. The Guardian represents the security and stability that Arc Network provides.',
        image: '/assets/nfts/arc_guardian.png',
        nftType: 3, // 3 = Guardian
        tokenURI: getTokenURI('arc3.json') || '/metadata/arc3.json', // Absolute URL for metadata JSON with fallback
      },
    ];
  } catch (error) {
    console.error('Error generating NFT options:', error)
    // Return safe fallback options
    return [
      {
        id: 1,
        name: 'Arc Explorer',
        description: 'A brave explorer discovering the Arc Network.',
        image: '/assets/nfts/arc_explorer.png',
        nftType: 1,
        tokenURI: '/metadata/arc1.json',
      },
      {
        id: 2,
        name: 'Arc Builder',
        description: 'A builder creating the future on Arc Network.',
        image: '/assets/nfts/arc_builder.png',
        nftType: 2,
        tokenURI: '/metadata/arc2.json',
      },
      {
        id: 3,
        name: 'Arc Guardian',
        description: 'A guardian protecting the Arc ecosystem.',
        image: '/assets/nfts/arc_guardian.png',
        nftType: 3,
        tokenURI: '/metadata/arc3.json',
      },
    ];
  }
}

interface MintPageProps {
  contractAddress?: `0x${string}`
}

export function MintPage({ contractAddress }: MintPageProps) {
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const publicClient = usePublicClient()
  const [mintingId, setMintingId] = useState<number | null>(null)
  const [mintedTokens, setMintedTokens] = useState<Record<number, string>>({})
  const [mintedTokenIds, setMintedTokenIds] = useState<Record<number, string>>({})
  const [hasMinted, setHasMinted] = useState<Record<number, boolean>>({})
  const [mintErrors, setMintErrors] = useState<Record<number, string>>({})
  const [txTimeoutId, setTxTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [mintEnabled, setMintEnabled] = useState<boolean>(true) // Assume enabled until we check
  const [minterContractAddress, setMinterContractAddress] = useState<string | null>(null)
  
  // Get NFT options with dynamic tokenURI (recalculated on each render to ensure fresh URLs)
  const NFT_OPTIONS = getNFTOptions()
  
  // Check if minter contract is configured and verify contract supports minting via minter
  useEffect(() => {
    // Safe guard: don't check if required dependencies are missing
    if (!contractAddress || !publicClient || !isConnected) {
      // If contract address is missing, disable minting
      if (!contractAddress) {
        setMintEnabled(false)
        setMinterContractAddress(null)
      }
      // If not connected, keep current state (don't change)
      return
    }
    
    // Safe guard: check if CONTRACT_ADDRESSES exists
    if (!CONTRACT_ADDRESSES) {
      console.error('CONTRACT_ADDRESSES is undefined')
      setMintEnabled(false)
      setMinterContractAddress(null)
      return
    }
    
    // Check if minter contract address is configured
    const configuredMinter = CONTRACT_ADDRESSES.GIFT_CARD_MINTER
    if (!configuredMinter || configuredMinter === '') {
      console.log('ERC721 MINT FUNCTION FOUND: NONE (minter not configured)')
      console.log('NFT MINT MODE: DISABLED - Mint Coming Soon')
      setMintEnabled(false)
      setMinterContractAddress(null)
      return
    }
    
    // Read minterContract from ERC-721 contract to verify it's set correctly
    // Wrap in try-catch for safety
    try {
      publicClient.readContract({
        address: contractAddress,
        abi: ERC721_NFT_ABI,
        functionName: 'minterContract',
      }).then((minterFromContract) => {
        try {
          const minterFromContractLower = String(minterFromContract || '').toLowerCase()
          const configuredMinterLower = String(configuredMinter || '').toLowerCase()
          
          console.log('ERC721 minterContract from chain:', minterFromContract)
          console.log('Configured minter address:', configuredMinter)
          
          // Enable minting if minter is configured, even if on-chain check fails
          // This allows minting to work even if the verification has issues
          if (minterFromContractLower === '0x0000000000000000000000000000000000000000' || minterFromContractLower === '') {
            console.warn('ERC721 minterContract not set on-chain, but minter is configured in .env')
            console.log('NFT MINT MODE: ENABLED (using configured minter, on-chain check incomplete)')
            setMintEnabled(true)
            setMinterContractAddress(configuredMinter)
          } else if (minterFromContractLower === configuredMinterLower) {
            console.log('ERC721 MINT FUNCTION FOUND: mintImageNFT (via minter contract)')
            console.log('NFT MINT MODE: ENABLED')
            setMintEnabled(true)
            setMinterContractAddress(configuredMinter)
          } else {
            console.warn('Minter contract mismatch:', {
              onChain: minterFromContractLower,
              configured: configuredMinterLower
            })
            // Still enable if minter is configured, but log warning
            console.log('ERC721 MINT FUNCTION FOUND: mintImageNFT (via minter contract - address mismatch)')
            console.log('NFT MINT MODE: ENABLED (with warning)')
            setMintEnabled(true)
            setMinterContractAddress(configuredMinter)
          }
        } catch (error) {
          console.error('Error processing minter contract verification:', error)
          // Enable anyway if minter is configured
          console.log('NFT MINT MODE: ENABLED (error in verification, but minter configured)')
          setMintEnabled(true)
          setMinterContractAddress(configuredMinter)
        }
      }).catch((error) => {
        console.error('Failed to read minterContract from ERC-721:', error)
        // If we can't read, but minter is configured, enable anyway
        console.log('NFT MINT MODE: ENABLED (verification failed, but minter configured in .env)')
        setMintEnabled(true)
        setMinterContractAddress(configuredMinter)
      })
    } catch (error) {
      console.error('Error setting up minter contract check:', error)
      // Enable anyway if minter is configured
      if (configuredMinter && configuredMinter !== '') {
        console.log('NFT MINT MODE: ENABLED (error in setup, but minter configured)')
        setMintEnabled(true)
        setMinterContractAddress(configuredMinter)
      } else {
        setMintEnabled(false)
        setMinterContractAddress(null)
      }
    }
  }, [contractAddress, publicClient, isConnected])

  const { writeContract, data: hash, error, isPending, reset, status: writeStatus } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError: receiptError, data: receipt, status: receiptStatus } = useWaitForTransactionReceipt({ 
    hash: hash || undefined,
  })
  
  // Debug: Log write contract status
  useEffect(() => {
    console.log('WRITE CONTRACT STATUS:', writeStatus, 'hash:', hash, 'isPending:', isPending, 'error:', error)
  }, [writeStatus, hash, isPending, error])
  
  // Debug: Log receipt status
  useEffect(() => {
    if (hash) {
      console.log('RECEIPT STATUS:', receiptStatus, 'isConfirming:', isConfirming, 'isSuccess:', isSuccess, 'receiptError:', receiptError, 'receipt:', !!receipt)
    }
  }, [hash, receiptStatus, isConfirming, isSuccess, receiptError, receipt])

  // Verificar se já mintou cada NFT checando o balance
  // Como não temos hasMintedType, vamos verificar se o usuário tem tokens
  const { data: balance } = useReadContract({
    address: contractAddress,
    abi: ERC721_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!contractAddress && isConnected },
  })

  // Por enquanto, vamos assumir que se o usuário tem balance > 0, já mintou
  // Isso é uma simplificação - em produção você pode querer verificar tokens específicos
  useEffect(() => {
    if (balance !== undefined && Number(balance) > 0) {
      // Se tem tokens, marca como mintado (simplificação)
      setHasMinted({ 1: true, 2: true, 3: true })
    }
  }, [balance])

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
        } catch (err) {
          console.error('Failed to switch chain:', err)
        }
        return
      }

      // Verificar se o contrato NFT está configurado
      if (!contractAddress) {
        toast.error('NFT contract address not configured')
        return
      }

      const nft = NFT_OPTIONS.find(n => n.id === nftId)
      if (!nft) return

      // Verificar se já mintou
      if (hasMinted[nft.nftType]) {
        toast.error('You have already minted this NFT')
        return
      }

      // Verificar se o endereço do usuário está disponível
      if (!address) {
        toast.error('Wallet address not found')
        return
      }

      // Check if minting is enabled
      if (!mintEnabled) {
        toast('Mint is coming soon', {
          icon: '🚀',
          duration: 3000,
        })
        return
      }

      // Safe guard: check if CONTRACT_ADDRESSES exists
      if (!CONTRACT_ADDRESSES) {
        console.error('CONTRACT_ADDRESSES is undefined')
        toast.error('Configuration error. Please refresh the page.')
        return
      }

      // Verificar se o minter contract está configurado (necessário porque o NFT contract tem onlyMinterContract)
      const configuredMinter = CONTRACT_ADDRESSES?.GIFT_CARD_MINTER || '';
      const minterAddress = minterContractAddress || configuredMinter;
      if (!minterAddress || minterAddress.length !== 42 || !minterAddress.startsWith('0x')) {
        toast('Mint is coming soon', {
          icon: '🚀',
          duration: 3000,
        })
        console.error('❌ Minter contract required. The NFT contract only allows minting through the minter contract.')
        return
      }

      // Set pending state
      setMintingId(nftId)
      const tokenURI = nft.tokenURI;
      const minterAddressTyped = minterAddress as `0x${string}`;
      
      console.log('MINT MODE: CONTRACT_MINT')
      console.log('MINT TX START: mintImageNFT')
      console.log('MINT TX START: Minter Contract:', minterAddressTyped)
      console.log('MINT TX START: NFT Contract:', contractAddress)
      console.log('MINT TX START: Method:', 'mintImageNFT(string)')
      console.log('MINT TX START: NFT:', nft.name)
      console.log('MINT TX START: TokenURI:', tokenURI)
      console.log('MINT TX START: Args:', [tokenURI])
      
      // Verificar se o tokenURI é válido
      if (!tokenURI || tokenURI.trim() === '') {
        console.error('TokenURI is empty or invalid:', tokenURI)
        toast.error('Invalid token URI')
        setMintingId(null)
        return
      }
      
      // Verificar se o endereço do contrato minter é válido (já validado acima, mas double-check)
      if (!minterAddressTyped || minterAddressTyped.length !== 42 || !minterAddressTyped.startsWith('0x')) {
        console.error('Invalid minter contract address format:', minterAddressTyped)
        toast.error('Invalid minter contract address')
        setMintingId(null)
        return
      }
      
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
      
      // Chamar GiftCardMinter.mintImageNFT(string tokenURI) - que internamente chama o NFT contract
      writeContract({
        address: minterAddressTyped,
        abi: GIFT_CARD_MINTER_ABI,
        functionName: 'mintImageNFT',
        args: [tokenURI],
      })
      
      console.log('MINT TX PENDING: Waiting for user confirmation in wallet...')
    } catch (err: any) {
      console.error('❌ Mint error:', err)
      console.error('Error stack:', err.stack)
      toast.error(err.message || 'Failed to mint NFT')
      setMintingId(null)
      setMintErrors(prev => ({ ...prev, [nftId]: err.message || 'Failed to mint NFT' }))
    }
  }

  // Log transaction hash when available and monitor state
  useEffect(() => {
    if (hash) {
      console.log('MINT TX HASH:', hash)
      console.log('MINT TX STATE: isPending=', isPending, 'isConfirming=', isConfirming, 'isSuccess=', isSuccess, 'receipt=', !!receipt)
    }
  }, [hash, isPending, isConfirming, isSuccess, receipt])

  // Handle transaction errors
  useEffect(() => {
    if (error || receiptError) {
      // Clear timeout on error
      if (txTimeoutId) {
        clearTimeout(txTimeoutId)
        setTxTimeoutId(null)
      }
      
      const err = error || receiptError
      if (err && typeof err === 'object' && 'message' in err) {
        const errorMessage = String(err.message || '')
        if (!errorMessage.includes('User rejected') && !errorMessage.includes('denied')) {
          console.error('TX ERROR:', err)
          console.error('Error details:', {
            message: errorMessage,
            ...(err && typeof err === 'object' && 'cause' in err ? { cause: err.cause } : {}),
            ...(err && typeof err === 'object' && 'name' in err ? { name: err.name } : {}),
          })
        }
      }
      setMintingId(null)
    }
  }, [error, receiptError, txTimeoutId])

  // Quando a transação for confirmada - extrair tokenId dos logs
  useEffect(() => {
    if (isSuccess && hash && receipt && mintingId && contractAddress && address) {
      // Clear timeout on success
      if (txTimeoutId) {
        clearTimeout(txTimeoutId)
        setTxTimeoutId(null)
      }
      
      const nft = NFT_OPTIONS.find(n => n.id === mintingId)
      if (!nft) {
        setMintingId(null)
        return
      }

      console.log('MINT TX CONFIRMED:', receipt.transactionHash)
      console.log('✅ Transaction confirmed!')
      console.log('📋 Transaction hash:', hash)
      console.log('📋 Receipt to (tx target):', receipt.to)
      console.log('🎨 NFT:', nft.name)
      console.log('🔗 View on explorer:', `${CONSTANTS.LINKS.explorer}/tx/${hash}`)
      console.log('📋 Total logs:', receipt.logs.length)

      // Parse Transfer events from logs
      // The Transfer event is emitted by the NFT contract, not the minter contract
      let tokenId: string | null = null
      let transferFound = false

      // Normalize addresses for comparison
      const nftContractLower = contractAddress.toLowerCase()
      const userAddressLower = address.toLowerCase()

      console.log('🔍 Parsing transaction logs for Transfer event...')
      console.log('📋 Looking for Transfer from NFT contract:', contractAddress)
      
      // Log all log addresses and topics for debugging
      console.log('📋 All log addresses:', receipt.logs.map((log, idx) => ({
        index: idx,
        address: log.address.toLowerCase(),
        addressChecksum: log.address,
        topics: log.topics.length,
        firstTopic: log.topics[0],
        dataLength: log.data.length,
      })))
      
      // First, try to find ImageNFTRequested event from minter contract as fallback
      const minterAddress = CONTRACT_ADDRESSES.GIFT_CARD_MINTER
      const minterLower = minterAddress?.toLowerCase() || ''
      let imageNFTEventTokenId: string | null = null
      
      // Parse logs to find Transfer event
      // IMPORTANT: Check ALL logs because the minter contract calls the NFT contract
      // The Transfer event is emitted by the NFT contract
      for (const log of receipt.logs) {
        const logAddressLower = log.address.toLowerCase()
        
        // Try to decode ImageNFTRequested event from minter contract
        if (logAddressLower === minterLower && log.topics.length >= 3) {
          try {
            const decoded = decodeEventLog({
              abi: [IMAGE_NFT_REQUESTED_ABI],
              data: log.data,
              topics: log.topics,
            })
            
            if (decoded.eventName === 'ImageNFTRequested') {
              const { tokenId } = decoded.args as { minter: `0x${string}`; tokenId: bigint; tokenURI: string }
              imageNFTEventTokenId = tokenId.toString()
              console.log('✅ ImageNFTRequested event found from minter:', {
                minter: decoded.args.minter,
                tokenId: imageNFTEventTokenId,
                tokenURI: decoded.args.tokenURI,
              })
            }
          } catch (e) {
            // Try manual decoding as fallback
            try {
              // ImageNFTRequested(minter, tokenId, tokenURI)
              // topics[0] = event signature
              // topics[1] = minter (indexed)
              // topics[2] = tokenId (indexed)
              if (log.topics[2]) {
                const decodedTokenId = BigInt(log.topics[2])
                imageNFTEventTokenId = decodedTokenId.toString()
                console.log('✅ ImageNFTRequested event found (manual decode):', {
                  tokenId: imageNFTEventTokenId,
                })
              }
            } catch (manualError) {
              // Not the event we're looking for, continue
              console.log('⚠️ Failed to decode ImageNFTRequested:', e, manualError)
            }
          }
        }
        
        // Try to decode as Transfer event
        try {
          const decoded = decodeEventLog({
            abi: [ERC721_TRANSFER_ABI],
            data: log.data,
            topics: log.topics,
          })

          if (decoded.eventName === 'Transfer') {
            transferFound = true
            const { from, to, tokenId: id } = decoded.args as { from: `0x${string}`; to: `0x${string}`; tokenId: bigint }
            
            console.log('📋 Transfer event found:', { 
              from, 
              to, 
              tokenId: id.toString(),
              contract: logAddressLower,
              contractChecksum: log.address,
              isFromNFTContract: logAddressLower === nftContractLower,
              isToUser: to.toLowerCase() === userAddressLower
            })
            
            // Check if this Transfer is from the NFT contract AND to the user
            // from should be address(0) for mint operations
            if (logAddressLower === nftContractLower && to.toLowerCase() === userAddressLower) {
              tokenId = id.toString()
              console.log('✅ MINTED TOKEN ID (from Transfer event):', tokenId)
              break
            }
          }
        } catch (decodeError) {
          // Not a Transfer event, continue to next log
          continue
        }
      }

      // Use ImageNFTRequested event as primary source (more reliable from minter contract)
      // Transfer event as secondary confirmation
      if (imageNFTEventTokenId) {
        tokenId = imageNFTEventTokenId
        console.log('✅ Using tokenId from ImageNFTRequested event:', tokenId)
      }

      // If we found a Transfer event from NFT contract, validate it matches
      if (transferFound && tokenId) {
        console.log('✅ Transfer event also found, validating consistency')
      } else if (transferFound && !tokenId) {
        console.warn('⚠️ Transfer event found but not from NFT contract or not to user address')
        console.warn('⚠️ This might indicate the Transfer event came from a different contract')
      }

      // Check if we have a tokenId (either from ImageNFTRequested or Transfer)
      if (!tokenId) {
        console.error('❌ No tokenId found in any event')
        console.error('📋 All log addresses:', receipt.logs.map(log => log.address.toLowerCase()))
        console.error('📋 Expected NFT contract:', nftContractLower)
        console.error('📋 Expected Minter contract:', minterLower)
        console.error('📋 Receipt transaction hash:', receipt.transactionHash)
        console.error('📋 Receipt to address:', receipt.to)
        
        const errorMsg = `No tokenId found in transaction events. The mint may have failed. Check the transaction on explorer.`
        console.error('❌ ERC-721 MINT FAILED:', errorMsg)
        setMintErrors(prev => ({ ...prev, [mintingId]: errorMsg }))
        toast.error('Mint transaction completed but no tokenId found. Check console for details.')
        setMintingId(null)
        return
      }

      // Store tokenId
      setMintedTokenIds(prev => ({ ...prev, [mintingId]: tokenId! }))
      setMintedTokens(prev => ({ ...prev, [mintingId]: hash }))

      // Log success and store tokenId
      console.log('✅ ERC-721 MINT SUCCESS')
      console.log('MINT TOKEN ID:', tokenId)

      // Verify ownership by calling ownerOf
      if (publicClient && contractAddress) {
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: ERC721_NFT_ABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        }).then((owner) => {
          const ownerLower = owner.toLowerCase()
          if (ownerLower === userAddressLower) {
            console.log('✅ Ownership verified! Owner:', owner)
            setHasMinted(prev => ({ ...prev, [nft.nftType]: true }))
            toast.success(`${nft.name} minted successfully! Token ID: ${tokenId} 🎉`)
          } else {
            const errorMsg = `Mint succeeded but ownership verification failed. Expected: ${address}, Got: ${owner}`
            console.error('❌', errorMsg)
            setMintErrors(prev => ({ ...prev, [mintingId]: errorMsg }))
            toast.error('Mint succeeded but ownership verification failed.')
          }
        }).catch((verifyError) => {
          const errorMsg = `Mint succeeded but ownership verification failed: ${verifyError.message}`
          console.error('❌', errorMsg)
          setMintErrors(prev => ({ ...prev, [mintingId]: errorMsg }))
          toast.error('Mint succeeded but ownership verification failed.')
        })
      } else {
        // If we can't verify, still mark as minted but warn
        console.warn('⚠️ Cannot verify ownership: publicClient or contractAddress missing')
        setHasMinted(prev => ({ ...prev, [nft.nftType]: true }))
        toast.success(`${nft.name} minted successfully! Token ID: ${tokenId} 🎉`)
      }

      setMintingId(null)
    }
  }, [isSuccess, hash, receipt, mintingId, contractAddress, address, publicClient, NFT_OPTIONS, txTimeoutId])

  // Log quando a transação está pendente
  useEffect(() => {
    if (isPending && mintingId) {
      console.log('⏳ Transaction pending... Waiting for confirmation')
    }
  }, [isPending, mintingId])

  // Log quando está confirmando
  useEffect(() => {
    if (isConfirming && hash) {
      console.log('⏳ Transaction confirming... Hash:', hash)
    }
  }, [isConfirming, hash])

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

  // Verificar se o NFT contract está configurado (minter é opcional)
  if (!contractAddress) {
    return (
      <div className="text-center py-20 px-4">
        <AlertTriangle className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-white">Contract Not Configured</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-slate-300 mb-6">
            NFT contract address is not set. Please configure VITE_GIFT_CARD_NFT_ADDRESS or VITE_ARC_COLLECTION_ADDRESS in your .env file.
          </p>
          
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 text-left">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">📋 Configuration:</h3>
            <p className="text-slate-300 text-sm mb-4">
              Add to your <code className="bg-slate-950 px-2 py-1 rounded">.env</code> file in the project root:
            </p>
            <code className="block p-2 bg-slate-950 rounded border border-slate-800 text-cyan-400 font-mono text-xs">
              VITE_GIFT_CARD_NFT_ADDRESS=0x... (your NFT contract address)
            </code>
            <p className="text-slate-300 text-sm mt-4">
              Then restart the dev server.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Render NFT cards even when minting is disabled - just disable the buttons
  const shouldShowComingSoon = !mintEnabled

  return (
    <MintPageErrorBoundary>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Mint Your <span className="text-cyan-400">Arc NFTs</span>
          </h1>
          {shouldShowComingSoon && (
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-cyan-500/25 rounded-xl">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <p className="text-slate-300 text-sm">
                  Mint Coming Soon — Stay tuned!
                </p>
              </div>
            </div>
          )}
          {!shouldShowComingSoon && (
            <p className="text-slate-400 max-w-2xl mx-auto">
              Each wallet can mint maximum 1 NFT per type. Choose from 3 unique Arc Network NFTs.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {NFT_OPTIONS.map((nft) => {
          const isMinting = mintingId === nft.id
          const isProcessing = isMinting && (isPending || isConfirming)
          const txHash = mintedTokens[nft.id]
          const tokenId = mintedTokenIds[nft.id]
          const mintError = mintErrors[nft.id]
          const alreadyMinted = hasMinted[nft.nftType] || !!txHash

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
                    // Fallback para placeholder se imagem não existir
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
                  onClick={() => {
                    if (!mintEnabled) {
                      toast('Mint is coming soon', {
                        icon: '🚀',
                        duration: 3000,
                      })
                      return
                    }
                    handleMint(nft.id)
                  }}
                  disabled={isProcessing || alreadyMinted || !mintEnabled}
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

                {/* Debug: Metadata URL link */}
                {nft.tokenURI && (
                  <a
                    href={nft.tokenURI}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                    title="Open metadata JSON in new tab"
                  >
                    <span>View metadata</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {/* Mint Error */}
                {mintError && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/25 rounded text-xs text-red-400">
                    <p className="font-semibold mb-1">⚠️ Mint Issue:</p>
                    <p className="text-red-300">{mintError}</p>
                  </div>
                )}

                {/* Token ID Display */}
                {tokenId && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-slate-400 text-center">
                      Minted Token ID: <span className="font-mono text-cyan-400">{tokenId}</span>
                    </p>
                    
                    {/* Import to MetaMask Helper */}
                    {contractAddress && (
                      <button
                        onClick={() => {
                          const importData = `Import NFT → Contract: ${contractAddress} | TokenID: ${tokenId}`
                          navigator.clipboard.writeText(importData).then(() => {
                            toast.success('Copied! Use this to import NFT in MetaMask.')
                          }).catch(() => {
                            toast.error('Failed to copy. Contract: ' + contractAddress + ', TokenID: ' + tokenId)
                          })
                        }}
                        className="w-full px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded border border-cyan-500/25 transition-colors"
                      >
                        📋 Copy Import Info
                      </button>
                    )}
                    {contractAddress && (
                      <p className="text-xs text-slate-500 text-center mt-1">
                        Import NFT → Contract: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)} | TokenID: {tokenId}
                      </p>
                    )}
                  </div>
                )}

                {/* Transaction Hash */}
                {txHash && (
                  <a
                    href={`${CONSTANTS.LINKS.explorer}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>View on Explorer</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-500/25 bg-red-500/10 p-4 text-center">
          <p className="text-red-400 font-semibold mb-2">Transaction Error:</p>
          <p className="text-red-300 text-sm">
            {error && typeof error === 'object' && 'message' in error ? String(error.message) : 'An error occurred'}
          </p>
          {error && typeof error === 'object' && 'cause' in error && error.cause && (
            <p className="text-red-400 text-xs mt-2">Cause: {String(error.cause)}</p>
          )}
          <p className="text-slate-400 text-xs mt-4">
            Check the browser console (F12) for detailed error logs
          </p>
        </div>
      )}
      </div>
    </MintPageErrorBoundary>
  )
}


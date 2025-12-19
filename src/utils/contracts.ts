import { Contract, BrowserProvider, JsonRpcProvider, ContractTransactionResponse, getAddress } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config/contracts';

// Import ABIs from Hardhat artifacts
// In production, you would copy these from artifacts/contracts/
// For now, we'll define minimal ABIs for the functions we need

const GIFT_CARD_NFT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'event ImageNFTMinted(uint256 indexed tokenId, address indexed to, string tokenURI)',
];

const GIFT_CARD_MINTER_ABI = [
  'function mintImageNFT(string memory tokenURI) returns (uint256)',
  'function getUserTokens(address user) view returns (uint256[])',
  'function totalMinted() view returns (uint256)',
  'event ImageNFTRequested(address indexed minter, uint256 indexed tokenId, string tokenURI)',
];

function validateContractAddress(address: string, name: string) {
  if (!address || address === '') {
    const error = new Error(`${name} contract address is not configured. Please check your .env file.`);
    console.error(error.message);
    throw error;
  }
  if (!/^0x[a-fA-F0-9]{40}$/i.test(address)) {
    const error = new Error(`${name} contract address is invalid: ${address}`);
    console.error(error.message);
    throw error;
  }
  // Ensure address is in checksum format
  try {
    return getAddress(address);
  } catch (error: any) {
    throw new Error(`${name} contract address has invalid checksum: ${address}. ${error.message}`);
  }
}

export function getGiftCardNFTContract(provider: BrowserProvider | JsonRpcProvider) {
  const address = validateContractAddress(CONTRACT_ADDRESSES.GIFT_CARD_NFT, 'GiftCardNFT');
  return new Contract(address, GIFT_CARD_NFT_ABI, provider);
}

export function getGiftCardMinterContract(provider: BrowserProvider | JsonRpcProvider) {
  if (!CONTRACT_ADDRESSES.GIFT_CARD_MINTER || CONTRACT_ADDRESSES.GIFT_CARD_MINTER === '') {
    throw new Error('GiftCardMinter contract address is not configured. Please set VITE_GIFT_CARD_MINTER_ADDRESS in your .env file.');
  }
  const address = validateContractAddress(CONTRACT_ADDRESSES.GIFT_CARD_MINTER, 'GiftCardMinter');
  return new Contract(address, GIFT_CARD_MINTER_ABI, provider);
}

/**
 * Mint an image NFT with the provided tokenURI
 * @param provider BrowserProvider instance
 * @param tokenURI URI pointing to the metadata JSON (ERC-721 standard)
 * @returns The tokenId of the newly minted NFT
 */
export async function mintImageNFT(provider: BrowserProvider, tokenURI: string): Promise<bigint> {
  const signer = await provider.getSigner();
  const minterContract = getGiftCardMinterContract(provider);
  const contractWithSigner = minterContract.connect(signer) as Contract & {
    mintImageNFT: (tokenURI: string) => Promise<ContractTransactionResponse>;
  };
  
  console.log('🚀 Calling mintImageNFT with tokenURI:', tokenURI);
  const tx = await contractWithSigner.mintImageNFT(tokenURI);
  console.log('⏳ Waiting for transaction confirmation...');
  const receipt = await tx.wait();
  
  if (!receipt) {
    throw new Error('Transaction receipt not found');
  }
  
  console.log('✅ Transaction confirmed. Block:', receipt.blockNumber);
  console.log('📋 Transaction hash:', receipt.hash);
  
  // Extract tokenId from events
  if (receipt.logs && receipt.logs.length > 0) {
    try {
      const iface = contractWithSigner.interface;
      
      // Try to parse all logs
      for (const log of receipt.logs) {
        try {
          const logAddress = log.address.toLowerCase();
          const contractAddress = getAddress(CONTRACT_ADDRESSES.GIFT_CARD_MINTER).toLowerCase();
          
          if (logAddress === contractAddress) {
            const parsedLog = iface.parseLog(log);
            if (parsedLog && parsedLog.name === 'ImageNFTRequested') {
              const tokenId = parsedLog.args.tokenId;
              console.log('✅ TokenId extracted from event:', tokenId.toString());
              return BigInt(tokenId.toString());
            }
          }
        } catch (parseError) {
          continue;
        }
      }
      
      // Also try parsing with the NFT contract interface
      const nftContract = getGiftCardNFTContract(provider);
      const nftIface = nftContract.interface;
      const nftAddress = getAddress(CONTRACT_ADDRESSES.GIFT_CARD_NFT).toLowerCase();
      
      for (const log of receipt.logs) {
        try {
          const logAddress = log.address.toLowerCase();
          if (logAddress === nftAddress) {
            const parsedLog = nftIface.parseLog(log);
            if (parsedLog && parsedLog.name === 'ImageNFTMinted') {
              const tokenId = parsedLog.args.tokenId;
              console.log('✅ TokenId extracted from NFT event:', tokenId.toString());
              return BigInt(tokenId.toString());
            }
          }
        } catch (parseError) {
          continue;
        }
      }
    } catch (error) {
      console.error('Error parsing events:', error);
    }
  }
  
  // Fallback: get totalSupply after minting
  try {
    const nftContract = getGiftCardNFTContract(provider);
    const totalSupply = await nftContract.totalSupply();
    const totalSupplyBigInt = BigInt(totalSupply.toString());
    
    if (totalSupplyBigInt > 0) {
      const newTokenId = totalSupplyBigInt - BigInt(1);
      console.log('✅ TokenId calculated from totalSupply:', newTokenId.toString());
      return newTokenId;
    }
  } catch (error) {
    console.error('Error getting totalSupply after mint:', error);
  }
  
  throw new Error('Could not determine tokenId from transaction');
}

/**
 * Get all token IDs owned by a specific user (fallback method)
 * This method queries the NFT contract directly by checking ownership of all tokens
 * @param provider BrowserProvider instance
 * @param userAddress Address of the user
 * @returns Array of token IDs owned by the user
 */
async function getUserTokensFromNFT(provider: BrowserProvider, userAddress: string): Promise<bigint[]> {
  try {
    const nftContract = getGiftCardNFTContract(provider);
    const totalSupply = await nftContract.totalSupply();
    const totalSupplyNum = Number(totalSupply);
    
    if (totalSupplyNum === 0) {
      return [];
    }
    
    const userTokens: bigint[] = [];
    const normalizedUserAddress = userAddress.toLowerCase();
    
    // Check each token ID
    for (let i = 0; i < totalSupplyNum; i++) {
      try {
        const owner = await nftContract.ownerOf(i);
        if (owner.toLowerCase() === normalizedUserAddress) {
          userTokens.push(BigInt(i));
        }
      } catch (error: any) {
        // Token doesn't exist or other error, skip
        console.warn(`Error checking token ${i}:`, error.message);
        continue;
      }
    }
    
    return userTokens;
  } catch (error: any) {
    console.error('Error getting user tokens from NFT contract:', error);
    throw error;
  }
}

/**
 * Get all token IDs minted by a specific user
 * Tries getUserTokens from minter contract first, falls back to direct NFT query
 * @param provider BrowserProvider instance
 * @param userAddress Address of the user
 * @returns Array of token IDs
 */
export async function getUserTokens(provider: BrowserProvider, userAddress: string): Promise<bigint[]> {
  try {
    console.log('🔍 Getting user tokens for:', userAddress);
    
    // First, try to get tokens from the minter contract's getUserTokens function
    if (CONTRACT_ADDRESSES.GIFT_CARD_MINTER && CONTRACT_ADDRESSES.GIFT_CARD_MINTER !== '') {
      try {
        const minterContract = getGiftCardMinterContract(provider);
        console.log('📞 Calling getUserTokens on minter contract...');
        
        // Try to call getUserTokens, but handle the case where it might fail
        const tokenIds = await minterContract.getUserTokens(userAddress);
        
        console.log('✅ getUserTokens returned:', tokenIds);
        
        // Check if we got a valid array
        if (Array.isArray(tokenIds)) {
          const result = tokenIds.map((id: any) => BigInt(id.toString()));
          console.log('✅ Parsed token IDs:', result.map(id => id.toString()));
          return result;
        }
      } catch (minterError: any) {
        // If getUserTokens fails (e.g., function doesn't exist, decoding error, etc.)
        // fall back to querying the NFT contract directly
        console.warn('⚠️ getUserTokens from minter failed, using fallback:', minterError.message);
        console.warn('Error details:', {
          code: minterError.code,
          reason: minterError.reason,
          data: minterError.data
        });
      }
    }
    
    // Fallback: Query NFT contract directly by checking ownership
    console.log('🔄 Using fallback: querying NFT contract directly...');
    const tokens = await getUserTokensFromNFT(provider, userAddress);
    console.log('✅ Found tokens via fallback:', tokens.map(id => id.toString()));
    return tokens;
  } catch (error: any) {
    console.error('❌ Error getting user tokens:', error);
    // Return empty array instead of throwing, so UI can still render
    // This is not necessarily an error - user might just not have any NFTs yet
    return [];
  }
}

/**
 * Get NFT information including tokenURI
 * @param provider BrowserProvider instance
 * @param tokenId Token ID to query
 * @returns Object with tokenURI and owner address
 */
export async function getNFTInfo(provider: BrowserProvider, tokenId: bigint) {
  try {
    const nftContract = getGiftCardNFTContract(provider);
    
    const [tokenURI, owner] = await Promise.all([
      nftContract.tokenURI(tokenId),
      nftContract.ownerOf(tokenId),
    ]);
    
    return {
      tokenId: tokenId.toString(),
      tokenURI,
      owner,
    };
  } catch (error: any) {
    console.error('Error getting NFT info:', error);
    throw new Error(`Failed to get NFT info: ${error.message || 'Unknown error'}`);
  }
}

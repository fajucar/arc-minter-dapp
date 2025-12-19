import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { getUserTokens, getNFTInfo } from '../utils/contracts';
import toast from 'react-hot-toast';

interface NFTInfo {
  tokenId: string;
  tokenURI: string;
  owner: string;
}

export function MyNFTs() {
  const { address, provider, isConnected } = useWallet();
  const [nfts, setNfts] = useState<NFTInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNFTs = useCallback(async () => {
    if (!provider || !address) return;
    
    setLoading(true);
    try {
      const tokenIds = await getUserTokens(provider, address);
      
      // If no tokens, just set empty array (not an error)
      if (tokenIds.length === 0) {
        setNfts([]);
        setLoading(false);
        return;
      }
      
      // Fetch info for each token
      const nftInfos = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            return await getNFTInfo(provider, tokenId);
          } catch (error) {
            console.warn(`Error loading token ${tokenId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out nulls
      const validNFTs = nftInfos.filter((nft): nft is NFTInfo => nft !== null);
      setNfts(validNFTs);
    } catch (error: any) {
      console.error('Failed to load NFTs:', error);
      // Only show error toast if it's not just an empty result
      if (!error.message?.includes('empty') && !error.message?.includes('no tokens')) {
        const errorMessage = error?.message || 'Failed to load NFTs';
        toast.error(errorMessage);
      }
      setNfts([]);
    } finally {
      setLoading(false);
    }
  }, [provider, address]);

  useEffect(() => {
    if (isConnected) {
      loadNFTs();
    } else {
      setNfts([]);
    }
  }, [isConnected, loadNFTs]);

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500 text-center">Please connect your wallet to view your NFTs</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500 text-center">Loading your NFTs...</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Minhas NFTs</h2>
          <button
            onClick={loadNFTs}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        <p className="text-gray-500 text-center">You don't have any NFTs yet. Mint one from the collection above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Minhas NFTs</h2>
        <button
          onClick={loadNFTs}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nfts.map((nft) => (
          <div
            key={nft.tokenId}
            className="border-2 border-primary-200 rounded-lg p-4 bg-primary-50"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-semibold text-gray-600">Token ID</span>
              <span className="text-sm font-mono">#{nft.tokenId}</span>
            </div>
            
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-1">Metadata URI:</span>
              <a
                href={nft.tokenURI}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700 break-all"
              >
                {nft.tokenURI.length > 50 ? `${nft.tokenURI.substring(0, 50)}...` : nft.tokenURI}
              </a>
            </div>
            
            <div className="text-xs text-gray-500">
              Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}













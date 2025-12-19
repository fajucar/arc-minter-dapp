// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ArcNFT
 * @dev ERC721 NFT contract with public minting for Arc Network
 * @notice Supports 3 types of NFTs: Explorer (0), Builder (1), Guardian (2)
 */
contract ArcNFT is ERC721, Ownable {
    using Strings for uint256;

    // Base URI for metadata
    string private _baseTokenURI;

    // Token ID counter
    uint256 private _tokenIdCounter;

    // Mapping from tokenId to NFT type (0, 1, or 2)
    mapping(uint256 => uint8) public nftType;

    // Total supply tracking
    uint256 public totalSupply;

    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, uint8 nftType);

    /**
     * @dev Constructor
     * @param initialOwner Address that will own the contract
     */
    constructor(address initialOwner) ERC721("Arc Network NFT", "ARC") Ownable(initialOwner) {
        _tokenIdCounter = 0;
        totalSupply = 0;
    }

    /**
     * @dev Mint a new NFT of the specified type
     * @param _type NFT type: 0 = Explorer, 1 = Builder, 2 = Guardian
     * @return tokenId The ID of the newly minted token
     */
    function mint(uint8 _type) public returns (uint256) {
        require(_type <= 2, "ArcNFT: Invalid NFT type (must be 0, 1, or 2)");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        totalSupply++;

        // Store the NFT type
        nftType[tokenId] = _type;

        // Mint the NFT to the caller
        _safeMint(msg.sender, tokenId);

        emit NFTMinted(msg.sender, tokenId, _type);

        return tokenId;
    }

    /**
     * @dev Get the NFT type for a given token ID
     * @param tokenId The token ID to query
     * @return The NFT type (0, 1, or 2)
     */
    function getNFTType(uint256 tokenId) public view returns (uint8) {
        require(_ownerOf(tokenId) != address(0), "ArcNFT: Token does not exist");
        return nftType[tokenId];
    }

    /**
     * @dev Override tokenURI to return baseURI + type + ".json"
     * @param tokenId The token ID to query
     * @return The full URI string
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ArcNFT: URI query for nonexistent token");

        uint8 nftTypeValue = nftType[tokenId];
        string memory baseURI = _baseTokenURI;
        
        // If baseURI is empty, return empty string (or you can return a default)
        if (bytes(baseURI).length == 0) {
            return "";
        }
        
        // Return baseURI + type + ".json"
        // Example: "https://example.com/metadata/" + "0" + ".json"
        return string(abi.encodePacked(baseURI, uint256(nftTypeValue).toString(), ".json"));
    }

    /**
     * @dev Set the base URI for all token metadata
     * @param baseURI_ The base URI (should end with /)
     * @notice Only the owner can call this function
     */
    function setBaseURI(string memory baseURI_) public onlyOwner {
        _baseTokenURI = baseURI_;
    }

    /**
     * @dev Get the current base URI
     * @return The current base URI
     */
    function baseURI() public view returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Override _baseURI to use our custom base URI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
}




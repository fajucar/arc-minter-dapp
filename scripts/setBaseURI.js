const { ethers } = require("hardhat");

/**
 * Set baseURI for ArcNFT contract
 * Usage: npm run set-uri -- --uri "https://example.com/metadata/"
 */
async function main() {
  // Get baseURI from command line arguments
  const args = process.argv.slice(2);
  const uriIndex = args.indexOf("--uri");
  
  if (uriIndex === -1 || uriIndex === args.length - 1) {
    console.error("❌ Error: --uri argument is required");
    console.error("Usage: npm run set-uri -- --uri \"https://example.com/metadata/\"");
    process.exit(1);
  }

  const baseURI = args[uriIndex + 1];
  
  if (!baseURI || baseURI.trim() === "") {
    console.error("❌ Error: baseURI cannot be empty");
    process.exit(1);
  }

  console.log("🔧 Setting baseURI for ArcNFT contract...\n");

  // Get contract address from .env or hardhat config
  const contractAddress = process.env.VITE_ARC_NFT_CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("❌ Error: VITE_ARC_NFT_CONTRACT_ADDRESS not found in environment");
    console.error("Please set it in your .env file or export it");
    process.exit(1);
  }

  console.log("📋 Contract address:", contractAddress);
  console.log("📋 New baseURI:", baseURI);
  console.log("🌐 Network:", network.name);
  console.log("");

  // Get the deployer account
  const [owner] = await ethers.getSigners();
  console.log("📋 Using account:", owner.address);

  // Connect to the deployed contract
  const ArcNFT = await ethers.getContractFactory("ArcNFT");
  const arcNFT = ArcNFT.attach(contractAddress);

  // Get current baseURI
  const currentURI = await arcNFT.baseURI();
  console.log("📋 Current baseURI:", currentURI || "(empty)");

  // Check if caller is owner
  const contractOwner = await arcNFT.owner();
  if (owner.address.toLowerCase() !== contractOwner.toLowerCase()) {
    console.error("❌ Error: Caller is not the contract owner");
    console.error("   Caller:", owner.address);
    console.error("   Owner:", contractOwner);
    process.exit(1);
  }

  // Set the new baseURI
  console.log("\n⏳ Setting new baseURI...");
  const tx = await arcNFT.setBaseURI(baseURI);
  console.log("📋 Transaction hash:", tx.hash);

  // Wait for confirmation
  console.log("⏳ Waiting for confirmation...");
  const receipt = await tx.wait();

  console.log("\n✅ baseURI updated successfully!");
  console.log("📋 Block number:", receipt.blockNumber);
  console.log("📋 Gas used:", receipt.gasUsed.toString());

  // Verify the update
  const newURI = await arcNFT.baseURI();
  console.log("\n✅ Verified new baseURI:", newURI);

  console.log("\n" + "=".repeat(60));
  console.log("📝 NEXT STEPS:");
  console.log("=".repeat(60));
  console.log("\n1. Test tokenURI for a minted token:");
  console.log(`   const tokenURI = await arcNFT.tokenURI(0);`);
  console.log(`   // Should return: ${baseURI}0.json`);
  console.log("\n2. Verify metadata is accessible:");
  console.log(`   Visit: ${baseURI}0.json`);
  console.log(`   Visit: ${baseURI}1.json`);
  console.log(`   Visit: ${baseURI}2.json`);
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Failed to set baseURI:");
    console.error(error);
    process.exit(1);
  });




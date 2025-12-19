const { ethers } = require("hardhat");

/**
 * Deploy ArcNFT contract to Arc Network
 */
async function main() {
  console.log("🚀 Deploying ArcNFT contract...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Get the contract factory
  const ArcNFT = await ethers.getContractFactory("ArcNFT");
  
  // Deploy the contract (initialOwner is the deployer)
  console.log("⏳ Deploying contract...");
  const arcNFT = await ArcNFT.deploy(deployer.address);
  
  // Wait for deployment
  console.log("⏳ Waiting for deployment confirmation...");
  await arcNFT.waitForDeployment();
  
  const address = await arcNFT.getAddress();
  console.log("\n✅ ArcNFT deployed to:", address);
  console.log("📋 Deployer address:", deployer.address);
  console.log("🌐 Network:", network.name);
  console.log("🔗 Chain ID:", (await ethers.provider.getNetwork()).chainId);

  // Verify contract info
  console.log("\n📊 Contract Info:");
  console.log("  - Name:", await arcNFT.name());
  console.log("  - Symbol:", await arcNFT.symbol());
  console.log("  - Total Supply:", await arcNFT.totalSupply());
  console.log("  - Base URI:", await arcNFT.baseURI() || "(not set)");

  console.log("\n" + "=".repeat(60));
  console.log("📝 NEXT STEPS:");
  console.log("=".repeat(60));
  console.log("\n1. Add to .env file:");
  console.log(`   VITE_ARC_NFT_CONTRACT_ADDRESS=${address}`);
  console.log("\n2. Build and deploy frontend");
  console.log("\n3. After frontend is deployed, set baseURI:");
  console.log(`   npm run set-uri -- --uri "https://YOUR_FRONTEND_URL/metadata/"`);
  console.log("\n4. Test minting with:");
  console.log("   - Explorer (type 0)");
  console.log("   - Builder (type 1)");
  console.log("   - Guardian (type 2)");
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });




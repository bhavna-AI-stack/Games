import { ethers, network } from "hardhat";

async function main() {
  console.log("=================================================");
  console.log("  Mock ERC20 - Deployment Script");
  console.log("=================================================");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`  Network:   ${network.name}`);
  if (network.config.chainId) {
    console.log(`  Chain ID:  ${network.config.chainId}`);
  }
  console.log(`  Deployer:  ${deployer.address}`);
  console.log(`  Balance:   ${ethers.formatEther(balance)} ETH`);
  console.log("=================================================\n");

  console.log("Deploying MockERC20...");

  // We deploy with 1,000,000 MTK initially minted to the deployer
  const initialSupply = ethers.parseEther("1000000");

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockERC20.deploy("Mock Token", "MTK", 18, initialSupply);

  await mockToken.waitForDeployment();
  const contractAddress = await mockToken.getAddress();

  console.log("\n✅ MockERC20 deployed successfully!");
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Tokens Minted:    1,000,000 MTK`);

  console.log("\n=================================================");
  console.log(`  Use this Token Address in the DApp:`);
  console.log(`  ${contractAddress}`);
  console.log("=================================================\n");
}

main().catch((error) => {
  console.error("❌ Deployment failed:");
  console.error(error);
  process.exitCode = 1;
});

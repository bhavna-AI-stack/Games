import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * @description Deploys the TokenVesting contract to the configured network.
 *              After deployment, writes the contract address to the frontend constants file.
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=================================================");
  console.log("  Token Vesting DApp - Deployment Script");
  console.log("=================================================");
  console.log(`  Network:   ${(await ethers.provider.getNetwork()).name}`);
  console.log(`  Chain ID:  ${(await ethers.provider.getNetwork()).chainId}`);
  console.log(`  Deployer:  ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`  Balance:   ${ethers.formatEther(balance)} ETH`);
  console.log("=================================================\n");

  // Deploy TokenVesting
  console.log("Deploying TokenVesting...");
  const TokenVesting = await ethers.getContractFactory("TokenVesting");
  const vesting = await TokenVesting.deploy();
  await vesting.waitForDeployment();

  const contractAddress = await vesting.getAddress();
  const deployTx = vesting.deploymentTransaction();

  console.log(`\n✅ TokenVesting deployed successfully!`);
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Transaction Hash: ${deployTx?.hash}`);
  console.log(`   Block Number:     ${deployTx?.blockNumber ?? "pending"}`);

  // Update frontend addresses file
  const addressesPath = path.resolve(
    __dirname,
    "../frontend/src/constants/addresses.ts"
  );

  if (fs.existsSync(addressesPath)) {
    let content = fs.readFileSync(addressesPath, "utf-8");
    content = content.replace(
      /TOKEN_VESTING_ADDRESS:\s*"[^"]*"/,
      `TOKEN_VESTING_ADDRESS: "${contractAddress}"`
    );
    fs.writeFileSync(addressesPath, content);
    console.log(`\n📝 Updated frontend/src/constants/addresses.ts`);
  }

  // Update root .env file with contract address
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");
    if (envContent.includes("VITE_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /VITE_CONTRACT_ADDRESS=.*/,
        `VITE_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log(`📝 Updated .env with VITE_CONTRACT_ADDRESS`);
  }

  console.log("\n=================================================");
  console.log("  Next Steps:");
  console.log(`  1. Copy contract address: ${contractAddress}`);
  console.log(`  2. Verify on explorer: https://explorer.securechain.ai/address/${contractAddress}`);
  console.log("  3. Run: cd frontend && npm run dev");
  console.log("=================================================\n");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

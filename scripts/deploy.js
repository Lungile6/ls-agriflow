import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("Deploying LSAgriFlow_Supply_v1...");

  // Get the contract factory
  const LSAgriFlow = await ethers.getContractFactory("LSAgriFlow_Supply_v1");
  
  // Deploy the contract
  const contract = await LSAgriFlow.deploy();

  // Wait for deployment to finish
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`LSAgriFlow_Supply_v1 deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
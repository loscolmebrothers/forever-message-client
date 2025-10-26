import { JsonRpcProvider, Contract } from "ethers";
import { FOREVER_MESSAGE_ABI } from "./contract-abi";

/**
 * Get Alchemy RPC provider for Base Sepolia testnet
 * SERVER-SIDE ONLY - uses secret API key
 */
export function getProvider(): JsonRpcProvider {
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;

  if (!rpcUrl) {
    throw new Error("BASE_SEPOLIA_RPC_URL environment variable not set");
  }

  return new JsonRpcProvider(rpcUrl);
}

/**
 * Get ForeverMessage contract instance
 * SERVER-SIDE ONLY
 */
export function getContract(): Contract {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS environment variable not set");
  }

  const provider = getProvider();
  return new Contract(contractAddress, FOREVER_MESSAGE_ABI, provider);
}

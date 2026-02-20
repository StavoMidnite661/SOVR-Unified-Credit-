import { createPublicClient, createWalletClient, http, custom, parseUnits } from 'viem';
import { base } from 'viem/chains';

// Contract Addresses (Placeholders for real deployment)
export const USD_SOVR_ADDRESS = '0x1234567890123456789012345678901234567890'; // Replace with real
export const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const getWalletClient = async () => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    const [account] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    return createWalletClient({
      account,
      chain: base,
      transport: custom((window as any).ethereum),
    });
  }
  return null;
};

// ERC20 ABI Subset
export const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'recipient', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'boolean' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
] as const;

export const getTokenBalance = async (tokenAddress: `0x${string}`, userAddress: `0x${string}`) => {
  const balance = await publicClient.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
  });
  const decimals = await publicClient.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
  });
  return Number(balance) / Math.pow(10, decimals);
};

export const burnStablecoins = async (amount: number, userAddress: `0x${string}`) => {
  const walletClient = await getWalletClient();
  if (!walletClient) throw new Error("No wallet connected");

  const amountBigInt = parseUnits(amount.toString(), 18);

  // REAL CONTRACT CALL: Transfer to Dead Address (Standard Burn mechanism for many stablecoins)
  const { request } = await publicClient.simulateContract({
    account: userAddress,
    address: USD_SOVR_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [BURN_ADDRESS as `0x${string}`, amountBigInt],
  });

  const hash = await walletClient.writeContract(request);
  return hash;
};

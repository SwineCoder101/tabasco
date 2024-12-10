import { createKeyPairSignerFromBytes } from '@solana/web3.js';

export async function createWallet(secretKeyString: string) {
  const keyPairBytes = Uint8Array.from(JSON.parse(secretKeyString));
  return await createKeyPairSignerFromBytes(keyPairBytes);
}

export function getKeypair(secretKeyString: string) {
  return Uint8Array.from(JSON.parse(secretKeyString));
}

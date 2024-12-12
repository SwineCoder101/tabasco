import {
  extension,
  getInitializeMetadataPointerInstruction,
  getInitializeTokenMetadataInstruction,
} from '@solana-program/token-2022';
import {
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  generateKeyPairSigner,
  Rpc,
  RpcSubscriptions,
  SolanaRpcApi,
  SolanaRpcSubscriptionsApi,
  some,
} from '@solana/web3.js';
import {
  createTokenWithAmount,
  getCreateMintInstructions,
  sendAndConfirmInstructions,
} from './_setup';
import { getKeypair } from './wallet-utils';
// import dotenv from 'dotenv';

// console.log(dotenv);

// dotenv.config();

type Client = {
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
};

export const createClient = (): Client => {
  const rpc = createSolanaRpc('https://api.devnet.solana.com');
  const rpcSubscriptions = createSolanaRpcSubscriptions(
    'wss://api.devnet.solana.com/',
  );
  return { rpc, rpcSubscriptions };
};

async function main() {
  const client = createClient();
  const secretKeyString =
    '[56,65,24,215,163,56,169,230,178,19,97,204,172,105,158,111,61,183,114,196,133,11,230,54,153,205,219,250,218,41,11,5,100,36,212,102,95,33,189,130,157,37,252,126,166,77,116,179,91,79,245,53,212,148,150,248,245,168,90,195,196,70,190,224]';
  const keypairBytes = getKeypair(secretKeyString);
  const authority = await createKeyPairSignerFromBytes(keypairBytes);
  const mint = await generateKeyPairSigner();
  const updateAuthority = await generateKeyPairSigner();

  const tokenMetadataExtension = extension('TokenMetadata', {
    updateAuthority: some(updateAuthority.address),
    mint: mint.address,
    name: 'Bonk',
    symbol: 'Bonk',
    uri: 'https://idylufmhksp63vptfnctn2qcjphffwwryc5cbw4wd2xnyiqzf3ga.arweave.net/QPC6FYdUn-3V8ytFNuoCS85S2tHAuiDblh6u3CIZLsw',
    additionalMetadata: new Map<string, string>(),
  });

  const metadataPointerExtension = extension('MetadataPointer', {
    authority: some(authority.address),
    metadataAddress: some(mint.address),
  });

  const [createMintInstruction, initMintInstruction] =
    await getCreateMintInstructions({
      authority: authority.address,
      client,
      extensions: [metadataPointerExtension, tokenMetadataExtension],
      mint,
      payer: authority,
    });

  const tx = await sendAndConfirmInstructions(client, authority, [
    createMintInstruction,
    getInitializeMetadataPointerInstruction({
      mint: mint.address,
      authority: authority.address,
      metadataAddress: mint.address,
    }),
    initMintInstruction,
    getInitializeTokenMetadataInstruction({
      metadata: mint.address,
      updateAuthority: updateAuthority.address,
      mint: mint.address,
      mintAuthority: authority,
      name: tokenMetadataExtension.name || 'Super Token',
      symbol: tokenMetadataExtension.symbol,
      uri: tokenMetadataExtension.uri,
    }),
  ]);

  console.log('tx: ', tx);
  console.log('mint address: ', mint.address);

  const tokenAccount = await createTokenWithAmount({
    client,
    payer: authority,
    mint: mint.address,
    amount: 3000000000,
    mintAuthority: authority,
    owner: authority,
  });

  console.log('tokenAccount: ', tokenAccount);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

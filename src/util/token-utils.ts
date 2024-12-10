import {
  percentAmount,
  generateSigner,
  signerIdentity,
  createSignerFromKeypair,
  Umi,
  Keypair,
} from '@metaplex-foundation/umi';
import {
  TokenStandard,
  createAndMint,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

export interface MetadataDTO {
  name: string;
  symbol: string;
  description: string;
  image: string;
  uri: string;
}

export const initializeUmi = (rpcUrl: string, secretKeyString: string) => {
  const umi = createUmi(rpcUrl);
  const secretBytes = Uint8Array.from(JSON.parse(secretKeyString));
  const userWallet = umi.eddsa.createKeypairFromSecretKey(secretBytes);
  const userWalletSigner = createSignerFromKeypair(umi, userWallet);
  umi.use(signerIdentity(userWalletSigner));
  umi.use(mplTokenMetadata());
  return { umi, userWallet };
};

export const createTokenMint = async (
  metadata: MetadataDTO,
  umi: Umi,
  userWallet: Keypair,
) => {
  const mint = generateSigner(umi);
  const transferBuilder = createAndMint(umi, {
    mint,
    authority: umi.identity,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 8,
    amount: 1000000_00000000,
    tokenOwner: userWallet.publicKey,
    tokenStandard: TokenStandard.Fungible,
  })
    .sendAndConfirm(umi)
    .then(() => {
      console.log(
        'Successfully minted 1 million tokens (',
        mint.publicKey,
        ')',
      );
    })
    .catch((err) => {
      console.error('Error minting tokens:', err);
    });

  console.log('TransferBuilder:', transferBuilder);

  return transferBuilder;
};

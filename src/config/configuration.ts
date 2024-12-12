import { createClient } from '../util/spl';
import { getAuthorityWallet } from '../util/wallet-utils';

export default async () => {
  const solClient = await createClient(
    process.env.RPC_URL,
    process.env.RPC_WSS,
  );
  const authorityWallet = await getAuthorityWallet(process.env.SECRET_KEY_PAIR);

  return {
    solClient,
    authorityWallet,
    pinata: {
      apiKey: process.env.PINATA_API_KEY,
      apiSecret: process.env.PINATA_API_SECRET,
      jwtToken: process.env.PINATA_JWT_TOKEN,
    },
    rpc: process.env.RPC,
    secretKeyPair: process.env.SECRET_KEY_PAIR,
    signerUuid: process.env.SIGNER_UUID,
    neynar: {
      apiKey: process.env.NEYNAR_API_KEY,
      webhookSecret: process.env.NEYNAR_WEBHOOK_SECRET,
    },
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  };
};

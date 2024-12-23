import { createClient } from '../util/spl';
import { getAuthorityWallet } from '../util/wallet-utils';

export default async () => {
  const solClient = await createClient(
    process.env.RPC_URL,
    process.env.RPC_WSS,
  );
  const authorityWallet = await getAuthorityWallet(process.env.SECRET_KEY_PAIR);
  const base58privateKey = authorityWallet.keyPair.privateKey;

  return {
    solClient,
    authorityWallet,
    base58privateKey,
    pinata: {
      apiKey: process.env.PINATA_API_KEY,
      apiSecret: process.env.PINATA_API_SECRET,
      jwtToken: process.env.PINATA_JWT_TOKEN,
    },
    rpcUrl: process.env.RPC,
    rpcWss: process.env.RPC_WSS,
    neynarAiSignerUuid: process.env.NEYNAR_AI_SIGNER_UUID,
    secretKeyPair: process.env.SECRET_KEY_PAIR,
    signerUuid: process.env.SIGNER_UUID,
    neynar: {
      apiKey: process.env.NEYNAR_API_KEY,
      webhookSecret: process.env.NEYNAR_WEBHOOK_SECRET,
    },
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiAPIKey: process.env.OPENAI_API_KEY,
  };
};

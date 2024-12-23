import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  extension,
  getInitializeMetadataPointerInstruction,
  getInitializeTokenMetadataInstruction,
} from '@solana-program/token-2022';
import {
  Address,
  generateKeyPairSigner,
  KeyPairSigner,
  some,
} from '@solana/web3.js';
import {
  createTokenWithAmount,
  getCreateMintInstructions,
  sendAndConfirmInstructions,
} from './util/_setup';
import { Client } from './util/spl';

// { mint: KeyPairSigner; tokenAccount: Address }
export interface CreatedTokenMintAccount {
  mint: KeyPairSigner;
  tokenAccount: Address;
  associatedTokenAccount: Address;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  private client: Client;
  private authority: KeyPairSigner;
  private mintAddress: Address;
  private tokenAccount: Address;
  private associatedTokenAccount: Address;

  constructor(private configService: ConfigService) {
    this.client = configService.get<Client>('solClient');
    this.authority = configService.get<KeyPairSigner>('authorityWallet');
    this.logger.log(`Using authority: ${this.authority.address}`);
  }

  async createTokenMintAccount(
    name: string,
    symbol: string,
    uri: string,
    additionalMetadata?: Map<string, string>,
    userWaller?: string,
  ): Promise<CreatedTokenMintAccount> {
    this.logger.log(
      `Creating token mint account with name: ${name} and symbol: ${symbol} and uri: ${uri} and userWallet: ${userWaller}`,
    );

    additionalMetadata = additionalMetadata || new Map<string, string>();
    const mint = await generateKeyPairSigner();
    const updateAuthority = this.authority;

    const tokenMetadataExtension = extension('TokenMetadata', {
      updateAuthority: some(updateAuthority.address),
      mint: mint.address,
      name,
      symbol,
      uri,
      additionalMetadata,
    });

    const metadataPointerExtension = extension('MetadataPointer', {
      authority: some(this.authority.address),
      metadataAddress: some(mint.address),
    });

    const [createMintInstruction, initMintInstruction] =
      await getCreateMintInstructions({
        authority: this.authority.address,
        client: this.client,
        extensions: [metadataPointerExtension, tokenMetadataExtension],
        mint,
        payer: this.authority,
      });

    const tx = await sendAndConfirmInstructions(this.client, this.authority, [
      createMintInstruction,
      getInitializeMetadataPointerInstruction({
        mint: mint.address,
        authority: this.authority.address,
        metadataAddress: mint.address,
      }),
      initMintInstruction,
      getInitializeTokenMetadataInstruction({
        metadata: mint.address,
        updateAuthority: updateAuthority.address,
        mint: mint.address,
        mintAuthority: this.authority,
        name: tokenMetadataExtension.name || 'Super Token',
        symbol: tokenMetadataExtension.symbol,
        uri: tokenMetadataExtension.uri,
      }),
    ]);

    this.logger.log(`Transaction successful: ${tx}`);
    this.logger.log(`Mint address: ${mint.address}`);

    const { tokenAccount, associatedTokenAccount, ataSignature } =
      await createTokenWithAmount({
        client: this.client,
        payer: this.authority,
        mint: mint.address,
        amount: 1000000000n,
        mintAuthority: this.authority,
        owner: this.authority,
      });

    this.mintAddress = mint.address;
    this.tokenAccount = tokenAccount;
    this.associatedTokenAccount = associatedTokenAccount;

    this.logger.log(
      `Token account created: ${tokenAccount} with association:  ${associatedTokenAccount} on signature: ${ataSignature}`,
    );
    return { mint, tokenAccount, associatedTokenAccount };
  }
}

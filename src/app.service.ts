import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import { SolanaOrcaService } from './orca.service';
import { NeynarService } from './neynar.service';
import { AIService } from './ai.service';
import { Cast } from '@neynar/nodejs-sdk/build/api';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly orcaService: SolanaOrcaService,
    private readonly neynarService: NeynarService,
    private readonly aiService: AIService,
  ) {
    this.logEnvVariables();
    this.warpcasttest();
    // this.initialize(); // Enable for testing purposes
  }

  private async warpcasttest() {
    const msg = 'Its a pleasent evening in Ho Chi Minh City';
    const response = await this.neynarService.publishCast(msg);

    const cast: Cast = {
      hash: response.cast.hash,
      parent_hash: null,
      parent_url: null,
      root_parent_url: null,
      parent_author: null,
      author: {
        object: response.cast.author.object,
        username: response.cast.author.username,
        custody_address: response.cast.author.custody_address,
        profile: response.cast.author.profile,
        // Add other missing properties here
      },
      text: msg,
      timestamp: new Date().toISOString(),
      embeds: [],
      type: null,
    };
    this.aiService.generateAIResponse(cast);
  }

  private async initialize() {
    const supply = 10000000000000;
    const { mint } = await this.tokenService.createTokenMintAccount(
      'Test BONK Token',
      'TBONK',
      'https://idylufmhksp63vptfnctn2qcjphffwwryc5cbw4wd2xnyiqzf3ga.arweave.net/QPC6FYdUn-3V8ytFNuoCS85S2tHAuiDblh6u3CIZLsw',
      supply,
    );

    const tokenMintOne = 'So11111111111111111111111111111111111111112';
    const tokenMintTwo = mint.address.toString();
    // const tokenMintTwo = '5R8s5kijn8UnCmPCiY7EuPWknt3vrCFpmdo2DrYXLCwJ';
    const tickSpacing = 64;
    const initialPrice = 0.0001;

    const poolAddress = await this.orcaService.createPool(
      tokenMintOne,
      tokenMintTwo,
      tickSpacing,
      initialPrice,
    );

    this.logger.log(`Pool created at: ${poolAddress}`);

    // const initializedPoolAddr = await this.orcaService.getInitializedPool(
    //   tokenMintOne,
    //   tokenMintTwo,
    // );

    // this.logger.log(`Initialized Pool: ${initializedPoolAddr}`);

    await this.orcaService.createPosition(poolAddress, {
      tokenB: 10000n,
    });
  }

  private logEnvVariables(): void {
    const pinataApiKey = this.configService.get<string>('pinata.apiKey');
    const pinataApiSecret = this.configService.get<string>('pinata.apiSecret');
    const pinataJwtToken = this.configService.get<string>('pinata.jwtToken');
    const rpcURL = this.configService.get<string>('rpcUrl');
    const rpcWss = this.configService.get<string>('rpcWss');
    const secretKeyPair = this.configService.get<string>('secretKeyPair');
    const signerUuid = this.configService.get<string>('signerUuid');
    const neynarApiKey = this.configService.get<string>('neynar.apiKey');
    const neynarWebhookSecret = this.configService.get<string>(
      'neynar.webhookSecret',
    );
    const anthropicApiKey = this.configService.get<string>('anthropicApiKey');

    this.logger.debug(`PINATA_API_KEY: ${pinataApiKey}`);
    this.logger.debug(`PINATA_API_SECRET: ${pinataApiSecret}`);
    this.logger.debug(`PINATA_JWT_TOKEN: ${pinataJwtToken}`);
    this.logger.debug(`RPC_URL: ${rpcURL}`);
    this.logger.debug(`RPC_WSS: ${rpcWss}`);
    this.logger.debug(`SECRET_KEY_PAIR: ${secretKeyPair}`);
    this.logger.debug(`SIGNER_UUID: ${signerUuid}`);
    this.logger.debug(`NEYNAR_API_KEY: ${neynarApiKey}`);
    this.logger.debug(`NEYNAR_WEBHOOK_SECRET: ${neynarWebhookSecret}`);
    this.logger.debug(`ANTHROPIC_API_KEY: ${anthropicApiKey}`);
  }

  getHello(): string {
    return 'Hello World!';
  }
}

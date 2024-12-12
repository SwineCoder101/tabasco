import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeyPairSigner } from '@solana/web3.js';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private configService: ConfigService) {
    this.logEnvVariables();
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

    this.logger.log(
      'Authority wallet:',
      this.configService.get<KeyPairSigner<string>>('authorityWallet')?.address,
    );
  }

  getHello(): string {
    return 'Hello World!';
  }
}

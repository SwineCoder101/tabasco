import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

@Injectable()
export class NeynarAIAgentService {
  private readonly logger = new Logger(NeynarAIAgentService.name);
  private readonly client: NeynarAPIClient;
  private readonly signerUuid: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('neynar.apiKey');
    this.signerUuid = this.configService.get<string>('neynarAiSignerUuid');

    this.client = new NeynarAPIClient({
      apiKey: apiKey,
    });
  }

  async publishCast(text: string): Promise<void> {
    try {
      this.logger.debug(`Publishing cast message: ${text}`);

      const response = await this.client.publishCast({
        signerUuid: this.signerUuid,
        text: text,
      });

      this.logger.debug(`Cast response: ${JSON.stringify(response.cast)}`);
    } catch (err) {
      this.logger.error('Error publishing cast:', err);
      throw err;
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { PostCastResponse } from '@neynar/nodejs-sdk/build/api';

@Injectable()
export class NeynarService {
  private readonly logger = new Logger(NeynarService.name);
  private readonly client: NeynarAPIClient;
  private signerUuid: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('NEYNAR_API_KEY');
    this.signerUuid = this.configService.get<string>('SIGNER_UUID');
    this.client = new NeynarAPIClient({
      apiKey: apiKey,
    });
  }

  async publishCast(msg: string): Promise<PostCastResponse> {
    try {
      this.logger.debug(`Publishing cast message: ${msg}`);

      const response = await this.client.publishCast({
        signerUuid: this.signerUuid,
        text: msg,
      });

      this.logger.debug(`Response: ${JSON.stringify(response)}`);

      return response;
    } catch (err) {
      this.logger.error('Error publishing cast:', err);
    }
  }

  getClient(): NeynarAPIClient {
    return this.client;
  }
}

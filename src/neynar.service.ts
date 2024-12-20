import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { Cast, PostCastResponse } from '@neynar/nodejs-sdk/build/api';
import { createHmac } from 'crypto';

export interface HookDataDto {
  created_at: number;
  type: 'cast.created';
  data: Cast;
}

@Injectable()
export class NeynarService {
  private readonly logger = new Logger(NeynarService.name);
  private readonly client: NeynarAPIClient;
  private signerUuid: string;
  private webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('NEYNAR_API_KEY');
    this.signerUuid = this.configService.get<string>('SIGNER_UUID');
    this.webhookSecret = this.configService.get<string>(
      'NEYNAR_WEBHOOK_SECRET',
    );
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

  async publishReply(
    msg: string,
    parentHash: string,
  ): Promise<PostCastResponse> {
    try {
      this.logger.debug(`Publishing reply message: ${msg}`);

      const response = await this.client.publishCast({
        signerUuid: this.signerUuid,
        text: msg,
        parent: parentHash,
      });

      this.logger.debug(`Response: ${JSON.stringify(response)}`);

      return response;
    } catch (err) {
      this.logger.error('Error publishing reply:', err);
    }
  }

  async generateHookData(body: any, sig: any): Promise<HookDataDto> {
    const hmac = createHmac('sha512', this.webhookSecret);
    hmac.update(body);
    const generatedSignature = hmac.digest('hex');

    const isValid = generatedSignature === sig;

    if (!sig) {
      this.logger.error('Neynar signature missing from request headers');
    }

    if (!isValid) {
      this.logger.error('Invalid webhook signature');
    }

    const hookData: HookDataDto = JSON.parse(body) as {
      created_at: number;
      type: 'cast.created';
      data: Cast;
    };
    return hookData;
  }

  getClient(): NeynarAPIClient {
    return this.client;
  }
}

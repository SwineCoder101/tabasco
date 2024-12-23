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
    const apiKey = this.configService.get<string>('neynar.apiKey');
    this.signerUuid = this.configService.get<string>('signerUuid');
    this.webhookSecret = this.configService.get<string>('neynar.webhookSecret');
    this.logger.debug(`Signer UUID: ${this.signerUuid}`);
    this.logger.debug(`Webhook Secret: ${this.webhookSecret}`);
    this.logger.debug(`API Key: ${apiKey}`);

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
      throw err;
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
      throw err;
    }
  }

  async generateHookData(body: any, sig: any): Promise<HookDataDto> {
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body); // Ensure body is a string
    this.logger.debug(`Body: ${bodyString}`);

    const hmac = createHmac('sha512', this.webhookSecret);
    hmac.update(bodyString); // Use the stringified body
    const generatedSignature = hmac.digest('hex');

    const isValid = generatedSignature === sig;

    if (!sig) {
      this.logger.error('Neynar signature missing from request headers');
      throw new Error('Neynar signature missing from request headers');
    }

    if (!isValid) {
      this.logger.error('Invalid webhook signature');
      throw new Error('Invalid webhook signature');
    }

    const hookData: HookDataDto = JSON.parse(bodyString) as HookDataDto;
    return hookData;
  }

  getClient(): NeynarAPIClient {
    return this.client;
  }
}

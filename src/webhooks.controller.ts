import {
  Controller,
  Post,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { Cast } from '@neynar/nodejs-sdk/build/api';
import { AIService } from './ai.service';
import neynarClient from './config/neynarClient';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AIService,
  ) {}

  @Post('reply')
  async handleReply(@Req() req: Request, @Res() res: Response) {
    try {
      const body = req.body;

      const webhookSecret = this.configService.get<string>(
        'NEYNAR_WEBHOOK_SECRET',
      );
      const signerUuid = this.configService.get<string>('SIGNER_UUID');
      const neynarApiKey = this.configService.get<string>('NEYNAR_API_KEY');

      if (!signerUuid || !neynarApiKey || !webhookSecret) {
        throw new HttpException(
          'Make sure you set SIGNER_UUID, NEYNAR_API_KEY, and NEYNAR_WEBHOOK_SECRET in your .env file',
          HttpStatus.BAD_REQUEST,
        );
      }

      const sig = req.headers['x-neynar-signature'] as string;
      if (!sig) {
        throw new HttpException(
          'Neynar signature missing from request headers',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hmac = createHmac('sha512', webhookSecret);
      hmac.update(JSON.stringify(body));
      const generatedSignature = hmac.digest('hex');

      const isValid = generatedSignature === sig;
      if (!isValid) {
        throw new HttpException(
          'Invalid webhook signature',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hookData = body as {
        created_at: number;
        type: 'cast.created';
        data: Cast;
      };

      const text = await this.aiService.generateAIResponse(hookData.data);

      const reply = await neynarClient.publishCast({
        signerUuid,
        text,
        parent: hookData.data.hash,
      });

      console.log('reply:', reply);

      return res.json({
        message: reply,
      });
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

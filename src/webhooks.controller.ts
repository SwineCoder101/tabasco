import {
  Controller,
  Post,
  Req,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AIService } from './ai.service';
import { NeynarService } from './neynar.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly aiService: AIService,
    private readonly neynarService: NeynarService,
  ) {}

  @Post('reply')
  async handleReply(@Req() req: Request, @Res() res: Response) {
    try {
      const body = req.body;
      const sig = req.headers['x-neynar-signature'] as string;

      this.logger.debug('Recevied webhook event:', body);
      this.logger.debug(`typeof body: ${typeof body}`);

      if (!sig) {
        throw new HttpException(
          'Neynar signature missing from request headers',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hookData = await this.neynarService.generateHookData(body, sig);

      const text = await this.aiService.generateAIResponse(hookData.data);

      // const reply = await this.neynarService.publishReply(
      //   text,
      //   hookData.data.hash,
      // );

      // this.logger.log('reply:', reply);

      return res.json({
        message: '',
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

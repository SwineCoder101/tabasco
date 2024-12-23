import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AIService } from './ai.service';
import { NeynarService } from './neynar.service';
import { OpenAIService } from './openai.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    private readonly aiService: AIService,
    private readonly neynarService: NeynarService,
    private readonly openAIService: OpenAIService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const body = req.body;
      const sig = req.headers['x-neynar-signature'] as string;

      this.logger.debug('Recevied webhook event:', body);

      if (!sig) {
        throw new HttpException(
          'Neynar signature missing from request headers',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hookData = await this.neynarService.generateHookData(body, sig);

      // const text = await this.aiService.generateAIResponse(hookData.data);
      const { name, symbol, description } =
        await this.openAIService.getAIResponse(hookData.data.text);

      this.logger.debug(`Creating token: ${name} (${symbol})`);
      this.logger.debug(`Description: ${description}`);

      const reply = await this.neynarService.publishReply(
        description,
        hookData.data.hash,
      );

      this.logger.debug('reply:', reply);

      return res.json();
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

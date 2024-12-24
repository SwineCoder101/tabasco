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
import { TokenService } from './token.service';
import { SolanaOrcaService } from './orca.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    private readonly aiService: AIService,
    private readonly neynarService: NeynarService,
    private readonly openAIService: OpenAIService,
    private readonly tokenService: TokenService,
    private readonly orcaService: SolanaOrcaService,
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

      const { name, symbol, description } =
        await this.aiService.generateAIResponse(hookData.data);
      // const { name, symbol, description } =
      //   await this.openAIService.getAIResponse(hookData.data.text);

      this.logger.debug(`Creating token: ${name} (${symbol})`);
      this.logger.debug(`Description: ${description}`);

      await this.initializeTokenWithPool(name, symbol);

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

  private async initializeTokenWithPool(name: string, symbol: string) {
    const { mint } = await this.tokenService.createTokenMintAccount(
      name,
      symbol,
      'https://idylufmhksp63vptfnctn2qcjphffwwryc5cbw4wd2xnyiqzf3ga.arweave.net/QPC6FYdUn-3V8ytFNuoCS85S2tHAuiDblh6u3CIZLsw',
    );

    const tokenMintOne = 'So11111111111111111111111111111111111111112';
    const tokenMintTwo = mint.address.toString();
    const tickSpacing = 64;
    const initialPrice = 1000000000000000;
    const poolAddress = await this.orcaService.createPool(
      tokenMintOne,
      tokenMintTwo,
      tickSpacing,
      initialPrice,
    );
    this.logger.log(`Pool created at: ${poolAddress}`);

    await this.orcaService.createPosition(poolAddress, {
      tokenB: 1_000_000_000n,
    });

    //https://explorer.solana.com/address/Eko4LyGFRP38bsuCtGQZgDvLXWYTnBbT2PdrdPfpFm3N/tokens?cluster=devnet
    const explorerUrlForPool = `https://explorer.solana.com/address/${poolAddress}/tokens?cluster=devnet`;

    return explorerUrlForPool;
  }
}

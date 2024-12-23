import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SolanaAgentKit, createSolanaTools } from 'solana-agent-kit';

@Injectable()
export class SolanaAgentKitService {
  private readonly logger = new Logger(SolanaAgentKitService.name);
  private readonly agent: SolanaAgentKit;
  private readonly tools: ReturnType<typeof createSolanaTools>;

  constructor(private readonly configService: ConfigService) {
    const privateKey = this.configService.get<string>('SOLANA_PRIVATE_KEY');
    const rpcUrl = this.configService.get<string>('RPC_URL');
    const openAiApiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!privateKey || !rpcUrl || !openAiApiKey) {
      throw new Error(
        'Make sure you set SOLANA_PRIVATE_KEY, RPC_URL, and OPENAI_API_KEY in your .env file',
      );
    }

    this.agent = new SolanaAgentKit(privateKey, rpcUrl, openAiApiKey);
    this.tools = createSolanaTools(this.agent);
  }

  async deployToken(
    name: string,
    uri: string,
    symbol: string,
    decimals: number,
    initialSupply: number,
  ): Promise<string> {
    try {
      this.logger.debug(
        `Deploying token with name: ${name}, symbol: ${symbol}, decimals: ${decimals}, initialSupply: ${initialSupply}`,
      );

      //   const result = await this.agent.deployToken(
      //     name,
      //     uri,
      //     symbol,
      //     decimals,
      //     initialSupply,
      //   );

      //   this.logger.debug(`Token Mint Address: ${result.mint.toString()}`);
      //   return result.mint.toString();
      return '';
    } catch (err) {
      this.logger.error('Error deploying token:', err);
      throw err;
    }
  }
}

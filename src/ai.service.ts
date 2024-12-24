import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { Cast } from '@neynar/nodejs-sdk/build/api';
import { AIResponse, getPrompt } from './config/neynarClient';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly basePrompt: string;
  private readonly model: any;

  constructor(private readonly configService: ConfigService) {
    // const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    const anthropicApiKey = this.configService.get<string>('anthropicApiKey');
    this.logger.debug(`Anthropic API Key: ${anthropicApiKey}`);

    const anthropic = createAnthropic({
      apiKey: anthropicApiKey,
    });

    this.model = anthropic('claude-3-5-sonnet-20241022');
  }

  async generateAIResponse(cast: Cast): Promise<AIResponse> {
    const tools = {};
    const prompt = getPrompt(cast.text);

    try {
      const { text: aiResponse } = await generateText({
        model: this.model,
        prompt,
        maxTokens: 300,
        maxRetries: 3,
        maxSteps: 2,
        tools: tools,
      });

      this.logger.debug(`Generated response: ${aiResponse}`);
      const response = JSON.parse(aiResponse);
      this.logger.debug(`Parsed response: ${JSON.stringify(response)}`);

      return response;
    } catch (err) {
      this.logger.error('Error generating AI response:', err);
      //   const { text: aiResponse } = await generateText({
      //     model: this.model,
      //     prompt: `
      //     ${this.basePrompt}

      //     Rewrite this error message so the user can understand it: ${err}`,
      //     maxTokens: 300,
      //     maxRetries: 3,
      //     maxSteps: 2,
      //   });

      const mockToken = {
        name: 'Funny Tree',
        symbol: 'FTree',
        description:
          'This is a funny tree depicts the nature of life, with laughter and joy, and a little bit of shade, too.',
      };

      return mockToken;
    }
  }
}

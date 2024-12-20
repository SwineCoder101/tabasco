import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { Cast } from '@neynar/nodejs-sdk/build/api';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly basePrompt: string;
  private readonly model: any;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    this.basePrompt = `
    This is a template.
    You should add some prompts here for the bot.
    REPLACE ME.
    `;

    const anthropic = createAnthropic({
      apiKey: apiKey,
    });

    this.model = anthropic('claude-3-5-sonnet-20241022');
  }

  async generateAIResponse(cast: Cast): Promise<string> {
    const tools = {};

    try {
      const { text: aiResponse } = await generateText({
        model: this.model,
        prompt: `
        ${this.basePrompt}

        User message:
        ${cast.text}
        `,
        maxTokens: 300,
        maxRetries: 3,
        maxSteps: 2,
        tools: tools,
      });

      return aiResponse;
    } catch (err) {
      this.logger.error('Error generating AI response:', err);
      const { text: aiResponse } = await generateText({
        model: this.model,
        prompt: `
        ${this.basePrompt}

        Rewrite this error message so the user can understand it: ${err}`,
        maxTokens: 300,
        maxRetries: 3,
        maxSteps: 2,
      });

      return aiResponse;
    }
  }
}

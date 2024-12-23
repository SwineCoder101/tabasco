import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('openaiAPIKey');

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async createCompletion(prompt: string): Promise<string> {
    try {
      this.logger.debug(`Creating completion for prompt: ${prompt}`);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      });

      const result = completion.choices[0].message.content;
      this.logger.debug(`Completion result: ${result}`);
      return result;
    } catch (err) {
      this.logger.error('Error creating completion:', err);
      throw err;
    }
  }

  async getAIResponse(
    message: string,
  ): Promise<{ name: string; symbol: string; description: string }> {
    try {
      this.logger.debug(`Parsing message: ${message}`);

      // Use OpenAI to extract token details and create a description
      const prompt = `
        Extract the name and ticker symbol for a token from the following message:
        "${message}"
        Then create a short, fun description or promotional message for this token. Respond in JSON format as:
        {
          "name": "Token Name",
          "symbol": "Ticker Symbol",
          "description": "Short promotional message"
        }
      `;

      const completion = await this.createCompletion(prompt);

      // Parse JSON response
      const response = JSON.parse(completion);
      this.logger.debug(`Parsed response: ${JSON.stringify(response)}`);

      return response;
    } catch (err) {
      this.logger.error('Error in getAIResponse:', err);
      throw err;
    }
  }
}

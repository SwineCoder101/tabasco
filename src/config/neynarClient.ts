import { NeynarAPIClient } from '@neynar/nodejs-sdk';

if (!process.env.NEYNAR_API_KEY) {
  throw new Error('Make sure you set NEYNAR_API_KEY in your .env file');
}

const neynarClient = new NeynarAPIClient({
  apiKey: process.env.NEYNAR_API_KEY,
});

export default neynarClient;

export const getPrompt = (message: string) => {
  return `
Extract the name and ticker symbol for a token from the following message:
"${message}"
Then create a short, fun description or promotional message for this token. Respond in JSON format as:
{
  "name": "Token Name",
  "symbol": "Ticker Symbol",
  "description": "Short promotional message"
}
`;
};

export interface AIResponse {
  name: string;
  symbol: string;
  description: string;
}

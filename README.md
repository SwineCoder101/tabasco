# Tabasco - Farcaster Bot

Tabasco is a decentralized application (dApp) built on Solana with Farcaster integrations, leveraging concentrated liquidity pools using the Orca Whirlpools SDK. The project integrates advanced blockchain technologies with AI-driven user interactions to promote meme coins and enable seamless DeFi transactions. This is a NestJS-based project with a focus on scalability, performance, and developer-friendly architecture.

---

## Features

- **Concentrated Liquidity Management**: Utilize Orca Whirlpools to create and manage concentrated liquidity pools for efficient trading.
- **Token-2022 Extensions**: Support for Solana’s Token-2022 standard, enabling advanced token functionalities.
- **AI-Driven Cast Responses**: Use Anthropic AI to process user-generated casts (posts) and generate insightful promotional concepts for meme coins.
- **Integration with Farcaster**: Incorporates Neynar SDK to interact with Farcaster’s decentralized social network.
- **Future Enhancements**: Development of a character-driven AI agent inspired by Eliza AI for engaging user experiences.

---

## Technologies Used

### Core Framework
- **[NestJS](https://nestjs.com/)**: A progressive Node.js framework for building scalable server-side applications.

### Blockchain Tools
- **[@solana/web3.js](https://github.com/solana-labs/solana-web3.js)**: Solana’s core library for interacting with the blockchain.
- **[@orca-so/whirlpools](https://orca-so.gitbook.io/whirlpools/)**: SDK for managing concentrated liquidity pools on Solana.
- **[@solana-program/token](https://github.com/solana-labs/solana-program-library)**: Solana’s standard token library.
- **[@solana-program/token-2022](https://github.com/solana-labs/solana-program-library/tree/master/token-2022)**: Extensions for advanced token functionalities like transfer fees.

### AI Integration
- **[@ai-sdk/anthropic](https://anthropic.com/)**: Anthropic’s AI SDK used to process Farcaster casts and generate promotional content.
- **AI Character Development**: Inspired by Eliza AI, future enhancements will include creating a conversational agent to interact with users creatively.

### Farcaster Integration
- **[@neynar/nodejs-sdk](https://neynar.com/)**: SDK for interacting with Farcaster, a decentralized social network.

### Media Storage
- **[@pinata/sdk](https://pinata.cloud/)**: SDK for managing IPFS-based media storage.

### Infrastructure
- **[Railway](https://railway.app/)**: Cloud deployment platform for running the application’s backend infrastructure.

---

## Project Architecture
![image](https://github.com/user-attachments/assets/d03a7b3d-f4d0-440e-80d7-5f1149b5237a)

### Infrastructure
The backend is deployed on **Railway**, ensuring a scalable and reliable environment. The application is designed for high throughput and optimized for Solana’s low-latency blockchain.

### AI Workflow
1. Users create casts on Farcaster.
2. The casts are fetched using **Neynar SDK**.
3. Anthropic AI processes the cast as a prompt and generates responses to promote meme coins.
4. Future updates will include an interactive AI agent with a defined character inspired by **Eliza AI**.

---

## Prerequisites

- **Node.js**: Version `>20`. Ensure your environment meets this requirement.
- **Solana CLI**: For blockchain interactions (optional but recommended).
- **Farcaster Account**: To create and fetch casts for interaction.

---

## Getting Started

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/SwineCoder101/tabasco.git
   cd tabasco
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` and update the required variables, including Solana RPC URLs, Farcaster API keys, and Railway configurations.

### Scripts
- **Development**:
  ```bash
  npm run start:dev
  ```
- **Build**:
  ```bash
  npm run build
  ```
- **Linting**:
  ```bash
  npm run lint
  ```
- **Testing**:
  ```bash
  npm run test
  ```

---

## Usage

1. **Creating a Whirlpool**:
   - Use the integrated **Orca SDK** to create concentrated liquidity pools for specific token pairs.

2. **Managing Token-2022 Extensions**:
   - The application supports advanced token features like transfer fees and non-transferable tokens.

3. **AI-Driven Cast Analysis**:
   - Process casts fetched from Farcaster through Anthropic AI to generate promotional strategies for meme coins.

4. **Future AI Enhancements**:
   - Integrate an Eliza-inspired character to engage with users interactively.

---

## Future Enhancements

- **AI Character Interaction**: Develop a conversational AI inspired by Eliza to provide a unique user experience.
- **Additional Token Features**: Leverage more functionalities of Token-2022 extensions.
- **Enhanced Analytics**: Add advanced metrics for analyzing liquidity pools and user interactions.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


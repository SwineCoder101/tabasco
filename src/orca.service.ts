import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createConcentratedLiquidityPoolInstructions,
  fetchWhirlpoolsByTokenPair,
  openFullRangePositionInstructions,
  setDefaultFunder,
  setWhirlpoolsConfig,
} from '@orca-so/whirlpools';
import {
  address,
  appendTransactionMessageInstructions,
  createTransactionMessage,
  IInstruction,
  KeyPairSigner,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from '@solana/web3.js';
import { Client } from './util/spl';

@Injectable()
export class SolanaOrcaService {
  private readonly logger = new Logger(SolanaOrcaService.name);

  private client: Client;
  private authority: KeyPairSigner;

  constructor(private configService: ConfigService) {
    this.client = configService.get<Client>('solClient');
    this.authority = configService.get<KeyPairSigner>('authorityWallet');
    this.logger.log(
      `Using authority: ${this.authority.address} to create Orca pools`,
    );
    this.initialize();
  }

  async initialize() {
    this.logger.debug(`Setting whirlpools config to solanaDevnet`);
    await setWhirlpoolsConfig('solanaDevnet');
    setDefaultFunder(this.authority);
  }

  async createPool(
    tokenMintOne: string,
    tokenMintTwo: string,
    tickSpacing: number,
    initialPrice: number,
  ) {
    const { poolAddress, instructions, initializationCost } =
      await createConcentratedLiquidityPoolInstructions(
        this.client.rpc,
        address(tokenMintOne),
        address(tokenMintTwo),
        tickSpacing,
        initialPrice,
        this.authority,
      );

    this.logger.debug(`Creating Orca pool with the following parameters:`);
    this.logger.debug(`Token Mint One: ${tokenMintOne}`);
    this.logger.debug(`Token Mint Two: ${tokenMintTwo}`);
    this.logger.debug(`Tick Spacing: ${tickSpacing}`);
    this.logger.debug(`Initial Price: ${initialPrice}`);

    this.logger.log(`Pool address: ${poolAddress}`);
    this.logger.log(`Initialization cost: ${initializationCost}`);

    await this.executeInstructions(instructions);
    return poolAddress;
  }

  async fetchWhirlpool(tokenMintOne: string, tokenMintTwo: string) {
    const pools = await fetchWhirlpoolsByTokenPair(
      this.client.rpc,
      address(tokenMintOne),
      address(tokenMintTwo),
    );
    const initializedPool = pools.find((pool) => pool.initialized);
    return initializedPool?.address.toString();
  }

  async getInitializedPool(tokenMintOne: string, tokenMintTwo: string) {
    const pools = await fetchWhirlpoolsByTokenPair(
      this.client.rpc,
      address(tokenMintOne),
      address(tokenMintTwo),
    );
    return pools.find((pool) => pool.initialized)?.address.toString();
  }

  async createPosition(whirlpoolAddress: string, param: any) {
    const lowerBound = 0.0000001; // Example lower bound
    const upperBound = 1.0; // Example upper bound
    const slippage = 0; // Example slippage
    this.logger.debug(`Creating position with the following parameters:`);
    this.logger.debug(`Whirlpool Address: ${whirlpoolAddress}`);
    this.logger.debug(`Lower Bound: ${lowerBound}`);
    this.logger.debug(`Upper Bound: ${upperBound}`);
    this.logger.debug(`Slippage: 100`);

    try {
      const { quote, instructions, positionMint, initializationCost } =
        await openFullRangePositionInstructions(
          this.client.rpc,
          address(whirlpoolAddress),
          param,
          slippage,
          this.authority,
        );
      this.logger.debug(`initializationCost: ${initializationCost}`);
      this.logger.debug(`Quote token max B: ${quote.tokenEstB}`);
      this.logger.debug(`Quote token max A: ${quote.tokenEstA}`);
      this.logger.log(`Created Position Mint: ${positionMint}`);
      await this.executeInstructions(instructions);
      return positionMint;
    } catch (error) {
      this.logger.error(`Error creating position: ${error}`);
      throw error;
    }
  }

  private async executeInstructions(instructions: IInstruction<string>[]) {
    try {
      const { value: latestBlockhash } = await this.client.rpc
        .getLatestBlockhash()
        .send();
      const txMessage = pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayerSigner(this.authority, tx),
        (tx) => appendTransactionMessageInstructions(instructions, tx),
        (tx) =>
          setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      );

      const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
        rpc: this.client.rpc,
        rpcSubscriptions: this.client.rpcSubscriptions,
      });

      const signedTx = await signTransactionMessageWithSigners(txMessage);
      const confirmedTx = await sendAndConfirmTransaction(signedTx, {
        commitment: 'confirmed',
      });
      this.logger.log(`Sent transaction: ${confirmedTx}`);

      return confirmedTx;
    } catch (error) {
      this.logger.error(`Transaction execution error: ${error}`);
      throw error;
    }
  }
}

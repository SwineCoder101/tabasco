import {
  createConcentratedLiquidityPoolInstructions,
  fetchWhirlpoolsByTokenPair,
  openPositionInstructions,
  setDefaultFunder,
  setWhirlpoolsConfig,
} from '@orca-so/whirlpools';
import {
  address,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  devnet,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayerSigner,
  appendTransactionMessageInstructions,
  sendAndConfirmTransactionFactory,
  createSolanaRpcSubscriptions,
  signTransactionMessageWithSigners,
  setTransactionMessageLifetimeUsingBlockhash,
  IInstruction,
} from '@solana/web3.js';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class SolanaOrcaService {
  private devnetRpc = createSolanaRpc(devnet('https://api.devnet.solana.com'));
  private wssProvider = 'wss://api.devnet.solana.com/';
  private rpcSubscriptions = createSolanaRpcSubscriptions(this.wssProvider);
  private wallet: any;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    const keypairPath = 'solana-wallet/keypair.json';
    this.wallet = await this.createWallet(keypairPath);
    setDefaultFunder(this.wallet);
    await setWhirlpoolsConfig('solanaDevnet');
  }

  private async createWallet(keypairPath: string) {
    const keyPairBytes = new Uint8Array(
      JSON.parse(fs.readFileSync(keypairPath, 'utf8')),
    );
    return await createKeyPairSignerFromBytes(keyPairBytes);
  }

  async createPool(
    tokenMintOne: string,
    tokenMintTwo: string,
    tickSpacing: number,
    initialPrice: number,
  ) {
    const { poolAddress, instructions, initializationCost } =
      await createConcentratedLiquidityPoolInstructions(
        this.devnetRpc,
        address(tokenMintOne),
        address(tokenMintTwo),
        tickSpacing,
        initialPrice,
        this.wallet,
      );

    console.log('Pool address:', poolAddress);
    console.log('Initialization cost:', initializationCost);

    await this.executeInstructions(instructions);
    return poolAddress;
  }

  async fetchWhirlpool(tokenMintOne: string, tokenMintTwo: string) {
    const pools = await fetchWhirlpoolsByTokenPair(
      this.devnetRpc,
      address(tokenMintOne),
      address(tokenMintTwo),
    );
    const initializedPool = pools.find((pool) => pool.initialized);
    return initializedPool?.address.toString();
  }

  async createPosition(whirlpoolAddress: string, param: any) {
    const lowerBound = 0.0001; // Example lower bound
    const upperBound = 0.0005; // Example upper bound

    const { instructions, positionMint } = await openPositionInstructions(
      this.devnetRpc,
      address(whirlpoolAddress),
      param,
      lowerBound,
      upperBound,
      100,
      this.wallet,
    );

    console.log('Position mint:', positionMint);
    await this.executeInstructions(instructions);
    return positionMint;
  }

  private async executeInstructions(instructions: IInstruction<string>[]) {
    try {
      const { value: latestBlockhash } = await this.devnetRpc
        .getLatestBlockhash()
        .send();
      const txMessage = pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayerSigner(this.wallet, tx),
        (tx) => appendTransactionMessageInstructions(instructions, tx),
        (tx) =>
          setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      );

      const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
        rpc: this.devnetRpc,
        rpcSubscriptions: this.rpcSubscriptions,
      });

      const signedTx = await signTransactionMessageWithSigners(txMessage);
      const confirmedTx = await sendAndConfirmTransaction(signedTx, {
        commitment: 'confirmed',
      });
      console.log('Sent transaction:', confirmedTx);

      return confirmedTx;
    } catch (error) {
      console.error('Transaction execution error:', error);
      throw error;
    }
  }
}

// Here we export some useful types and functions for interacting with the Anchor program.
import { Cluster, PublicKey } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import type { Squares } from '../target/types/squares';
import { IDL as SquaresIDL } from '../target/types/squares';

// Re-export the generated IDL and type
export { Squares, SquaresIDL };
export type SquaresProgram = Program<Squares>;

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const SQUARES_PROGRAM_ID = new PublicKey(
  '8B9VcQmn65FYQmWjEvmyEL2D2CiMr2oacoaQstmVuXWV'
);

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getSquaresProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
      // You only need to update this if you deploy your program on one of these clusters.
      return SQUARES_PROGRAM_ID;
    default:
      return SQUARES_PROGRAM_ID;
  }
}

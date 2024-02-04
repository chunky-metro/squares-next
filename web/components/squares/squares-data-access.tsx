'use client'


import { SquaresIDL, getSquaresProgramId } from '@squares-next/anchor';
import { Program, BN } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
  Transaction,
  Cluster,
  Keypair
} from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

export function useSquaresProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const provider = useAnchorProvider();
  const programId = useMemo(() => getSquaresProgramId('devnet'), []); // Adjust 'mainnet-beta' to your actual cluster/network

  const program = new Program(SquaresIDL, programId, provider);

  const createGame = useMutation({
    mutationKey: ['football_squares', 'createGame'],
    mutationFn: async () => {
      if (!wallet.publicKey) throw new Error('Wallet not connected');

      const gameAccount = Keypair.generate();
      const gameAccountPublicKey = gameAccount.publicKey;
      const costPerSquare = new BN(1000); // Ensure this matches the expected type in your program

      try {
        // Note: Adjust the .accounts({}) and .signers([]) according to your actual program requirements
        await program.rpc.createGame(costPerSquare, {
          accounts: {
            game: gameAccountPublicKey,
            user: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [gameAccount],
        });

        toast.success(`Game created: ${gameAccountPublicKey.toString()}`);
        window.location.href = `/games/${gameAccountPublicKey.toString()}`;
      } catch (error) {
        console.error('Failed to create game:', error);
        toast.error('Failed to create game');
      }
    },
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account'],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  return { program, createGame, getProgramAccount };
}

export function useAllGames() {
  const { program } = useSquaresProgram();
  const games = useQuery({
    queryKey: ['football_squares', 'all'],
    queryFn: () => program.account.game.all(),
  });

  return { games };
}


export function useGetGameState({ game }: { game: PublicKey }) {
  const { program } = useSquaresProgram();
  // Query for game state

  const gameState = useQuery({
    queryKey: ['football_squares', 'fetch', game.toBase58()],
    queryFn: () => program.account.game.fetch(game),
  });

  return { gameState, refetch: gameState.refetch };
}

export function usePurchaseSquare({ game }: { game: PublicKey }) {
  const { program } = useSquaresProgram();
  const transactionToast = useTransactionToast();
  const wallet = useWallet();

  const buySquare = useMutation({
    mutationKey: ['football_squares', 'buySquare', { game }],
    mutationFn: (squareIds: Uint8Array) => {
      console.log("Square IDs:", squareIds);
      return program.rpc.purchaseSquare(Buffer.from(squareIds), {
        accounts: {
          game: game,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
    },
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: (error) => {
      console.error('Failed to buy square:', error);
      toast.error('Failed to buy square');
    },  });

  return {
    buySquare,
  };
}

export function useFinalizeGame({ game }: { game: PublicKey }) {
  const { program } = useSquaresProgram();
  const transactionToast = useTransactionToast();
  const wallet = useWallet();

  const finalizeGame = useMutation({
    mutationKey: ['football_squares', 'finalizeGame', { game }],
    mutationFn: () => {
      return program.rpc.finalizeGame({
        accounts: {
          game: game,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      refetch(); // Add this line
    },
    onError: (error) => {
      console.error('Failed to finalize game:', error);
      toast.error('Failed to finalize game');
    },
  });

  return finalizeGame;
}


// export function useSquaresProgramAccount({ game }: { game: PublicKey }) {
//   // Similar to useCounterProgramAccount but for Squares
//   const { cluster } = useCluster();
//   const transactionToast = useTransactionToast();
//   const { program } = useSquaresProgram();

//   // Method for buying squares
//   const buySquare = useMutation({
//     mutationKey: ['football_squares', 'buySquare', { cluster, game }],
//     mutationFn: (squareIds: Buffer) =>
//       program.methods
//         .purchaseSquare(squareIds) // Ensure this matches the expected type in your program
//         .accounts({ game })
//         .rpc(),
//     onSuccess: (signature) => {
//       transactionToast(signature);
//     },
//     onError: () => toast.error('Failed to buy square'),
//   });

//   return {
//     buySquare,
//   };
// }

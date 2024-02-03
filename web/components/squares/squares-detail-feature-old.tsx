import { SquaresIDL, getSquaresProgramId } from '@squares/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

export function useDisplayBoard(id: string) {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getSquaresProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = new Program(SquaresIDL, programId, provider);

  const gameAccount = useQuery({
    queryKey: ['game', 'state', { cluster }],
    queryFn: () => program.account.Game.fetch(new PublicKey(id)),
  });

  return {
    gameAccount,
  };
}

export function useBuySquare(id: string) {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getSquaresProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = new Program(SquaresIDL, programId, provider);

  const buySquare = useMutation({
    mutationKey: ['game', 'buySquare', { cluster }],
    mutationFn: (squareId: number) =>
      program.methods
        .buySquare(squareId)
        .accounts({ game: new PublicKey(id), buyer: wallet.publicKey })
        .signers([wallet])
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return gameAccount.refetch();
    },
    onError: () => toast.error('Failed to buy square'),
  });

  return {
    buySquare,
  };
}

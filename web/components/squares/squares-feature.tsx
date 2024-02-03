'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useSquaresProgram } from './squares-data-access';
import { SquaresCreate, SquaresGrid } from './squares-ui';
//import React, { useEffect } from 'react';
//import { useRouter } from 'next/router';


export default function SquaresFeature() {
  const { publicKey } = useWallet();
  const { programId, createGame } = useSquaresProgram();

  // useEffect(() => {
  //   if (createGame.isSuccess) {
  //     router.push(`/games/${createGame.data.toString()}`);
  //   }
  // }, [createGame.isSuccess, createGame.data]);

  return publicKey ? (
    <div>
      <AppHero
        title="Squares"
        subtitle={
          'You can create a new game of Squares by clicking the "Create" button. The state of the game is stored on-chain.'
        }
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <SquaresCreate />
      </AppHero>
      <SquaresGrid />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}

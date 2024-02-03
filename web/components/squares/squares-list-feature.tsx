'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useSquaresProgram, useAllGames } from './squares-data-access';
import { SquaresCreate, SquaresList } from './squares-ui';

export default function SquaresListFeature() {
  const { publicKey } = useWallet();
  const { programId } = useSquaresProgram();
  const { gamesData } = useAllGames();



  return (
    <div>
      {publicKey ? (
        <>
          <AppHero
            title="Squares"
            subtitle={
              'You can create a new game of Squares by clicking the "Create" button. The state of the game is stored on-chain.'
            }
          >
            <SquaresCreate />
          </AppHero>
          <div className="games-list">
            {gamesData?.map((game) => (
              <div key={game.publicKey.toBase58()} className="game-item">
                <ExplorerLink address={game.publicKey.toBase58()} />
                {/* Render additional game details here */}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="hero py-[64px]">
            <div className="hero-content text-center">
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
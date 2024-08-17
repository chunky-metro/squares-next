'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useAllGames } from './squares-data-access';
import { SquaresCreate } from './squares-ui';
import { WalletButton } from '../solana/solana-provider';

export default function SquaresListFeature() {
  const { connected } = useWallet();
  const gamesData = useAllGames();

  return (
    <div>
      <AppHero
        title="Squares"
        subtitle={
          'View all available games or create a new one.'
        }
      >
        {connected ? <SquaresCreate /> : <WalletButton />}
      </AppHero>
      <div className="games-list flex flex-wrap justify-center">
        {gamesData?.games?.data?.map((game) => (
          <div key={game.publicKey.toBase58()} className="w-full md:w-1/2 lg:w-1/3 p-4">
            <a href={`/games/${game.publicKey.toBase58()}`} className="block">
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold mb-2">Game #{game.publicKey.toBase58().slice(0, 8)}</h2>
                <ExplorerLink path={`address/${game.publicKey.toBase58()}`} label={ellipsify(game.publicKey.toBase58())} />
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
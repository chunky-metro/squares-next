'use client'

import { useRouter } from 'next/router';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { PublicKey } from '@solana/web3.js';
import { useGetGameState } from './squares-data-access'; // Adjust this path as necessary
import SquaresGrid from './SquaresGrid'; // Adjust this path as necessary
import { usePurchaseSquare, useFinalizeGame } from './squares-data-access'; // Adjust this path as necessary
import BoxScoreHeader from './BoxScoreHeader'; // Adjust this path as necessary

export default function SquaresDetailFeature() {
  const params = useParams();
  const [purchaseStatus, setPurchaseStatus] = useState(false);

  console.log("Game address:", params.address);

  const gamePublicKey = useMemo(() => new PublicKey(params.address), [params.address]);
  const { buySquare } = usePurchaseSquare({ game: gamePublicKey });

  // Use the hook to get the game state
  const { gameState, refetch } = useGetGameState({ game: gamePublicKey });

  useEffect(() => {
    if (!gamePublicKey) {
      console.error("Invalid game address.");
      return;
    }

    // Here gameState query automatically fetches the game state because of its setup in useSquaresProgramAccount hook
    // So, ensure the queryKey includes the gamePublicKey to refetch when the address changes
  }, [gamePublicKey, gameState]);

  useEffect(() => {
    if (purchaseStatus) {
      refetch();
      setPurchaseStatus(false);
    }
  }, [purchaseStatus, refetch]);

  // Ensure gameState.isLoading and gameState.data are used to conditionally render the loading state or the SquaresGrid
  if (gameState.isLoading) {
    return <div>Loading game data...</div>;
  }

  if (gameState.isError) {
    console.log(gameState.error);
    return <div>Error loading game data.</div>;
  }

  return (
    <div className="flex flex-col items-stretch">
      <BoxScoreHeader />
      {gameState ? <SquaresGrid gameState={gameState} setPurchaseStatus={setPurchaseStatus} /> : <div>No game data available.</div>}
    </div>
  );
}

'use client'

import { useRouter } from 'next/router';

import React, { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { PublicKey } from '@solana/web3.js';
import { useGetGameState } from './squares-data-access'; // Adjust this path as necessary
import SquaresGrid from './SquaresGrid'; // Adjust this path as necessary

export default function SquaresDetailFeature() {
  const params = useParams();

  console.log("Game address:", params.address);

  const gamePublicKey = useMemo(() => new PublicKey(params.address), [params.address]);

  // Use the hook to get the game state
  const { gameState } = useGetGameState({ game: gamePublicKey });

  useEffect(() => {
    if (!gamePublicKey) {
      console.error("Invalid game address.");
      return;
    }

    // Here gameState query automatically fetches the game state because of its setup in useSquaresProgramAccount hook
    // So, ensure the queryKey includes the gamePublicKey to refetch when the address changes
  }, [gamePublicKey, gameState]);

  const handleCellClick = async (rowIndex, cellIndex) => {
    alert(`Cell clicked: ${rowIndex}, ${cellIndex}`);
  };

  // Ensure gameState.isLoading and gameState.data are used to conditionally render the loading state or the SquaresGrid
  if (gameState.isLoading) {
    return <div>Loading game data...</div>;
  }

  if (gameState.isError) {
    console.log(gameState.error);
    return <div>Error loading game data.</div>;
  }

  return (
    <div>
      {gameState.data ? <SquaresGrid gameState={gameState.data} handleCellClick={handleCellClick} /> : <div>No game data available.</div>}
    </div>
  );
}

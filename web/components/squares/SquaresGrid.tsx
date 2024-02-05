import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { usePurchaseSquare } from './squares-data-access';
import { PublicKey } from '@solana/web3.js';
import { ellipsify } from '../ui/ui-layout';
import { useWallet } from '@solana/wallet-adapter-react';
import { useFinalizeGame } from './squares-data-access';
import GridRow from './GridRow';
import FinalizeBoardButton from './FinalizeBoardButton';
import BuySquaresButton from './BuySquaresButton';

const SquaresGrid = ({ gameState, setPurchaseStatus }) => {
  const [selectedSquares, setSelectedSquares] = useState([]);
  const [finalizeStatus, setFinalizeStatus] = useState(false); // Add this line

  const game = new PublicKey(useParams().address);
  const purchaseSquares = usePurchaseSquare({ game }); // Pass the game object to usePurchaseSquare
  const colors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'];
  const wallet = useWallet();
  const finalizeGame = useFinalizeGame({ game });

  if (!gameState || !gameState.data) {
    return <div>Awaiting game data...</div>;
  }

  if (!wallet.publicKey) {
    return <div>Connect your wallet to play</div>;
  }

  const isBoardFilled = !gameState.data.squares.some(square => square.owner === null);
  const isCreator = gameState.data.owner.equals(wallet.publicKey);
  const isBoardFinalized = gameState.data.gameStatus.finalized;
  
  const gridSize = 10;
  const gridRows = Array.from({ length: gridSize }, (_, rowIndex) => {
    const row = gameState.data.squares.slice(rowIndex * gridSize, (rowIndex + 1) * gridSize);
    if (isBoardFinalized) {
      row.forEach((cell, cellIndex) => {
        cell.awayTeamIndex = gameState.data.awayTeamIndices[rowIndex * gridSize + cellIndex];
      });
    }
    return row;
  });

  return (
    <div className="flex flex-col items-center my-4">
      {/* Empty cell at the top left corner */}
      <div className="flex justify-center items-center mb-2">
        <div className="w-10 h-10"></div>
        <div className="flex">
          <div className="font-bold text-2xl ml-10"></div>
        </div>
      </div>
      <div className="flex">
        <div className="flex flex-col items-center">
          {/* Placeholder for "Away Team" header, adjusted position */}
          <div className="h-10"></div>
          <div className="text-2xl font-bold mr-2"></div>
        </div>
        <div>
          {/* Placeholder row for numbers, shifted to the right */}
          <div className="flex">
            <div className="w-10 h-10"></div>
            {Array.from({ length: gridSize }).map((_, index) => (
              <div key={index} className="w-10 h-10 flex justify-center items-center border border-gray-500">
                {isBoardFinalized ? gameState.data.homeTeamIndices[index] : '?'}
              </div>
            ))}
          </div>
          {gridRows.map((row, rowIndex) => (
            <GridRow key={rowIndex} row={row} rowIndex={rowIndex} selectedSquares={selectedSquares} setSelectedSquares={setSelectedSquares} colors={colors} gridSize={gridSize} gameState={gameState} />
          ))}
        </div>
      </div>
      {!isBoardFinalized && (
        isBoardFilled ? (
          <FinalizeBoardButton isCreator={isCreator} finalizeGame={finalizeGame} setFinalizeStatus={setFinalizeStatus} />
        ) : (
          <BuySquaresButton selectedSquares={selectedSquares} setSelectedSquares={setSelectedSquares} gridSize={gridSize} purchaseSquares={purchaseSquares} setPurchaseStatus={setPurchaseStatus} />
        )
      )}
    </div>
  );
};

export default SquaresGrid;
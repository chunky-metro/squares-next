import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { usePurchaseSquare } from './squares-data-access';
import { PublicKey } from '@solana/web3.js';
import { ellipsify } from '../ui/ui-layout';
import { useWallet } from '@solana/wallet-adapter-react';
import { useFinalizeGame } from './squares-data-access';

const SquaresGrid = ({ gameState, setPurchaseStatus }) => {
  const [selectedSquares, setSelectedSquares] = useState([]);
  const game = new PublicKey(useParams().address);
  const purchaseSquares = usePurchaseSquare({ game }); // Pass the game object to usePurchaseSquare
  const colors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'];
  const wallet = useWallet();
  const finalizeStatus = useFinalizeGame({ game });

  if (!gameState || !gameState.data) {
    return <div>Awaiting game data...</div>;
  }

  const isBoardFilled = !gameState.data.squares.some(square => square.owner === null);
  const isCreator = gameState.data.owner.equals(wallet.publicKey);
  const isBoardFinalized = gameState.data.gameStatus.finalized;

  const gridSize = 10;
  const gridRows = Array.from({ length: gridSize }, (_, rowIndex) =>
    gameState.data.squares.slice(rowIndex * gridSize, (rowIndex + 1) * gridSize)
  );

  return (
    <div className="flex flex-col items-center my-4">
      {/* Empty cell at the top left corner */}
      <div className="flex justify-center items-center mb-2">
        <div className="w-10 h-10"></div>
        <div className="flex">
          <div className="font-bold text-2xl ml-10">Home Team</div>
        </div>
      </div>
      <div className="flex">
        <div className="flex flex-col items-center">
          {/* Placeholder for "Away Team" header, adjusted position */}
          <div className="h-10"></div>
          <div className="text-2xl font-bold mr-2">Away Team</div>
        </div>
        <div>
          {/* Placeholder row for numbers, shifted to the right */}
          <div className="flex">
            <div className="w-10 h-10"></div>
            {Array.from({ length: gridSize }).map((_, index) => (
              <div key={index} className="w-10 h-10 flex justify-center items-center border border-gray-500">
                {isBoardFinalized ? gameState.homeTeamIndices[index] : '?'}
              </div>
            ))}
          </div>
          {gridRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              <div className="w-10 h-10 flex justify-center items-center border border-gray-500">
                {isBoardFinalized ? gameState.awayTeamIndices[rowIndex] : '?'}
              </div>
              {row.map((square, cellIndex) => {
                // Log the base58 representation and the color index calculation
                const base58Owner = square.owner?.toBase58();
                const colorIndex = base58Owner && parseInt(base58Owner.slice(0, 2), 16) % colors.length;
                base58Owner && console.log(`Owner base58: ${base58Owner}, Color index: ${colorIndex}, Color: ${colors[colorIndex]}`);
                return (
                  <div
                    key={cellIndex}
                    className={`w-10 h-10 flex justify-center items-center border border-gray-500 ${selectedSquares.some(selectedCell => selectedCell.rowIndex === rowIndex && selectedCell.cellIndex === cellIndex) ? 'bg-blue-500' : square.owner ? colors[colorIndex] : 'bg-gray-700'}`}
                    onClick={() => {
                      if (base58Owner) return;
                      const cell = { rowIndex, cellIndex };
                      if (selectedSquares.length < 10 && !selectedSquares.some(selectedCell => selectedCell.rowIndex === cell.rowIndex && selectedCell.cellIndex === cell.cellIndex)) {
                        setSelectedSquares([...selectedSquares, cell]);
                      } else {
                        setSelectedSquares(selectedSquares.filter(selectedCell => selectedCell.rowIndex !== cell.rowIndex || selectedCell.cellIndex !== cell.cellIndex));
                      }
                    }}
                  >
                    <span className="text-gray-300">{base58Owner ? base58Owner.slice(0,2): ''}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {!isBoardFinalized && (
        isBoardFilled ? (
          <button 
            className="btn btn-primary mt-4 ml-40" 
            disabled={!isCreator}
            onClick={() => {
              finalizeStatus.mutate(null, {
                onSuccess: () => {
                  setFinalizeStatus(true);
                },
              });
            }}
          >
            Finalize Board
          </button>
        ) : (
          <button
            onClick={() => {
              const flattenedSquares = selectedSquares.map(cell => cell.rowIndex * gridSize + cell.cellIndex);
              const squaresUint8Array = new Uint8Array(flattenedSquares);

              purchaseSquares.buySquare.mutate(squaresUint8Array, {
                onSuccess: () => {
                  setPurchaseStatus(true);
                  setSelectedSquares([]);
                },
              });
            }}
            className="btn btn-primary mt-4 ml-40"
          >
            Buy Squares
          </button>
        )
      )}
    </div>
  );
};

export default SquaresGrid;


import React from 'react';

const SquaresGrid = ({ gameState }) => {
  // Instead of generating numbers, use placeholders
  const homeTeamNumbers = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
  const awayTeamNumbers = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];

  if (!gameState || !gameState.squares || gameState.squares.length === 0) {
    return <div>Loading game data...</div>;
  }

  // Create a 10x10 grid for the squares
  const gridSize = 10;
  const gridRows = Array.from({ length: gridSize }, (_, rowIndex) =>
    gameState.squares.slice(rowIndex * gridSize, (rowIndex + 1) * gridSize)
  );

  return (
    <div className="flex flex-col items-center my-4">
      <div className="flex justify-center items-center mb-2">
        <div className="font-bold text-2xl">Home Team</div>
      </div>
      <div className="flex">
        <div className="text-2xl font-bold mr-2">
          <div className="transform -rotate-90">Away Team</div>
        </div>
        <div>
          <div className="flex">
            {homeTeamNumbers.map((_, index) => (
              <div key={index} className="w-10 h-10 flex justify-center items-center border border-gray-500">{/* Placeholder for number */}</div>
            ))}
          </div>
          {gridRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              <div className="w-10 h-10 flex justify-center items-center border border-gray-500">
                {awayTeamNumbers[rowIndex]} {/* Placeholder for number */}
              </div>
              {row.map((square, cellIndex) => (
                <div key={cellIndex} className="w-10 h-10 flex justify-center items-center border border-gray-500 bg-gray-700">
                  {/* Additional content like owner's initials can go here */}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SquaresGrid;

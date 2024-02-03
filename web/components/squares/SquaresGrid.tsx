import React from 'react';

const SquaresGrid = ({ gameState }) => {
  // Instead of generating numbers, use placeholders
  const homeTeamNumbers = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
  const awayTeamNumbers = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];

  if (!gameState || !gameState.data) {
    return <div>Awaiting game data...</div>;
  }

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
              <div key={index} className="w-10 h-10 flex justify-center items-center border border-gray-500">{/* Placeholder for number */}</div>
            ))}
          </div>
          {gridRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              <div className="w-10 h-10 flex justify-center items-center border border-gray-500">
                {/* Placeholder for number, aligned with "Away Team" */}
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

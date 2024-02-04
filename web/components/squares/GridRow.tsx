import React from 'react';

const GridRow = ({ row, rowIndex, selectedSquares, setSelectedSquares, colors, gridSize, gameState }) => {

  return (
    <div className="flex">
      <div className="w-10 h-10 flex justify-center items-center border border-gray-500">
        {gameState.data.gameStatus.finalized ? gameState.data.awayTeamIndices[rowIndex] : '?'}
      </div>
      {row.map((cell, cellIndex) => {
        const isSelected = selectedSquares.some(square => square.rowIndex === rowIndex && square.cellIndex === cellIndex);
        const color = cell.owner ? colors[parseInt(cell.owner.toBase58().slice(0,2), 16) % colors.length] : 'bg-gray-200';
        return (
          <div
            key={cellIndex}
            className={`w-10 h-10 flex justify-center items-center border border-gray-500 ${color} ${isSelected ? 'ring-2 ring-black' : ''}`}
            onClick={() => {
              if (cell.owner) return;
              setSelectedSquares(prev => [...prev, { rowIndex, cellIndex }]);
            }}
          >
            {cell.owner ? cell.owner.toBase58().slice(0,2) : ''}
          </div>
        );
      })}
    </div>
  );
};

export default GridRow;
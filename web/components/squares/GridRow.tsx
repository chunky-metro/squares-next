import React from 'react';

const GridRow = ({ row, rowIndex, selectedSquares, setSelectedSquares, colors, gridSize, gameState }) => {
  function parseBase58(str) {
    const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let num = 0; // Using BigInt for handling large numbers
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const value = BASE58_ALPHABET.indexOf(char);
      if (value === -1) {
        // Invalid character for base58
        return NaN;
      }
      num = num * 58 + value;
    }
    return num;
  }
  

  return (
    <div className="flex">
      <div className="w-10 h-10 flex justify-center items-center border border-gray-500">
        {gameState.data.gameStatus.finalized ? gameState.data.awayTeamIndices[rowIndex] : '?'}
      </div>
      {row.map((cell, cellIndex) => {
        const isSelected = selectedSquares.some(square => square.rowIndex === rowIndex && square.cellIndex === cellIndex);
        const color = cell.owner ? colors[parseBase58(cell.owner.toBase58().slice(0,4)) % 7] : 'bg-gray-700';
        return (
          <div
            key={cellIndex}
            className={`w-10 h-10 flex justify-center items-center border border-gray-500 ${color} ${isSelected ? 'ring-2 ring-black-900 bg-yellow-200' : ''}`}
            onClick={() => {
              if (cell.owner) return;
              const isSelected = selectedSquares.some(square => square.rowIndex === rowIndex && square.cellIndex === cellIndex);
              if (isSelected) {
                setSelectedSquares(prev => prev.filter(square => !(square.rowIndex === rowIndex && square.cellIndex === cellIndex)));
              } else {
                setSelectedSquares(prev => [...prev, { rowIndex, cellIndex }]);
              }            }}
          >
            <span className="text-white">{cell.owner ? cell.owner.toBase58().slice(0,2) : ''}</span>
          </div>
        );
      })}
    </div>
  );
};

export default GridRow;
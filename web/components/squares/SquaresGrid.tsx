import React from 'react';

const SquaresGrid = ({ gameState, handleCellClick }) => {
  // Placeholder team headers, replace with your actual logic
  const homeTeamHeader = ['H', 'o', 'm', 'e', 'T', 'e', 'a', 'm', '', ''];
  const awayTeamHeader = ['A', 'w', 'a', 'y', 'T', 'e', 'a', 'm', '', ''];

  if (!gameState || !gameState.data) {
    return <div>Loading game data...</div>;
  }

  return (
    <div className="squares-grid">
      <div className="grid-header flex">
        <div className="grid-cell corner-cell"></div>
        {homeTeamHeader.map((label, index) => (
          <div key={index} className="grid-cell header-cell">{label}</div>
        ))}
      </div>
      {gameState.data.map((row, rowIndex) => (
        <div key={rowIndex} className="grid-row flex">
          <div className="grid-cell header-cell">{awayTeamHeader[rowIndex]}</div>
          {row.map((cell, cellIndex) => (
            <button
              key={cellIndex}
              className={`grid-cell cell ${cell.purchased ? 'purchased' : ''}`}
              onClick={() => handleCellClick(rowIndex, cellIndex)}
            >
              {cell.purchased ? 'Purchased' : 'Buy'}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SquaresGrid;

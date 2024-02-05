import React from 'react';

const BuySquaresButton = ({ selectedSquares, setSelectedSquares, gridSize, purchaseSquares, setPurchaseStatus }) => {
  return (
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
      className="btn btn-primary mt-20"
    >
      Buy Squares
    </button>
  );
};

export default BuySquaresButton;
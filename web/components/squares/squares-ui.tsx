import { PublicKey } from '@solana/web3.js';
import { useSquaresProgram, useGetGameState } from './squares-data-access';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { AppModal, ellipsify } from '../ui/ui-layout';
import React, { useState } from 'react';

function ModalCreateGame({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const { createGame } = useSquaresProgram();
  const [amount, setAmount] = useState('0.25');

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Cost per square in SOL"
      submitDisabled={!amount || createGame.isPending}
      submitLabel="Create Game"
      submit={() => createGame.mutateAsync(parseFloat(amount)).then(() => hide())}
    >
      <input
        disabled={createGame.isPending}
        type="number"
        step="any"
        min="0.0001"
        placeholder="Amount per square"
        className="input input-bordered w-full"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </AppModal>
  );
}

export function SquaresCreate() {
  const wallet = useWallet();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={() => setShowModal(true)}
      >
        Create Game
      </button>
      <ModalCreateGame
        hide={() => setShowModal(false)}
        address={wallet.publicKey}
        show={showModal}
      />
    </>
  );
}

export function SquaresGrid({ game }: { game: PublicKey }) {
  const { gameState } = useGetGameState({ game });
return (
  <>
    <div className="grid grid-cols-11 gap-2">
      {/* Render the column headers */}
      {Array.from({ length: 11 }, (_, i) => (
        <div key={i} className="h-10 w-10 border border-gray-300 flex items-center justify-center bg-gray-200">
          {i !== 0 ? i - 1 : ''}
        </div>
      ))}
    </div>
    {Array.from({ length: 10 }, (_, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-11 gap-2">
        {/* Render the row header */}
        <div className="h-10 w-10 border border-gray-300 flex items-center justify-center bg-gray-200">
          {rowIndex}
        </div>
        {/* Render the squares */}
        {Array.from({ length: 10 }, (_, colIndex) => {
          let square;
          if (gameState && gameState.squares) {
            square = gameState.squares.find(
              (s) => s.x_axis === colIndex && s.y_axis === rowIndex
            );
          }
          return (
            <div
              key={colIndex}
              className="h-10 w-10 border border-gray-300 flex items-center justify-center bg-white"
            >
              {square && square.owner ? square.owner.slice(0, 10) : ''}
            </div>
          );
        })}
      </div>
    ))}
  </>
);
}
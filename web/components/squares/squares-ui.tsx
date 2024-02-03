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
      submit={() => createGame.mutateAsync()}
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
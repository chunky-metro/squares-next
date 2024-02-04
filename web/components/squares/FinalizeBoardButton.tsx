import React from 'react';

const FinalizeBoardButton = ({ isCreator, finalizeGame, setFinalizeStatus }) => {
  return (
    <button 
      className="btn btn-primary mt-4 ml-40" 
      disabled={!isCreator}
      onClick={() => {
        finalizeGame.mutate(null, {
          onSuccess: () => {
            setFinalizeStatus(true);
          },
        });
      }}
    >
      Finalize Board
    </button>
  );
};

export default FinalizeBoardButton;
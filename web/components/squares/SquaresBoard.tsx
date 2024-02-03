import { useDisplayBoard, useBuySquare } from './squares-detail-feature';
import SquaresGrid from './SquaresGrid';

function SquaresBoard({ id }) {
  const { gameAccount } = useDisplayBoard(id);
  const { buySquare } = useBuySquare(id);

  // Render your game board using gameAccount.data
  return (
    <>
      <SquaresGrid gameState={gameAccount.data} />
      {gameAccount.data.state === 'Open' && (
        <button onClick={() => buySquare.mutate(squareId)}>Buy</button>
      )}
    </>
  );
}
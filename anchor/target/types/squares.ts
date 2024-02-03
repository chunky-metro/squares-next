export type Squares = {
"version":"0.1.0","name":"football_squares","instructions":[{"name":"createGame","accounts":[{"name":"game","isMut":true,"isSigner":true},{"name":"user","isMut":true,"isSigner":true},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[{"name":"costPerSquare","type":"u64"}]},{"name":"purchaseSquare","accounts":[{"name":"game","isMut":true,"isSigner":false},{"name":"user","isMut":true,"isSigner":true},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[{"name":"squareIndices","type":"bytes"}]},{"name":"finalizeGame","accounts":[{"name":"game","isMut":true,"isSigner":false}],"args":[]},{"name":"updateScores","accounts":[{"name":"scores","isMut":true,"isSigner":false},{"name":"owner","isMut":false,"isSigner":true}],"args":[{"name":"quarter","type":"u8"},{"name":"home","type":"u8"},{"name":"away","type":"u8"}]}],"accounts":[{"name":"Scores","type":{"kind":"struct","fields":[{"name":"firstQuarterScores","type":{"defined":"QuarterScores"}},{"name":"secondQuarterScores","type":{"defined":"QuarterScores"}},{"name":"thirdQuarterScores","type":{"defined":"QuarterScores"}},{"name":"fourthQuarterScores","type":{"defined":"QuarterScores"}},{"name":"finalScores","type":{"defined":"QuarterScores"}}]}},{"name":"game","type":{"kind":"struct","fields":[{"name":"owner","type":"publicKey"},{"name":"costPerSquare","type":"u64"},{"name":"gameStatus","type":{"defined":"GameStatus"}},{"name":"squares","type":{"vec":{"defined":"Square"}}},{"name":"quarterScores","type":{"array":[{"defined":"QuarterScores"},5]}},{"name":"quarterWinners","type":{"array":[{"option":"publicKey"},5]}},{"name":"quarterPaid","type":{"array":["bool",5]}}]}}],"types":[{"name":"QuarterScores","type":{"kind":"struct","fields":[{"name":"home","type":"u8"},{"name":"away","type":"u8"}]}},{"name":"Square","type":{"kind":"struct","fields":[{"name":"owner","type":{"option":"publicKey"}},{"name":"xAxis","type":"u8"},{"name":"yAxis","type":"u8"}]}},{"name":"GameStatus","type":{"kind":"enum","variants":[{"name":"Open"},{"name":"Closed"},{"name":"Finalized"}]}}],"errors":[{"code":6000,"name":"GameClosed","msg":"The game is not open for purchases."},{"code":6001,"name":"InvalidSquareIndex","msg":"Invalid square index."},{"code":6002,"name":"SquareAlreadyPurchased","msg":"This square has already been purchased."},{"code":6003,"name":"Unauthorized","msg":"Only program owner can update scores."},{"code":6004,"name":"InvalidQuarter","msg":"Should be a number 1-5, where 5 is final score."},{"code":6005,"name":"GameNotOpen","msg":"Game's not open."},{"code":6006,"name":"NotAllSquaresPurchased","msg":"Can't finalize, not all squares are occupied."},{"code":6007,"name":"GameNotFinalized","msg":"Can't distribute winnings, game not finalized."},{"code":6008,"name":"QuarterAlreadyPaid"}]
};

export const IDL: Squares = {
"version":"0.1.0","name":"football_squares","instructions":[{"name":"createGame","accounts":[{"name":"game","isMut":true,"isSigner":true},{"name":"user","isMut":true,"isSigner":true},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[{"name":"costPerSquare","type":"u64"}]},{"name":"purchaseSquare","accounts":[{"name":"game","isMut":true,"isSigner":false},{"name":"user","isMut":true,"isSigner":true},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[{"name":"squareIndices","type":"bytes"}]},{"name":"finalizeGame","accounts":[{"name":"game","isMut":true,"isSigner":false}],"args":[]},{"name":"updateScores","accounts":[{"name":"scores","isMut":true,"isSigner":false},{"name":"owner","isMut":false,"isSigner":true}],"args":[{"name":"quarter","type":"u8"},{"name":"home","type":"u8"},{"name":"away","type":"u8"}]}],"accounts":[{"name":"Scores","type":{"kind":"struct","fields":[{"name":"firstQuarterScores","type":{"defined":"QuarterScores"}},{"name":"secondQuarterScores","type":{"defined":"QuarterScores"}},{"name":"thirdQuarterScores","type":{"defined":"QuarterScores"}},{"name":"fourthQuarterScores","type":{"defined":"QuarterScores"}},{"name":"finalScores","type":{"defined":"QuarterScores"}}]}},{"name":"game","type":{"kind":"struct","fields":[{"name":"owner","type":"publicKey"},{"name":"costPerSquare","type":"u64"},{"name":"gameStatus","type":{"defined":"GameStatus"}},{"name":"squares","type":{"vec":{"defined":"Square"}}},{"name":"quarterScores","type":{"array":[{"defined":"QuarterScores"},5]}},{"name":"quarterWinners","type":{"array":[{"option":"publicKey"},5]}},{"name":"quarterPaid","type":{"array":["bool",5]}}]}}],"types":[{"name":"QuarterScores","type":{"kind":"struct","fields":[{"name":"home","type":"u8"},{"name":"away","type":"u8"}]}},{"name":"Square","type":{"kind":"struct","fields":[{"name":"owner","type":{"option":"publicKey"}},{"name":"xAxis","type":"u8"},{"name":"yAxis","type":"u8"}]}},{"name":"GameStatus","type":{"kind":"enum","variants":[{"name":"Open"},{"name":"Closed"},{"name":"Finalized"}]}}],"errors":[{"code":6000,"name":"GameClosed","msg":"The game is not open for purchases."},{"code":6001,"name":"InvalidSquareIndex","msg":"Invalid square index."},{"code":6002,"name":"SquareAlreadyPurchased","msg":"This square has already been purchased."},{"code":6003,"name":"Unauthorized","msg":"Only program owner can update scores."},{"code":6004,"name":"InvalidQuarter","msg":"Should be a number 1-5, where 5 is final score."},{"code":6005,"name":"GameNotOpen","msg":"Game's not open."},{"code":6006,"name":"NotAllSquaresPurchased","msg":"Can't finalize, not all squares are occupied."},{"code":6007,"name":"GameNotFinalized","msg":"Can't distribute winnings, game not finalized."},{"code":6008,"name":"QuarterAlreadyPaid"}]
};
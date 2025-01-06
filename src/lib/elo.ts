export const DEFAULT_ELO = 1200;
export const K_FACTOR = 32;

export const calculateNewRatings = (winner: number, loser: number) => {
  const expectedScore = 1 / (1 + Math.pow(10, (loser - winner) / 400));
  const change = Math.round(K_FACTOR * (1 - expectedScore));
  return {
    winner: change,
    loser: -change
  };
};
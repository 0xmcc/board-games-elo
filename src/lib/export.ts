import { PlayerData, Match } from '@/types/elo';

export const exportToCSV = (players: PlayerData[], matches: Match[], isMarko: boolean = false): void => {
  // Create players CSV with PINs only if signed in as Marko
  const playerRows = [
    ['Name', 'Rating', 'Wins', 'Losses', 'Win Rate', ...(isMarko ? ['PIN'] : [])],
    ...players.map(p => [
      p.name,
      p.rating.toString(),
      p.stats.wins.toString(),
      p.stats.losses.toString(),
      ((p.stats.wins / (p.stats.wins + p.stats.losses)) * 100 || 0).toFixed(1) + '%',
      ...(isMarko ? [p.stats.pin || 'N/A'] : [])
    ])
  ];

  // Create matches CSV
  const matchRows = [
    ['Timestamp', 'Winner', 'Loser', 'Rating Change'],
    ...matches.map(m => [
      new Date(m.timestamp).toLocaleString(),
      m.winner,
      m.loser,
      `+${m.winnerRatingChange}/${m.loserRatingChange}`
    ])
  ];

  // Convert to CSV strings
  const playersCSV = playerRows.map(row => row.join(',')).join('\n');
  const matchesCSV = matchRows.map(row => row.join(',')).join('\n');

  // Create combined CSV with sections
  const combinedCSV = `Players\n${playersCSV}\n\nMatches\n${matchesCSV}`;

  // Create and trigger download
  const blob = new Blob([combinedCSV], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `game-night-stats-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
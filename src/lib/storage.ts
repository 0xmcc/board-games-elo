const STORAGE_KEYS = {
  PLAYERS: 'gamenight_players',
  PLAYER_STATS: 'gamenight_player_stats',
  MATCH_HISTORY: 'gamenight_match_history',
  CHALLENGES: 'gamenight_challenges'
} as const;

export const storage = {
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return defaultValue;
    }
  },

  setItem: <T>(key: string, value: T): void => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
    }
  }
};

export { STORAGE_KEYS };
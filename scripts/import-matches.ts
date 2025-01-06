import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importMatches() {
  try {
    // Read and parse CSV
    const csvContent = fs.readFileSync('matches.csv', 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    // Get all players first
    const { data: existingPlayers } = await supabase
      .from('players')
      .select('id, name');

    const playerMap = new Map(
      existingPlayers?.map(p => [p.name, p.id]) || []
    );

    // Process each match
    for (const record of records) {
      const [date, time] = record.Timestamp.split(',');
      const timestamp = new Date(`${date} ${time}`).toISOString();
      const winner = record.Winner;
      const loser = record.Loser;
      const [winnerChange, loserChange] = record['Rating Change']
        .split('/')
        .map(x => parseInt(x.replace(/[^-\d]/g, '')));

      // Skip if we don't have both players
      if (!playerMap.has(winner) || !playerMap.has(loser)) {
        console.log(`Skipping match between ${winner} and ${loser} - player(s) not found`);
        continue;
      }

      // Insert match
      const { error } = await supabase
        .from('matches')
        .insert({
          winner_id: playerMap.get(winner),
          loser_id: playerMap.get(loser),
          winner_rating_change: winnerChange,
          loser_rating_change: loserChange,
          created_at: timestamp
        });

      if (error) {
        console.error('Error inserting match:', error);
        continue;
      }

      console.log(`Imported: ${winner} vs ${loser}`);
    }

    console.log('Import completed');
  } catch (error) {
    console.error('Import failed:', error);
  }
}

importMatches();
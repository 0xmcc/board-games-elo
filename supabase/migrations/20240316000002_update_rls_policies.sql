-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated insert" ON matches;
DROP POLICY IF EXISTS "Allow authenticated update" ON players;
DROP POLICY IF EXISTS "Allow authenticated update" ON player_stats;

-- Update matches policy to allow any authenticated user to insert
CREATE POLICY "Allow match recording"
    ON matches
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Allow updating player ratings
CREATE POLICY "Allow rating updates"
    ON players
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

-- Allow updating player stats
CREATE POLICY "Allow stats updates"
    ON player_stats
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT UPDATE ON players TO public;
GRANT UPDATE ON player_stats TO public;
GRANT INSERT ON matches TO public;
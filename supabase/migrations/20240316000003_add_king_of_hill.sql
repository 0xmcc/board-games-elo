-- Add king_of_hill table
CREATE TABLE king_of_hill (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id),
    crowned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dethroned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for current king query
CREATE INDEX idx_king_of_hill_active ON king_of_hill(dethroned_at) WHERE dethroned_at IS NULL;

-- Function to get current king
CREATE OR REPLACE FUNCTION get_current_king()
RETURNS TABLE (
    player_id UUID,
    player_name TEXT,
    crowned_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        k.player_id,
        p.name as player_name,
        k.crowned_at
    FROM king_of_hill k
    JOIN players p ON p.id = k.player_id
    WHERE k.dethroned_at IS NULL
    ORDER BY k.crowned_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
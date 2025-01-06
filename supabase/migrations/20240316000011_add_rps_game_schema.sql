-- Drop existing columns if they exist
ALTER TABLE challenges 
DROP COLUMN IF EXISTS challenger_choice,
DROP COLUMN IF EXISTS challenged_choice;

-- Add columns with proper constraints
ALTER TABLE challenges
ADD COLUMN challenger_choice VARCHAR(10),
ADD COLUMN challenged_choice VARCHAR(10),
ADD CONSTRAINT valid_challenger_choice CHECK (challenger_choice IN ('rock', 'paper', 'scissors')),
ADD CONSTRAINT valid_challenged_choice CHECK (challenged_choice IN ('rock', 'paper', 'scissors'));

-- Create function to resolve RPS challenges
CREATE OR REPLACE FUNCTION resolve_rps_challenge(
    challenge_id_param UUID,
    winner_id_param UUID,
    loser_id_param UUID
)
RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
AS $function$
DECLARE
    winner_rating INTEGER;
    loser_rating INTEGER;
    rating_changes RECORD;
BEGIN
    -- Get current ratings
    SELECT rating INTO winner_rating FROM players WHERE id = winner_id_param;
    SELECT rating INTO loser_rating FROM players WHERE id = loser_id_param;
    
    -- Calculate rating changes (using existing ELO calculation)
    WITH expected_score AS (
        SELECT 1 / (1 + power(10, (loser_rating - winner_rating)::float / 400)) as score
    ),
    changes AS (
        SELECT 
            round(32 * (1 - score)) as winner_change,
            round(32 * (0 - score)) as loser_change
        FROM expected_score
    )
    SELECT * INTO rating_changes FROM changes;

    -- Update player ratings
    UPDATE players
    SET rating = rating + rating_changes.winner_change
    WHERE id = winner_id_param;

    UPDATE players
    SET rating = rating + rating_changes.loser_change
    WHERE id = loser_id_param;

    -- Update player stats
    UPDATE player_stats
    SET wins = wins + 1
    WHERE player_id = winner_id_param;

    UPDATE player_stats
    SET losses = losses + 1
    WHERE player_id = loser_id_param;

    -- Record the match
    INSERT INTO matches (
        winner_id,
        loser_id,
        winner_rating_change,
        loser_rating_change
    ) VALUES (
        winner_id_param,
        loser_id_param,
        rating_changes.winner_change,
        rating_changes.loser_change
    );

    -- Mark challenge as resolved
    UPDATE challenges
    SET status = 'resolved'
    WHERE id = challenge_id_param;
END;
$function$;

-- Grant necessary permissions
GRANT UPDATE (challenger_choice, challenged_choice) ON challenges TO public;
GRANT EXECUTE ON FUNCTION resolve_rps_challenge TO public;
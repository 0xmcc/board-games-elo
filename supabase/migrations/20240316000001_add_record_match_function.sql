-- Drop existing function if it exists
DROP FUNCTION IF EXISTS record_match;

-- Function to record a match with all related updates in a single transaction
CREATE OR REPLACE FUNCTION record_match(
    winner_id_param uuid,
    loser_id_param uuid,
    winner_rating_change_param integer,
    loser_rating_change_param integer,
    new_winner_rating_param integer,
    new_loser_rating_param integer
) RETURNS void
    LANGUAGE plpgsql
AS $function$
BEGIN
    -- Start transaction
    BEGIN
        -- Record the match
        INSERT INTO matches (
            winner_id,
            loser_id,
            winner_rating_change,
            loser_rating_change
        ) VALUES (
            winner_id_param,
            loser_id_param,
            winner_rating_change_param,
            loser_rating_change_param
        );

        -- Update winner's rating and stats
        UPDATE players
        SET rating = new_winner_rating_param,
            updated_at = NOW()
        WHERE id = winner_id_param;

        UPDATE player_stats
        SET wins = wins + 1,
            updated_at = NOW()
        WHERE player_id = winner_id_param;

        -- Update loser's rating and stats
        UPDATE players
        SET rating = new_loser_rating_param,
            updated_at = NOW()
        WHERE id = loser_id_param;

        UPDATE player_stats
        SET losses = losses + 1,
            updated_at = NOW()
        WHERE player_id = loser_id_param;

        -- Commit transaction
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        -- Rollback transaction on error
        ROLLBACK;
        RAISE;
    END;
END;
$function$;
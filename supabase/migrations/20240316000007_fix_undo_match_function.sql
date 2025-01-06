-- Drop existing function if it exists
DROP FUNCTION IF EXISTS undo_last_match();

-- Recreate the function with proper schema and permissions
CREATE OR REPLACE FUNCTION public.undo_last_match()
RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
AS $function$
DECLARE
    last_match RECORD;
    result json;
BEGIN
    -- Start transaction
    BEGIN
        -- Get the last match
        SELECT * INTO last_match FROM matches
        ORDER BY created_at DESC
        LIMIT 1;

        IF last_match IS NULL THEN
            RAISE EXCEPTION 'No matches to undo';
        END IF;

        -- Update winner's stats and rating
        UPDATE players
        SET rating = rating - last_match.winner_rating_change
        WHERE id = last_match.winner_id;

        UPDATE player_stats
        SET wins = wins - 1
        WHERE player_id = last_match.winner_id;

        -- Update loser's stats and rating
        UPDATE players
        SET rating = rating - last_match.loser_rating_change
        WHERE id = last_match.loser_id;

        UPDATE player_stats
        SET losses = losses - 1
        WHERE player_id = last_match.loser_id;

        -- Delete the match
        DELETE FROM matches
        WHERE id = last_match.id;

        -- Prepare success result
        result := json_build_object(
            'success', true,
            'message', 'Match undone successfully'
        );

        -- Commit transaction
        COMMIT;

        RETURN result;
    EXCEPTION WHEN OTHERS THEN
        -- Rollback transaction on error
        ROLLBACK;
        
        -- Return error result
        result := json_build_object(
            'success', false,
            'message', SQLERRM
        );
        
        RETURN result;
    END;
END;
$function$;

-- Set proper permissions
REVOKE ALL ON FUNCTION public.undo_last_match() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.undo_last_match() TO authenticated;
GRANT EXECUTE ON FUNCTION public.undo_last_match() TO anon;
GRANT EXECUTE ON FUNCTION public.undo_last_match() TO service_role;

-- Add comment for API documentation
COMMENT ON FUNCTION public.undo_last_match() IS 'Undoes the last recorded match and updates related statistics';
-- Create custom types for function results
CREATE TYPE match_undo_result AS (
    success boolean,
    message text
);
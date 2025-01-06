-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION undo_last_match() TO public;

-- Enable RPC access
COMMENT ON FUNCTION undo_last_match() IS 'Function to undo the last recorded match';

-- Add row level security policy for the function
ALTER FUNCTION undo_last_match() SECURITY DEFINER;

-- Ensure the function is accessible via the API
SELECT graphql.rebuild_schema();
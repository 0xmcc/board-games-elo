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

-- Grant necessary permissions
GRANT UPDATE (challenger_choice, challenged_choice) ON challenges TO public;
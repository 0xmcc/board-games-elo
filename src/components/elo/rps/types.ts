import { RPSChoice } from '@/lib/games';

export interface RPSGameProps {
  onSelect: (choice: RPSChoice) => void;
  selectedChoice?: RPSChoice;
  disabled?: boolean;
}

export interface RPSChallengeProps {
  challenger: string;
  challenged: string;
  timestamp: string;
  isChallenger: boolean;
  myChoice?: RPSChoice;
  opponentChoice?: RPSChoice;
  onMakeChoice: (choice: RPSChoice) => void;
  onDelete?: () => void;
}
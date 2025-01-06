import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { getAvailablePlayers } from '@/lib/db';
import { toast } from 'sonner';
import { PinInput } from './PinInput';

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignInDialog: React.FC<SignInDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { signIn } = useAuth();
  const [selectedPlayer, setSelectedPlayer] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [availablePlayers, setAvailablePlayers] = React.useState<Array<{ name: string; pin: string }>>([]);
  const pinInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      const loadPlayers = async () => {
        try {
          const players = await getAvailablePlayers();
          setAvailablePlayers(players);
        } catch (error) {
          console.error('Error loading players:', error);
          toast.error('Failed to load players');
          setError('Failed to load players. Please try again.');
        }
      };
      loadPlayers();
    } else {
      setSelectedPlayer('');
      setPin('');
      setError('');
    }
  }, [open]);

  React.useEffect(() => {
    if (selectedPlayer && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [selectedPlayer]);

  React.useEffect(() => {
    if (pin.length === 4 && selectedPlayer) {
      handleSignIn();
    }
  }, [pin]);

  const handleSignIn = async () => {
    if (!selectedPlayer) {
      setError('Please select a player');
      return;
    }

    if (!pin || pin.length !== 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await signIn(selectedPlayer, pin);
      onOpenChange(false);
      toast.success('Signed in successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid credentials';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-white">Sign In</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Select Player</Label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
              disabled={isLoading}
            >
              <option value="">Choose player...</option>
              {availablePlayers.map(player => (
                <option key={player.name} value={player.name}>{player.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Enter PIN</Label>
            <PinInput 
              value={pin}
              onChange={setPin}
              disabled={isLoading}
              ref={pinInputRef}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <Button
            onClick={handleSignIn}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
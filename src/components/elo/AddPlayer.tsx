import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/icons';
import { generatePin } from '@/lib/pin';
import { createPlayer } from '@/lib/db';
import { toast } from 'sonner';

interface AddPlayerProps {
  newPlayerName: string;
  setNewPlayerName: (name: string) => void;
  onAddPlayer: () => void;
  onPinGenerated: (pin: string) => void;
}

export const AddPlayer: React.FC<AddPlayerProps> = ({
  newPlayerName,
  setNewPlayerName,
  onAddPlayer,
  onPinGenerated
}) => {
  const [currentPin, setCurrentPin] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (newPlayerName.trim()) {
      setCurrentPin(generatePin());
    } else {
      setCurrentPin('');
    }
  }, [newPlayerName]);

  const handleAddPlayer = async () => {
    try {
      setIsLoading(true);
      await createPlayer(newPlayerName, currentPin);
      onPinGenerated(currentPin);
      onAddPlayer();
      toast.success(`Player PIN: ${currentPin}`, {
        description: "Save this PIN! You'll need it to view your stats.",
        duration: 10000,
      });
      setCurrentPin('');
    } catch (error) {
      console.error('Error creating player:', error);
      toast.error('Failed to create player. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-red-800">Add New Player</label>
      <div className="flex space-x-2">
        <Input
          placeholder="Enter player name"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          className="flex-1 border-2 border-red-200"
          disabled={isLoading}
        />
        <Input
          value={currentPin}
          readOnly
          placeholder="PIN"
          className="w-24 bg-gray-50 border-2 border-red-200 font-mono"
        />
        <Button 
          onClick={handleAddPlayer}
          className="bg-green-600 hover:bg-green-700"
          disabled={!newPlayerName.trim() || !currentPin || isLoading}
        >
          <PlusIcon />
          {isLoading ? 'Adding...' : 'Add'}
        </Button>
      </div>
    </div>
  );
};
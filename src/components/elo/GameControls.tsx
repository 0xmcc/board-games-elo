import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AddPlayer } from './AddPlayer';
import { RecordMatch } from './RecordMatch';
import { ResetData } from './ResetData';

interface GameControlsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newPlayerName: string;
  setNewPlayerName: (name: string) => void;
  onAddPlayer: () => void;
  onPinGenerated: (pin: string) => void;
  players: Record<string, number>;
  player1: string;
  player2: string;
  setPlayer1: (name: string) => void;
  setPlayer2: (name: string) => void;
  onRecordGame: () => void;
  onReset: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  open,
  onOpenChange,
  newPlayerName,
  setNewPlayerName,
  onAddPlayer,
  onPinGenerated,
  players,
  player1,
  player2,
  setPlayer1,
  setPlayer2,
  onRecordGame,
  onReset,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-red-600 text-center">
            Game Controls
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <AddPlayer
            newPlayerName={newPlayerName}
            setNewPlayerName={setNewPlayerName}
            onAddPlayer={onAddPlayer}
            onPinGenerated={onPinGenerated}
          />
          <RecordMatch
            players={players}
            player1={player1}
            player2={player2}
            setPlayer1={setPlayer1}
            setPlayer2={setPlayer2}
            onRecordGame={onRecordGame}
          />
          <ResetData onReset={onReset} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
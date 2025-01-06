import React from 'react';
import { Crown, HelpCircle } from 'lucide-react';
import { KingOfHill as KingOfHillType } from '@/types/elo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KingOfHillProps {
  king: KingOfHillType | null;
}

export const KingOfHill: React.FC<KingOfHillProps> = ({ king }) => {
  if (!king) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50/50 border border-amber-200 rounded-lg cursor-help group">
            <Crown className="h-5 w-5 text-amber-500" />
            <span className="font-medium text-amber-900">{king.playerName}</span>
            <HelpCircle className="h-4 w-4 text-amber-400 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Defeat this person for their crown</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
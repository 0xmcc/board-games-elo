import React from 'react';
import { Swords } from 'lucide-react';

interface InboundDuelsCounterProps {
  challenges: Array<{ challenged: string; status: string }>;
  username: string;
}

export const InboundDuelsCounter: React.FC<InboundDuelsCounterProps> = ({ challenges, username }) => {
  const inboundCount = challenges.filter(
    challenge => challenge.challenged === username && challenge.status === 'pending'
  ).length;

  return (
    <div className="flex items-center gap-1 text-xs text-red-700">
      <Swords className="h-3 w-3" />
      <span>{inboundCount} inbound duel {inboundCount === 1 ? 'request' : 'requests'}</span>
    </div>
  );
};
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { InboundDuelsCounter } from '@/components/elo/InboundDuelsCounter';
import type { Challenge } from '@/types/elo';

interface UserMenuProps {
  challenges: Challenge[];
}

export function UserMenu({ challenges }: UserMenuProps) {
  const { signedInPlayer, logout } = useAuth();
  const [playerRating, setPlayerRating] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function fetchPlayerRating() {
      if (!signedInPlayer) return;
      
      const { data, error } = await supabase
        .from('players')
        .select('rating')
        .eq('name', signedInPlayer)
        .single();

      if (!error && data) {
        setPlayerRating(data.rating);
      }
    }

    fetchPlayerRating();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('player_rating_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'players',
          filter: `name=eq.${signedInPlayer}`
        }, 
        () => {
          fetchPlayerRating();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [signedInPlayer]);

  if (!signedInPlayer) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-end">
        <span className="text-sm text-red-800 font-medium">
          Signed in as {signedInPlayer}
          {playerRating !== null && (
            <span className="ml-2 font-mono">— ELO {playerRating}</span>
          )}
        </span>
        <InboundDuelsCounter challenges={challenges} username={signedInPlayer} />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={logout}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
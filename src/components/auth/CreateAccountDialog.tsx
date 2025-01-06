import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { generatePin } from '@/lib/pin';

interface CreateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAccount: (name: string, password: string, pin: string) => void;
}

export const CreateAccountDialog: React.FC<CreateAccountDialogProps> = ({
  open,
  onOpenChange,
  onCreateAccount,
}) => {
  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setPin(generatePin());
    }
  }, [open]);

  const handleCreateAccount = () => {
    if (!name.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    onCreateAccount(name, password, pin);
    setName('');
    setPassword('');
    setError('');
    onOpenChange(false);
    
    if (password === 'commons123') {
      toast.success('Account created and approved! Use your PIN to sign in.');
    } else {
      toast.error('Account creation rejected. Invalid password.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-white">Claim Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Name</Label>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-gray-600 bg-gray-800 text-white"
                placeholder="Enter name"
              />
              <Input
                value={pin}
                readOnly
                className="w-24 border-gray-600 bg-gray-700 text-white font-mono text-center"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-gray-600 bg-gray-800 text-white"
              placeholder="Enter password"
            />
            <p className="text-xs text-gray-400">
              Enter the correct password to get instant access.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <Button
            onClick={handleCreateAccount}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Claim Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
import React from 'react';
import { cn } from '@/lib/utils';

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const PinInput = React.forwardRef<HTMLInputElement, PinInputProps>(({
  value,
  onChange,
  disabled = false
}, ref) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  
  React.useEffect(() => {
    // Initialize refs array
    inputRefs.current = inputRefs.current.slice(0, 4);
  }, []);

  React.useImperativeHandle(ref, () => inputRefs.current[0] as HTMLInputElement);

  const handleChange = (index: number, inputValue: string) => {
    if (!/^\d*$/.test(inputValue)) return;

    const newValue = value.split('');
    newValue[index] = inputValue.slice(-1);
    const updatedValue = newValue.join('');
    onChange(updatedValue);

    // Move to next input if value is entered
    if (inputValue && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (!/^\d*$/.test(pastedData)) return;
    
    onChange(pastedData.padEnd(4, ''));
    if (pastedData.length === 4) {
      inputRefs.current[3]?.focus();
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-2xl font-mono rounded-md border-2",
            "focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500",
            "bg-gray-800 border-gray-600 text-white",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
});

PinInput.displayName = 'PinInput';
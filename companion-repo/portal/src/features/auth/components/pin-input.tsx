// src/features/auth/components/pin-input.tsx
import { useRef, useState } from 'react';

const PIN_LENGTH = 6;

interface PinInputProps {
  onChange: (pin: string) => void;
}

export function PinInput({ onChange }: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));

  const updateDigits = (index: number, value: string) => {
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    onChange(next.join(''));
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // Only allow single digit
    updateDigits(index, value);

    if (value.length === 1 && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Backspace' && digits[index] === '' && index > 0) {
      updateDigits(index - 1, '');
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="h-12 w-12 rounded-lg border border-gray-300 text-center text-xl"
          aria-label={`PIN digit ${index + 1}`}
        />
      ))}
    </div>
  );
}

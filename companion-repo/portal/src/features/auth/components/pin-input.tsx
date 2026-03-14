// src/features/auth/components/pin-input.tsx
import { useRef } from 'react';

export function PinInput() {
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, value: string) => {
    if (value.length === 1 && index < 5) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Backspace' && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  return (
    <div className="flex gap-2">
      {inputRefs.map((ref, index) => (
        <input
          key={index}
          ref={ref}
          type="text"
          inputMode="numeric"
          maxLength={1}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="h-12 w-12 rounded-lg border border-gray-300 text-center text-xl"
          aria-label={`PIN digit ${index + 1}`}
        />
      ))}
    </div>
  );
}

// src/components/ui/masked-value.tsx
import { useState } from 'react';

interface MaskedValueProps {
  value: string;
  maskedValue: string;
  label: string;
}

export function MaskedValue({ value, maskedValue, label }: MaskedValueProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <span className="inline-flex items-center gap-1">
      <span aria-label={`${label} (${isRevealed ? 'visible' : 'hidden'})`}>
        {isRevealed ? value : maskedValue}
      </span>
      <button
        type="button"
        onClick={() => { setIsRevealed((prev) => !prev); }}
        className="text-xs text-ewb-purple underline"
        aria-label={isRevealed ? `Hide ${label}` : `Show ${label}`}
      >
        {isRevealed ? 'Hide' : 'Show'}
      </button>
    </span>
  );
}

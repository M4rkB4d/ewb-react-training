// src/components/SearchInput.tsx
import { useRef, useEffect } from 'react';

function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the search input when the component mounts
    inputRef.current?.focus();
  }, []);

  return (
    <input
      ref={inputRef}
      type="search"
      placeholder="Search transactions..."
      className="w-full rounded-md border px-3 py-2"
    />
  );
}

export default SearchInput;

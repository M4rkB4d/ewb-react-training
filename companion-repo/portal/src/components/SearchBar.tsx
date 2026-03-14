// src/components/SearchBar.tsx
function SearchBar() {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const _query = event.target.value;
    // TypeScript knows event.target is an HTMLInputElement
    // So event.target.value is guaranteed to be a string
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TypeScript knows this is a form event
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      // TypeScript knows event.key is a string
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search transactions..."
      />
    </form>
  );
}

export default SearchBar;

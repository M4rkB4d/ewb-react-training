// src/components/DataList.tsx
interface DataListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

function DataList<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items found',
}: DataListProps<T>) {
  if (items.length === 0) {
    return <p className="text-center text-muted-fg">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y">
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

export default DataList;

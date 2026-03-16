// src/components/ui/locale-date.tsx
interface LocaleDateProps {
  value: string | Date;
  format?: 'short' | 'long';
}

const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
  short: { year: 'numeric', month: 'short', day: 'numeric' },
  long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
};

export function LocaleDate({ value, format = 'short' }: LocaleDateProps) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const formatted = new Intl.DateTimeFormat('en-PH', formatOptions[format]).format(date);

  return <time dateTime={date.toISOString()}>{formatted}</time>;
}

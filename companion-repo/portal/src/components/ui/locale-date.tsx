// src/components/ui/locale-date.tsx
import { FormattedDate } from 'react-intl';

interface LocaleDateProps {
  value: string | Date;
  format?: 'short' | 'long';
}

export function LocaleDate({ value, format = 'short' }: LocaleDateProps) {
  if (format === 'short') {
    return (
      <FormattedDate value={value} year="numeric" month="short" day="numeric" />
    );
  }

  return (
    <FormattedDate
      value={value}
      year="numeric"
      month="long"
      day="numeric"
      weekday="long"
    />
  );
}

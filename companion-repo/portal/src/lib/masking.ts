// src/lib/masking.ts

/**
 * Mask a value, showing only the last N characters.
 * DPA compliance — minimize PII display.
 */
export function maskValue(value: string, visibleChars: number): string {
  if (value.length <= visibleChars) return value;
  const masked = '•'.repeat(value.length - visibleChars);
  return masked + value.slice(-visibleChars);
}

export function maskAccountNumber(accountNumber: string): string {
  return maskValue(accountNumber, 4);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local == null || domain == null) return '••••@••••';
  const maskedLocal = local.charAt(0) + '•'.repeat(Math.max(local.length - 2, 1)) + local.charAt(local.length - 1);
  return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone: string): string {
  // Show only last 4 digits: ••••••5678
  const digits = phone.replace(/\D/g, '');
  return maskValue(digits, 4);
}

export function maskName(name: string): string {
  const parts = name.split(' ');
  return parts.map((part) => part.charAt(0) + '•'.repeat(part.length - 1)).join(' ');
}

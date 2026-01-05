export function formatPhone(phone: string | null) {
  if (!phone) return '—';

  // Remove anything that isn't a digit
  const digits = phone.replace(/\D/g, '');

  // US standard 10-digit number
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Fallback: return whatever we were given
  return phone;
}
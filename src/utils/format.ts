const RUPEE_SYMBOL = '\u20B9';

export const formatCurrency = (value: unknown) => {
  const amount = Number(value || 0);
  const sign = amount < 0 ? '-' : '';

  return `${sign}${RUPEE_SYMBOL}${Math.abs(amount).toLocaleString('en-IN')}`;
};

export const capitalize = (value: string | null | undefined) => {
  if (!value) {
    return '';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const formatMonthYear = (date = new Date()) =>
  date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

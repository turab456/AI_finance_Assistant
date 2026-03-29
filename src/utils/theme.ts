export const COLORS = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',

  income: '#10B981',
  incomeDark: '#059669',
  incomeLight: '#D1FAE5',

  expense: '#F43F5E',
  expenseDark: '#E11D48',
  expenseLight: '#FFE4E6',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  background: '#F8FAFC',
  card: '#FFFFFF',

  textDark: '#1E293B',
  textMedium: '#64748B',
  textLight: '#94A3B8',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const GRADIENTS = {
  primary: [COLORS.primaryLight, COLORS.primaryDark],
  income: ['#34D399', COLORS.incomeDark],
  expense: ['#FB7185', COLORS.expenseDark],
  indigo: ['#818CF8', '#4F46E5'],
  warning: ['#FBBF24', COLORS.warning],
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const SHADOW = {
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
};

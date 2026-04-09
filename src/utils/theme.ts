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
  surface: '#F1F5F9',
  border: '#E2E8F0',
  primarySurface: '#EEF2FF',

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
  elevation: 4,
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
};

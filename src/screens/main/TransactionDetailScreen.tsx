import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Info, TrendingDown, TrendingUp } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import ElevatedCard from '../../components/ui/ElevatedCard';
import PageHeader from '../../components/ui/PageHeader';
import { COLORS, SPACING } from '../../utils/theme';

const TransactionDetailScreen = ({ navigation, route }: any) => {
  const { transaction } = route.params || {};
  const isCredit = transaction?.type === 'credit';

  return (
    <Screen safeAreaStyle={styles.safeArea}>
      <PageHeader
        eyebrow="Details"
        title={transaction?.merchant || 'Transaction'}
        subtitle="Expanded category view for the selected activity."
        onBack={() => navigation.goBack()}
      />

      <LinearGradient colors={isCredit ? ['#34D399', COLORS.incomeDark] : ['#FB7185', COLORS.expenseDark]} style={styles.heroCard}>
        <View style={styles.heroIcon}>
          {isCredit ? <TrendingUp size={24} color={isCredit ? COLORS.incomeDark : COLORS.expenseDark} /> : <TrendingDown size={24} color={COLORS.expenseDark} />}
        </View>
        <Text style={styles.heroAmount}>{transaction?.amount || 'N/A'}</Text>
        <Text style={styles.heroMeta}>{transaction?.time || 'Captured from notifications'}</Text>
      </LinearGradient>

      <ElevatedCard style={styles.metaCard}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Category</Text>
          <Text style={styles.metaValue}>{transaction?.category || 'Not available'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Direction</Text>
          <Text style={styles.metaValue}>{isCredit ? 'Incoming' : 'Outgoing'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Source</Text>
          <Text style={styles.metaValue}>Bank notification</Text>
        </View>
      </ElevatedCard>

      <ElevatedCard style={styles.aiCard}>
        <View style={styles.aiHeader}>
          <View style={styles.aiIcon}>
            <Info size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.aiTitle}>AI explanation</Text>
        </View>
        <Text style={styles.aiText}>
          This activity was grouped under {transaction?.category || 'the selected category'} using recent notification patterns and your existing monthly trend history.
        </Text>
      </ElevatedCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    borderRadius: 28,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  heroAmount: {
    marginTop: SPACING.lg,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: COLORS.white,
  },
  heroMeta: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
  },
  metaCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  aiCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySurface,
    marginRight: SPACING.md,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  aiText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textMedium,
  },
});

export default TransactionDetailScreen;

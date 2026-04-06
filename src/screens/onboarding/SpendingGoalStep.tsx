import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Target, TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import PageHeader from '../../components/ui/PageHeader';
import ElevatedCard from '../../components/ui/ElevatedCard';
import { COLORS, SPACING } from '../../utils/theme';
import { capitalize } from '../../utils/format';

const SPENDING_GOALS = [
  { id: 'save', label: 'Save money', description: 'Highlight cash you can keep aside each month.', icon: Wallet, tint: COLORS.primarySurface },
  { id: 'track', label: 'Track spending', description: 'Break down categories and surface patterns faster.', icon: TrendingUp, tint: '#E0F2FE' },
  { id: 'reduce', label: 'Reduce overspending', description: 'Spot pressure areas before they get too large.', icon: TrendingDown, tint: '#FEF2F2' },
  { id: 'build', label: 'Build savings', description: 'Stay focused on a steadier long-term reserve.', icon: Target, tint: '#ECFCCB' },
];

const SpendingGoalStep = ({ navigation, route }: any) => {
  const { incomeType, incomeRange } = route?.params || {};

  const handleSelect = (spendingGoal: string) => {
    navigation.navigate('Completion', { incomeType, incomeRange, spendingGoal });
  };

  return (
    <Screen safeAreaStyle={styles.safeArea}>
      <PageHeader
        eyebrow="Step 3 of 3"
        title="What should the app help you improve first?"
        subtitle="Choose one focus area. This shapes the insights and trend callouts you see on the dashboard."
        onBack={() => navigation.goBack()}
      />

      <View style={styles.progressTrack}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Text style={styles.metaPillText}>Source: {capitalize(incomeType) || 'Not set'}</Text>
        </View>
        <View style={styles.metaPill}>
          <Text style={styles.metaPillText}>Income: {incomeRange || 'Set later'}</Text>
        </View>
      </View>

      <View style={styles.optionsList}>
        {SPENDING_GOALS.map(item => {
          const Icon = item.icon;

          return (
            <TouchableOpacity key={item.id} activeOpacity={0.82} onPress={() => handleSelect(item.id)}>
              <ElevatedCard style={styles.optionCard}>
                <View style={[styles.optionIcon, { backgroundColor: item.tint }]}>
                  <Icon size={20} color={COLORS.primary} />
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{item.label}</Text>
                  <Text style={styles.optionDescription}>{item.description}</Text>
                </View>
                <ChevronRight size={20} color={COLORS.textLight} />
              </ElevatedCard>
            </TouchableOpacity>
          );
        })}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  progressDot: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  metaPill: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    backgroundColor: COLORS.primarySurface,
  },
  metaPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  optionsList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optionCopy: {
    flex: 1,
    marginRight: SPACING.md,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  optionDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textMedium,
  },
});

export default SpendingGoalStep;

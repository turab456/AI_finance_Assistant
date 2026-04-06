import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeftRight, Briefcase, ChevronRight, Landmark, PenTool } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import PageHeader from '../../components/ui/PageHeader';
import ElevatedCard from '../../components/ui/ElevatedCard';
import { COLORS, SPACING } from '../../utils/theme';

const INCOME_TYPES = [
  { id: 'salary', label: 'Salary', description: 'Best if most income lands on a regular monthly cycle.', icon: Briefcase },
  { id: 'business', label: 'Business', description: 'Good for owner income, payouts, and company transfers.', icon: Landmark },
  { id: 'freelance', label: 'Freelance', description: 'Useful when income arrives project by project.', icon: PenTool },
  { id: 'mixed', label: 'Mixed', description: 'Choose this if your inflow comes from several sources.', icon: ArrowLeftRight },
];

const IncomeTypeStep = ({ navigation }: any) => {
  const handleSelect = (incomeType: string) => {
    navigation.navigate('MonthlyIncome', { incomeType });
  };

  return (
    <Screen safeAreaStyle={styles.safeArea}>
      <PageHeader
        eyebrow="Step 1 of 3"
        title="Where does most of your income come from?"
        subtitle="Choose the closest match so the dashboard can shape spending trends more accurately."
        onBack={() => navigation.goBack()}
      />

      <View style={styles.progressTrack}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      <View style={styles.grid}>
        {INCOME_TYPES.map(item => {
          const Icon = item.icon;

          return (
            <TouchableOpacity key={item.id} activeOpacity={0.82} onPress={() => handleSelect(item.id)} style={styles.cardWrap}>
              <ElevatedCard style={styles.card}>
                <View style={styles.cardIcon}>
                  <Icon size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardAction}>Select</Text>
                  <ChevronRight size={18} color={COLORS.primary} />
                </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  cardWrap: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  card: {
    minHeight: 196,
    padding: SPACING.lg,
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySurface,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  cardDescription: {
    marginTop: SPACING.sm,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textMedium,
  },
  cardFooter: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.lg,
  },
  cardAction: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default IncomeTypeStep;

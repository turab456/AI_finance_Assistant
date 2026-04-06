import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BellRing, Sparkles, TrendingUp, Wallet } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import ElevatedCard from '../../components/ui/ElevatedCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { COLORS, GRADIENTS, SPACING } from '../../utils/theme';

const FEATURES = [
  { icon: TrendingUp, title: 'Trend tracking', description: 'See where money grows or slips each month.' },
  { icon: BellRing, title: 'Auto capture', description: 'Read bank alerts so you spend less time logging.' },
  { icon: Wallet, title: 'Cleaner overview', description: 'Keep income, balance, and insights in one place.' },
];

const WelcomeStep = ({ navigation }: any) => {
  return (
    <Screen safeAreaStyle={styles.safeArea} >
      <View style={styles.container} >
        <View>
          <LinearGradient colors={GRADIENTS.primary} style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Sparkles size={20} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.heroEyebrow}>Smart setup</Text>
            <Text style={styles.title}>Build a sharper money dashboard in under a minute</Text>
            <Text style={styles.subtitle}>
              We keep the same calm theme, but organize your finance flow around better trends, cleaner cards, and faster insights.
            </Text>
          </LinearGradient>

          <ElevatedCard style={styles.featuresCard}>
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <View key={feature.title} style={[styles.featureRow, index === FEATURES.length - 1 && styles.featureRowLast]}>
                  <View style={styles.featureIconWrap}>
                    <Icon size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.featureCopy}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              );
            })}
          </ElevatedCard>
        </View>

        <View>
          <PrimaryButton label="Start setup" onPress={() => navigation.navigate('IncomeType')} />
          <Text style={styles.footerNote}>Approximate setup time: 30 seconds</Text>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  heroCard: {
    borderRadius: 30,
    padding: SPACING.xl,
  },
  heroBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginBottom: SPACING.xl,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.78)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    marginTop: SPACING.md,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
    color: COLORS.white,
  },
  subtitle: {
    marginTop: SPACING.md,
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.82)',
  },
  featuresCard: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  featureRowLast: {
    borderBottomWidth: 0,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  featureDescription: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textMedium,
  },
  footerNote: {
    marginTop: SPACING.md,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
});

export default WelcomeStep;

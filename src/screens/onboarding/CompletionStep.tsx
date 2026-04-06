import React from 'react';
import { NativeModules, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BellRing, CheckCircle2, Target, Wallet } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import ElevatedCard from '../../components/ui/ElevatedCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { COLORS, GRADIENTS, SPACING } from '../../utils/theme';
import storage from '../../services/storage';
import { capitalize } from '../../utils/format';

const CompletionStep = ({ navigation, route }: any) => {
  const { incomeType, incomeRange, spendingGoal } = route?.params || {};

  const handleFinish = async () => {
    const existingProfile = (await storage.getUserProfile()) || {};

    await storage.setUserProfile({
      ...existingProfile,
      incomeType: incomeType || existingProfile.incomeType || 'not_set',
      incomeRange: incomeRange ?? existingProfile.incomeRange ?? null,
      spendingGoal: spendingGoal || existingProfile.spendingGoal || null,
      createdAt: existingProfile.createdAt || new Date().toISOString(),
    });
    await storage.setOnboardingCompleted(true);

    const { NotificationPermissionModule } = NativeModules;
    if (NotificationPermissionModule) {
      const isEnabled = await NotificationPermissionModule.isNotificationServiceEnabled();
      navigation.replace(isEnabled ? 'Main' : 'NotificationPermission');
      return;
    }

    navigation.replace('Main');
  };

  return (
    <Screen safeAreaStyle={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient colors={GRADIENTS.income} style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <CheckCircle2 size={34} color={COLORS.incomeDark} />
          </View>
          <Text style={styles.heroEyebrow}>Setup complete</Text>
          <Text style={styles.title}>Your dashboard is ready for cleaner tracking</Text>
          <Text style={styles.subtitle}>
            Notifications will keep transactions flowing in, while the refreshed screens focus on trends and a calmer layout.
          </Text>
        </LinearGradient>

        <ElevatedCard style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>What we saved</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryIconWrap}>
              <Wallet size={18} color={COLORS.primary} />
            </View>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryLabel}>Income source</Text>
              <Text style={styles.summaryValue}>{capitalize(incomeType) || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryIconWrap}>
              <BellRing size={18} color={COLORS.primary} />
            </View>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryLabel}>Income amount</Text>
              <Text style={styles.summaryValue}>{incomeRange || 'Set later in profile'}</Text>
            </View>
          </View>

          <View style={[styles.summaryRow, styles.summaryRowLast]}>
            <View style={styles.summaryIconWrap}>
              <Target size={18} color={COLORS.primary} />
            </View>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryLabel}>Primary focus</Text>
              <Text style={styles.summaryValue}>{capitalize(spendingGoal?.replace('_', ' ')) || 'Not set'}</Text>
            </View>
          </View>
        </ElevatedCard>

        <View style={styles.footer}>
          <PrimaryButton label="Open dashboard" onPress={handleFinish} />
          <Text style={styles.footerNote}>You can refine balance, salary, and profile details later from the Profile tab.</Text>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  heroCard: {
    borderRadius: 30,
    padding: SPACING.xl,
  },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
    color: COLORS.white,
  },
  subtitle: {
    marginTop: SPACING.md,
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.82)',
  },
  summaryCard: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  summaryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySurface,
    marginRight: SPACING.md,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  footer: {
    marginTop: 'auto',
  },
  footerNote: {
    marginTop: SPACING.md,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textLight,
  },
});

export default CompletionStep;

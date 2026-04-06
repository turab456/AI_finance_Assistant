import React, { useCallback, useEffect, useState } from 'react';
import { AppState, NativeModules, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BellRing, ChevronRight, ShieldCheck } from 'lucide-react-native';
import Screen from '../components/ui/Screen';
import ElevatedCard from '../components/ui/ElevatedCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import { BORDER_RADIUS, COLORS, SPACING } from '../utils/theme';

const { NotificationPermissionModule } = NativeModules;

const STEPS = [
  'Tap the button below to open Android notification settings.',
  'Find and select AI Finance Assistant in the list.',
  'Enable notification access, then return to the app.',
];

const NotificationPermissionScreen = ({ navigation }: any) => {
  const [appState, setAppState] = useState(AppState.currentState);

  const checkPermissionAndNavigate = useCallback(async () => {
    if (!NotificationPermissionModule) {
      navigation.replace('Main');
      return;
    }

    const isEnabled = await NotificationPermissionModule.isNotificationServiceEnabled();
    if (isEnabled) {
      navigation.replace('Main');
    }
  }, [navigation]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        await checkPermissionAndNavigate();
      }

      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState, checkPermissionAndNavigate]);

  const handleOpenSettings = () => {
    if (NotificationPermissionModule) {
      NotificationPermissionModule.openNotificationSettings();
    }
  };

  return (
    <Screen safeAreaStyle={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <LinearGradient colors={[COLORS.primarySurface, '#E0E7FF']} style={styles.heroBadge}>
            <BellRing size={34} color={COLORS.primary} />
          </LinearGradient>
          <Text style={styles.title}>Enable notification access</Text>
          <Text style={styles.subtitle}>
            This keeps tracking automatic by reading bank alerts and payment notifications in the background.
          </Text>
        </View>

        <ElevatedCard style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <ShieldCheck size={18} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Why this matters</Text>
          </View>
          <Text style={styles.infoBody}>
            Once enabled, the app can capture spending updates faster and keep your trends screen fresh without manual entry.
          </Text>
        </ElevatedCard>

        <ElevatedCard style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Quick setup</Text>
          {STEPS.map((step, index) => (
            <View key={step} style={[styles.stepRow, index === STEPS.length - 1 && styles.stepRowLast]}>
              <View style={styles.stepIndex}>
                <Text style={styles.stepIndexText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
              <ChevronRight size={18} color={COLORS.textLight} />
            </View>
          ))}
        </ElevatedCard>

        <View style={styles.footer}>
          <PrimaryButton label="Open Settings" onPress={handleOpenSettings} />
          <TouchableOpacity style={styles.secondaryAction} onPress={checkPermissionAndNavigate} activeOpacity={0.8}>
            <Text style={styles.secondaryActionText}>I already enabled it</Text>
          </TouchableOpacity>
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  hero: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  heroBadge: {
    width: 96,
    height: 96,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: SPACING.md,
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textMedium,
    textAlign: 'center',
  },
  infoCard: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    marginLeft: SPACING.sm,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  infoBody: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textMedium,
  },
  stepsCard: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepRowLast: {
    borderBottomWidth: 0,
  },
  stepIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySurface,
    marginRight: SPACING.md,
  },
  stepIndexText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textDark,
    marginRight: SPACING.sm,
  },
  footer: {
    marginTop: 'auto',
  },
  secondaryAction: {
    marginTop: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
});

export default NotificationPermissionScreen;

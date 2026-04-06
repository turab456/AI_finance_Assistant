import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  NativeModules,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Info, Wallet } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import PageHeader from '../../components/ui/PageHeader';
import ElevatedCard from '../../components/ui/ElevatedCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { COLORS, SHADOW, SPACING } from '../../utils/theme';
import { authApi } from '../../services/api';
import storage from '../../services/storage';
import { capitalize, formatCurrency } from '../../utils/format';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SLIDER_WIDTH = SCREEN_WIDTH - SPACING.lg * 4;
const MAX_INCOME = 200000;
const INITIAL_INCOME = 50000;

const MonthlyIncomeStep = ({ navigation, route }: any) => {
  const { incomeType } = route?.params || {};
  const [income, setIncome] = useState(INITIAL_INCOME);
  const [loading, setLoading] = useState(false);

  const initialX = (INITIAL_INCOME / MAX_INCOME) * SLIDER_WIDTH;
  const scrollX = useRef(new Animated.Value(initialX)).current;
  const lastScrollX = useRef(initialX);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        let newX = lastScrollX.current + gestureState.dx;

        if (newX < 0) {
          newX = 0;
        }
        if (newX > SLIDER_WIDTH) {
          newX = SLIDER_WIDTH;
        }

        scrollX.setValue(newX);
        const calculatedIncome = Math.round(((newX / SLIDER_WIDTH) * MAX_INCOME) / 1000) * 1000;
        setIncome(calculatedIncome);
      },
      onPanResponderRelease: () => {
        scrollX.stopAnimation(value => {
          lastScrollX.current = value;
        });
      },
    }),
  ).current;

  const handleContinue = async () => {
    try {
      setLoading(true);
      const response = await authApi.createUser(null as any, income);
      const user = response.user || response;
      const profile = (await storage.getUserProfile()) || {};

      await storage.setUserProfile({
        ...profile,
        id: user.id,
        phone: user.phone || null,
        monthly_income: income,
        incomeType,
      });

      const { NotificationPermissionModule } = NativeModules;
      if (NotificationPermissionModule) {
        NotificationPermissionModule.setUserId(user.id);
        if (response.token) {
          NotificationPermissionModule.setAuthToken(response.token);
        }
      }

      navigation.navigate('SpendingGoal', {
        incomeType,
        incomeValue: income,
        incomeRange: income >= MAX_INCOME ? '2L+' : formatCurrency(income),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      const response = await authApi.createUser(null as any, 0);
      const user = response.user || response;
      const profile = (await storage.getUserProfile()) || {};

      await storage.setUserProfile({
        ...profile,
        id: user.id,
        phone: user.phone || null,
        monthly_income: 0,
        incomeType: incomeType || 'not_set',
      });

      const { NotificationPermissionModule } = NativeModules;
      if (NotificationPermissionModule) {
        NotificationPermissionModule.setUserId(user.id);
        if (response.token) {
          NotificationPermissionModule.setAuthToken(response.token);
        }
      }

      navigation.navigate('SpendingGoal', { incomeType, incomeRange: null });
    } catch (error) {
      navigation.navigate('SpendingGoal', { incomeType, incomeRange: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen safeAreaStyle={styles.safeArea}>
      <PageHeader
        eyebrow="Step 2 of 3"
        title="Set your monthly income"
        subtitle="A rough estimate is enough. You can refine it later from the profile screen."
        onBack={() => navigation.goBack()}
      />

      <View style={styles.progressTrack}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
      </View>

      <View style={styles.content}>
        <View style={styles.selectionPill}>
          <Text style={styles.selectionPillText}>Income source: {capitalize(incomeType) || 'Not set'}</Text>
        </View>

        <ElevatedCard style={styles.sliderCard}>
          <View style={styles.sliderHeader}>
            <View style={styles.sliderIcon}>
              <Wallet size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.sliderLabel}>Estimated monthly income</Text>
          </View>

          <Text style={styles.amountText}>{income >= MAX_INCOME ? `${formatCurrency(MAX_INCOME)}+` : formatCurrency(income)}</Text>
          <Text style={styles.amountHint}>Drag the slider to the closest amount</Text>

          <View style={styles.trackContainer}>
            <View style={styles.trackBackground} />
            <Animated.View style={[styles.trackFill, { width: scrollX }]} />
            <Animated.View {...panResponder.panHandlers} style={[styles.thumb, { transform: [{ translateX: scrollX }] }]} />
          </View>

          <View style={styles.labelsContainer}>
            <Text style={styles.label}>{formatCurrency(0)}</Text>
            <Text style={styles.label}>{formatCurrency(100000)}</Text>
            <Text style={styles.label}>{formatCurrency(200000)}+</Text>
          </View>
        </ElevatedCard>

        <View style={styles.noteRow}>
          <Info size={16} color={COLORS.textLight} />
          <Text style={styles.noteText}>This estimate improves balance forecasts and spend alerts.</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={handleContinue} loading={loading} />
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator size="small" color={COLORS.textLight} /> : <Text style={styles.skipText}>Skip for now</Text>}
        </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  selectionPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    backgroundColor: COLORS.primarySurface,
    marginBottom: SPACING.lg,
  },
  selectionPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sliderCard: {
    padding: SPACING.xl,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  sliderIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySurface,
    marginRight: SPACING.md,
  },
  sliderLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  amountText: {
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  amountHint: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.textMedium,
  },
  trackContainer: {
    width: SLIDER_WIDTH,
    height: 40,
    justifyContent: 'center',
    marginTop: SPACING.xl,
    alignSelf: 'center',
  },
  trackBackground: {
    width: '100%',
    height: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 999,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 12,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  thumb: {
    position: 'absolute',
    left: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.primary,
    ...SHADOW,
  },
  labelsContainer: {
    width: SLIDER_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    marginTop: SPACING.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  noteText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textMedium,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  skipButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textLight,
  },
});

export default MonthlyIncomeStep;

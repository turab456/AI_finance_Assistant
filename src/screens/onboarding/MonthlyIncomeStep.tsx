import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  PanResponder,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
  NativeModules
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '../../utils/theme';
import { authApi } from '../../services/api';
import storage from '../../services/storage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SLIDER_WIDTH = SCREEN_WIDTH - SPACING.lg * 4;
const MAX_INCOME = 200000;

const MonthlyIncomeStep = ({ navigation, route }: any) => {
  const { incomeType } = route?.params || {};
  const [income, setIncome] = useState(50000);
  const [loading, setLoading] = useState(false);

  const scrollX = useRef(new Animated.Value((50000 / MAX_INCOME) * SLIDER_WIDTH)).current;
  const lastScrollX = useRef((50000 / MAX_INCOME) * SLIDER_WIDTH);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        let newX = lastScrollX.current + gestureState.dx;
        if (newX < 0) newX = 0;
        if (newX > SLIDER_WIDTH) newX = SLIDER_WIDTH;

        scrollX.setValue(newX);
        const calculatedIncome = Math.round((newX / SLIDER_WIDTH) * MAX_INCOME / 1000) * 1000;
        setIncome(calculatedIncome);
      },
      onPanResponderRelease: () => {
        // @ts-ignore
        lastScrollX.current = scrollX._value;
      },
    })
  ).current;

  const handleContinue = async () => {
    try {
      setLoading(true);
      const response = await authApi.createUser(null as any, income);
      const user = response.user || response;

      // Store user info
      const profile = await storage.getUserProfile() || {};
      await storage.setUserProfile({
        ...profile,
        id: user.id,
        phone: user.phone || null,
        monthly_income: income,
        incomeType
      });

      // Sync to native SharedPreferences for NotificationService
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
        incomeRange: income >= MAX_INCOME ? '2L+' : `₹${(income / 1000).toFixed(0)}k`
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

      const profile = await storage.getUserProfile() || {};
      await storage.setUserProfile({
        ...profile,
        id: user.id,
        phone: user.phone || null,
        monthly_income: 0,
        incomeType: incomeType || 'not_set'
      });

      // Sync to native SharedPreferences for NotificationService
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.question}>Your monthly income?</Text>
          <Text style={styles.subQuestion}>Adjust the slider to set your approximate monthly earnings.</Text>
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.amountDisplay}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={styles.amountText}>{income.toLocaleString()}</Text>
            {income >= MAX_INCOME && <Text style={styles.plusSign}>+</Text>}
          </View>

          <View style={styles.trackContainer}>
            <View style={styles.trackBackground} />
            <Animated.View
              style={[
                styles.trackFill,
                { width: scrollX }
              ]}
            />
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.thumb,
                { transform: [{ translateX: scrollX }] }
              ]}
            />
          </View>

          <View style={styles.labelsContainer}>
            <Text style={styles.label}>₹0</Text>
            <Text style={styles.label}>₹1L</Text>
            <Text style={styles.label}>₹2L+</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, loading && { opacity: 0.7 }]}
            activeOpacity={0.8}
            onPress={handleContinue}
            disabled={loading}
          >
            <LinearGradient
              colors={['#4F46E5', '#3730A3']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.continueText}>CONTINUE</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    marginTop: SPACING.xl * 2,
    marginBottom: SPACING.xl,
  },
  question: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  subQuestion: {
    fontSize: 16,
    color: COLORS.textMedium,
    lineHeight: 22,
  },
  sliderContainer: {
    marginTop: SPACING.xl * 2,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xl * 2,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 4,
  },
  amountText: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  plusSign: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  trackContainer: {
    width: SLIDER_WIDTH,
    height: 40,
    justifyContent: 'center',
  },
  trackBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
  },
  trackFill: {
    height: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    position: 'absolute',
    left: -16,
    ...SHADOW,
    elevation: 5,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  labelsContainer: {
    width: SLIDER_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  label: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOW,
    elevation: 4,
    marginBottom: SPACING.md,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  skipButton: {
    paddingVertical: SPACING.md,
  },
  skipText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});

export default MonthlyIncomeStep;

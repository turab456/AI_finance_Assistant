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
  Image,
} from 'react-native';
import { Wallet } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { COLORS } from '../../utils/theme';
import { authApi } from '../../services/api';
import storage from '../../services/storage';
import { capitalize, formatCurrency } from '../../utils/format';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SLIDER_WIDTH = SCREEN_WIDTH - 80;
const MAX_INCOME = 200000;
const INITIAL_INCOME = 50000;

const PRIMARY = '#09356B';
const BG_COLOR = '#F1F5F9';

const MonthlyIncomeStep = ({ navigation, route }: any) => {
  const { incomeType } = route?.params || {};
  const [income, setIncome] = useState(INITIAL_INCOME);
  const [loadingAction, setLoadingAction] = useState<'continue' | 'skip' | null>(null);

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
      setLoadingAction('continue');
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
      setLoadingAction(null);
    }
  };

  const handleSkip = async () => {
    try {
      setLoadingAction('skip');
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
      setLoadingAction(null);
    }
  };

  return (
    <View style={styles.fullscreen}>
      {/* Full Screen Background Image */}
      <Image 
        source={require('../../assets/welcomeimg.jpg')} 
        style={styles.backgroundImage} 
        resizeMode="cover" 
      />

      <Screen safeAreaStyle={styles.safeArea} withContentWrapper={false}>
        <View style={styles.container}>
          
          <View style={styles.spacer} />

          {/* Bottom Card */}
          <View style={styles.bottomCard}>
            <View style={styles.cardContent}>
              
              <View style={styles.titleContainer}>
                <Text style={styles.eyebrow}>STEP 2 OF 3</Text>
                <Text style={styles.title}>Set your monthly income</Text>
                <Text style={styles.subtitle}>
                  A rough estimate is enough. You can refine it later.
                </Text>
              </View>

              <View style={styles.selectionPill}>
                <Text style={styles.selectionPillText}>Income source: {capitalize(incomeType) || 'Not set'}</Text>
              </View>

              <View style={styles.sliderCard}>
                <View style={styles.sliderHeader}>
                  <View style={styles.sliderIcon}>
                    <Wallet size={18} color={PRIMARY} />
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
              </View>

              <View style={styles.buttonContainer}>
                <PrimaryButton label="Continue" onPress={handleContinue} loading={loadingAction === 'continue'} disabled={!!loadingAction} />
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={!!loadingAction} activeOpacity={0.8}>
                  {loadingAction === 'skip' ? <ActivityIndicator size="small" color="#8A8A8A" /> : <Text style={styles.skipText}>Skip for now</Text>}
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </View>
      </Screen>
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#083368',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#083368',
  },
  container: {
    flex: 1,
  },
  spacer: {
    flex: 1, 
  },
  bottomCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 24, 
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
    width: '100%',
  },
  cardContent: {
    paddingHorizontal: 20, 
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20, 
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: PRIMARY,
    letterSpacing: 1.2,
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 22, 
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 28,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13, 
    color: '#8A8A8A',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  selectionPill: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F0F4F8',
    marginBottom: 20,
  },
  selectionPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  sliderCard: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sliderIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG_COLOR,
    marginRight: 12,
  },
  sliderLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  amountText: {
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  amountHint: {
    marginTop: 4,
    fontSize: 13,
    color: '#8A8A8A',
  },
  trackContainer: {
    width: SLIDER_WIDTH,
    height: 40,
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  trackBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 12,
    borderRadius: 999,
    backgroundColor: PRIMARY,
  },
  thumb: {
    position: 'absolute',
    left: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: PRIMARY,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  labelsContainer: {
    width: SLIDER_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    marginTop: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  buttonContainer: {
    marginTop: 10,
  },
  skipButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A8A8A',
  },
});

export default MonthlyIncomeStep;

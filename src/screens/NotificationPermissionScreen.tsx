import React, { useCallback, useEffect, useState } from 'react';
import { AppState, NativeModules, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, Alert } from 'react-native';
import { BellRing, ChevronRight, ShieldCheck } from 'lucide-react-native';
import Screen from '../components/ui/Screen';
import PrimaryButton from '../components/ui/PrimaryButton';
import { COLORS } from '../utils/theme';

const { NotificationPermissionModule } = NativeModules;

const STEPS = [
  'Tap the button below to open Android notification settings.',
  'Find and select AI Finance Assistant in the list.',
  'Enable notification access, then return to the app.',
];

const PRIMARY = '#09356B';
const BG_COLOR = '#F1F5F9';

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
    } else {
      Alert.alert(
        "Permission not detected",
        "We couldn't automatically verify that notification access is enabled.",
        [
          { text: "Check again", style: "cancel" },
          { text: "Proceed anyway", onPress: () => navigation.replace('Main') }
        ]
      );
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
    <View style={styles.fullscreen}>
      <Image 
        source={require('../assets/welcomeimg.jpg')} 
        style={styles.backgroundImage} 
        resizeMode="cover" 
      />

      <Screen safeAreaStyle={styles.safeArea} withContentWrapper={false}>
        <View style={styles.container}>
          
          <View style={styles.spacer} />

          <View style={styles.bottomCard}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardContent}
              bounces={true}
            >
              
              <View style={styles.titleContainer}>
                <View style={styles.heroBadge}>
                  <BellRing size={32} color={PRIMARY} />
                </View>
                <Text style={styles.eyebrow}>CRITICAL STEP</Text>
                <Text style={styles.title}>Enable notifications</Text>
                <Text style={styles.subtitle}>
                  This keeps tracking automatic by letting the assistant read your verified bank alerts quietly in the background.
                </Text>
              </View>

              <View style={styles.infoBox}>
                <View style={styles.infoHeader}>
                  <ShieldCheck size={18} color={PRIMARY} />
                  <Text style={styles.infoTitle}>Why this matters</Text>
                </View>
                <Text style={styles.infoBody}>
                  Once enabled, the app captures spending data frictionlessly and keeps your trends perfectly accurate without any manual entry.
                </Text>
              </View>

              <View style={styles.stepsContainer}>
                <Text style={styles.stepsTitle}>Quick setup</Text>
                {STEPS.map((step, index) => (
                  <View key={step} style={[styles.stepRow, index === STEPS.length - 1 && styles.stepRowLast]}>
                    <View style={styles.stepIndex}>
                      <Text style={styles.stepIndexText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                    <ChevronRight size={18} color={PRIMARY} />
                  </View>
                ))}
              </View>

              <View style={styles.buttonContainer}>
                <PrimaryButton label="Open Settings" onPress={handleOpenSettings} />
                <TouchableOpacity style={styles.secondaryAction} onPress={checkPermissionAndNavigate} activeOpacity={0.8}>
                  <Text style={styles.secondaryActionText}>I already enabled it</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
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
    flex: 0.15, 
  },
  bottomCard: {
    flex: 0.85, 
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 24, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
    width: '100%',
  },
  cardContent: {
    paddingHorizontal: 20, 
    paddingBottom: 32,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20, 
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: BG_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  infoBox: {
    backgroundColor: BG_COLOR,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoTitle: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
  },
  infoBody: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B', 
  },
  stepsContainer: {
    paddingHorizontal: 4,
  },
  stepsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepRowLast: {
    borderBottomWidth: 0,
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    marginRight: 12,
  },
  stepIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#1A1A1A',
    marginRight: 8,
  },
  buttonContainer: {
    marginTop: 24,
  },
  secondaryAction: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: COLORS.white,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8A8A8A',
  },
});

export default NotificationPermissionScreen;

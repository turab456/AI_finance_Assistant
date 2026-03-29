import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  AppState,
  NativeModules
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BellRing } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, SHADOW } from '../utils/theme';

const { NotificationPermissionModule } = NativeModules;

const NotificationPermissionScreen = ({ navigation }: any) => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        checkPermissionAndNavigate();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  const checkPermissionAndNavigate = async () => {
    if (NotificationPermissionModule) {
      const isEnabled = await NotificationPermissionModule.isNotificationServiceEnabled();
      if (isEnabled) {
        navigation.replace('Main');
      }
    }
  };

  const handleOpenSettings = () => {
    if (NotificationPermissionModule) {
      NotificationPermissionModule.openNotificationSettings();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={styles.circle}>
              <BellRing size={40} color={COLORS.primary} fill={COLORS.primary} />
            </LinearGradient>
          </View>
          
          <Text style={styles.title}>Notification Access</Text>
          <Text style={styles.subtitle}>
            To track your expenses automatically, please allow access to notifications from your bank apps.
          </Text>
          <View style={styles.instructionBox}>
             <Text style={styles.instructionText}>
                1. Tap the button below to open Settings.
             </Text>
             <Text style={styles.instructionText}>
                2. Find and select AI Finance Assistant.
             </Text>
             <Text style={styles.instructionText}>
                3. Toggle the switch to "Allow notification access".
             </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleOpenSettings}
          >
            <LinearGradient 
              colors={GRADIENTS.primary} 
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Open Settings</Text>
            </LinearGradient>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  instructionBox: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    ...SHADOW,
    elevation: 2,
  },
  instructionText: {
    fontSize: 15,
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
    fontWeight: '500',
    lineHeight: 22,
  },
  footer: {
    paddingBottom: SPACING.lg,
  },
  button: {
    width: '100%',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOW,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default NotificationPermissionScreen;

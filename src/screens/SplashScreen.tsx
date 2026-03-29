import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, NativeModules } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS } from '../utils/theme';
import storage from '../services/storage';
import { authApi } from '../services/api';
// @ts-ignore
import { API_URL } from '@env';

const { NotificationPermissionModule } = NativeModules;

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const checkOnboarding = async () => {
      setTimeout(async () => {
        const onboardingCompleted = await storage.getOnboardingCompleted();

        if (onboardingCompleted) {
          // 🔄 Refresh user profile from backend on every app open
          try {
            const token = await storage.getToken();
            if (token) {
              const me = await authApi.getMe();
              const existing = await storage.getUserProfile() || {};
              await storage.setUserProfile({
                ...existing,
                id: me.id,
                phone: me.phone,
                monthly_income: me.monthly_income,
              });

              // Sync to native SharedPreferences for NotificationService
              if (NotificationPermissionModule) {
                NotificationPermissionModule.setUserId(me.id);
                NotificationPermissionModule.setAuthToken(token);
                if (API_URL) {
                  NotificationPermissionModule.setApiUrl(API_URL);
                }
              }
            }
          } catch (e) {
            // Silently fail — use cached profile if /me fails
            console.warn('Could not refresh user from /me', e);
          }

          if (NotificationPermissionModule) {
            const isEnabled = await NotificationPermissionModule.isNotificationServiceEnabled();
            if (isEnabled) {
              navigation.replace('Main');
            } else {
              navigation.replace('NotificationPermission');
            }
          } else {
            navigation.replace('Main');
          }
        } else {
          navigation.replace('Onboarding');
        }
      }, 800);
    };

    checkOnboarding();
  }, [navigation]);

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <View style={styles.content}>
        {/* Placeholder for Logo */}
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
  },
});

export default SplashScreen;

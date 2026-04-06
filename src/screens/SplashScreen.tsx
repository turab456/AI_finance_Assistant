import React, { useEffect } from 'react';
import { ActivityIndicator, NativeModules, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Sparkles, Wallet } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING } from '../utils/theme';
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
          try {
            const token = await storage.getToken();
            if (token) {
              const me = await authApi.getMe();
              const existing = (await storage.getUserProfile()) || {};

              await storage.setUserProfile({
                ...existing,
                id: me.id,
                phone: me.phone,
                monthly_income: me.monthly_income,
                current_balance: me.current_balance ?? existing.current_balance,
              });

              if (NotificationPermissionModule) {
                NotificationPermissionModule.setUserId(me.id);
                NotificationPermissionModule.setAuthToken(token);
                if (API_URL) {
                  NotificationPermissionModule.setApiUrl(API_URL);
                }
              }
            }
          } catch (error) {
            console.warn('Could not refresh user from /me', error);
          }

          if (NotificationPermissionModule) {
            const isEnabled = await NotificationPermissionModule.isNotificationServiceEnabled();
            navigation.replace(isEnabled ? 'Main' : 'NotificationPermission');
            return;
          }

          navigation.replace('Main');
          return;
        }

        navigation.replace('Onboarding');
      }, 800);
    };

    checkOnboarding();
  }, [navigation]);

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <View style={styles.logoBadge}>
            <Wallet size={28} color={COLORS.white} />
          </View>
          <View style={styles.sparkleBadge}>
            <Sparkles size={14} color={COLORS.primaryDark} />
          </View>
        </View>

        <Text style={styles.title}>AI Finance</Text>
        <Text style={styles.subtitle}>Syncing your profile and preparing a cleaner monthly overview.</Text>

        <View style={styles.loaderRow}>
          <ActivityIndicator color={COLORS.white} />
          <Text style={styles.loaderText}>Loading workspace</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  glowTop: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -60,
    left: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 32,
    padding: SPACING.xl,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  badgeRow: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sparkleBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.white,
  },
  subtitle: {
    marginTop: SPACING.sm,
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.8)',
  },
  loaderRow: {
    marginTop: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loaderText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default SplashScreen;

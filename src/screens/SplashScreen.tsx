import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS } from '../utils/theme';
import storage from '../services/storage';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const checkOnboarding = async () => {
      // Simulate splash time
      setTimeout(async () => {
        const onboardingCompleted = await storage.getOnboardingCompleted();
        if (onboardingCompleted) {
          navigation.replace('Main');
        } else {
          navigation.replace('Onboarding');
        }
      }, 2000);
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

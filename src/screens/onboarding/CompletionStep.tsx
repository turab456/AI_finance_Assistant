import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, SHADOW } from '../../utils/theme';
import storage from '../../services/storage';

const { width } = Dimensions.get('window');

const CompletionStep = ({ navigation, route }: any) => {
  const { incomeType, incomeRange, spendingGoal } = route?.params || {};

  const handleFinish = async () => {
    const userProfile = { incomeType, incomeRange, spendingGoal, createdAt: new Date().toISOString() };
    await storage.setUserProfile(userProfile);
    await storage.setOnboardingCompleted(true);
    
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
            <View style={styles.iconContainer}>
              <LinearGradient colors={GRADIENTS.income} style={styles.circle}>
                  <Text style={styles.checkIcon}>✓</Text>
              </LinearGradient>
            </View>
          <Text style={styles.title}>Setup complete</Text>
          <Text style={styles.subtitle}>
              Your finance advisor is ready! We'll now start tracking your spending through notifications.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleFinish}
          >
            <LinearGradient 
              colors={GRADIENTS.primary} 
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Go to Dashboard</Text>
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
    justifyContent: 'center',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW,
  },
  checkIcon: {
    fontSize: 40,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.xl,
  },
  footer: {
    paddingBottom: SPACING.lg,
  },
  button: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOW,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CompletionStep;

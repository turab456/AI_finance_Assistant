import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, SHADOW } from '../../utils/theme';

const WelcomeStep = ({ navigation, onNext }: any) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.circle} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Let’s set up your finance profile</Text>
          <Text style={styles.subtitle}>Our AI-powered engine will help you track and save automatically.</Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('IncomeType')}
          >
            <LinearGradient 
              colors={GRADIENTS.primary} 
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Start (30 sec setup)</Text>
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
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default WelcomeStep;

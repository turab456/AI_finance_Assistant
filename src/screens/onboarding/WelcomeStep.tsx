import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Screen from '../../components/ui/Screen';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { COLORS } from '../../utils/theme';

const WelcomeStep = ({ navigation }: any) => (
  <View style={styles.fullscreen}>
    {/* Full Screen Background Image */}
    <Image
      source={require('../../assets/welcomeimg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    />

    <Screen safeAreaStyle={styles.safeArea} withContentWrapper={false}>
      <View style={styles.container}>
        {/* Fill the top space so bottom card stays at bottom */}
        <View style={styles.spacer} />

        {/* Bottom Card (Full Width and attached to bottom) */}
        <View style={styles.bottomCard}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Manage your daily{'\n'}life expenses</Text>
            <Text style={styles.subtitle}>
              Expense Tracker is a simple and efficient personal finance management app that allows you to track your daily expenses and income.
            </Text>
          </View>

          {/* CTA Button */}
          <PrimaryButton
            label="Get started"
            onPress={() => navigation.navigate('IncomeType')}
          />
        </View>
      </View>
    </Screen>
  </View>
);

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#FDF1D1', // Fallback background color matching the image
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
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  bottomCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 48, // ample bottom padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
    width: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
});

export default WelcomeStep;

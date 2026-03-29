import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, SHADOW } from '../../utils/theme';

const SPENDING_GOALS = [
  { id: 'save', label: 'Save money' },
  { id: 'track', label: 'Track spending' },
  { id: 'reduce', label: 'Reduce overspending' },
  { id: 'build', label: 'Build savings' },
];

const SpendingGoalStep = ({ navigation, route }: any) => {
  const { incomeType, incomeRange } = route?.params || {};

  const handleSelect = (spendingGoal: string) => {
    navigation.navigate('Completion', { incomeType, incomeRange, spendingGoal });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.question}>What do you want help with?</Text>
          <Text style={styles.subQuestion}>Your choice helps our AI prioritize specific goals for you.</Text>
        </View>

        <View style={styles.optionsList}>
          {SPENDING_GOALS.map((item) => (
            <TouchableOpacity 
              key={item.id}
              style={styles.optionItem}
              activeOpacity={0.7}
              onPress={() => handleSelect(item.id)}
            >
              <Text style={styles.optionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
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
    marginVertical: SPACING.xl,
  },
  question: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  subQuestion: {
    fontSize: 14,
    color: COLORS.textMedium,
  },
  optionsList: {
    marginTop: SPACING.lg,
  },
  optionItem: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOW,
    elevation: 3,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
});

export default SpendingGoalStep;

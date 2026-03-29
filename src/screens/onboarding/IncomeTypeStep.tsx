import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, SHADOW } from '../../utils/theme';

const INCOME_TYPES = [
  { id: 'salary', label: 'Salary', icon: '💼' },
  { id: 'business', label: 'Business', icon: '🏢' },
  { id: 'freelance', label: 'Freelance', icon: '🎨' },
  { id: 'mixed', label: 'Mixed', icon: '🔄' },
];

const IncomeTypeStep = ({ navigation }: any) => {
  const handleSelect = (incomeType: string) => {
    // We could store it here or in localized state
    navigation.navigate('MonthlyIncome', { incomeType });
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8}
      onPress={() => handleSelect(item.id)}
    >
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.label}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.question}>Where does most of your money come from?</Text>
          <Text style={styles.subQuestion}>Select one option to personalize your experience.</Text>
        </View>

        <View style={styles.grid}>
          {INCOME_TYPES.map((item) => (
            <TouchableOpacity 
              key={item.id}
              style={styles.card} 
              activeOpacity={0.8}
              onPress={() => handleSelect(item.id)}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={styles.label}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          {/* Progress or other indicators can go here */}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  card: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOW,
    elevation: 3,
  },
  icon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
});

export default IncomeTypeStep;

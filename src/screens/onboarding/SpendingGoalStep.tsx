import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Target, TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { COLORS } from '../../utils/theme';
import { capitalize } from '../../utils/format';

const SPENDING_GOALS = [
  { id: 'save', label: 'Save money', description: 'Highlight cash you can keep aside each month.', icon: Wallet },
  { id: 'track', label: 'Track spending', description: 'Break down categories and surface patterns faster.', icon: TrendingUp },
  { id: 'reduce', label: 'Reduce overspending', description: 'Spot pressure areas before they get too large.', icon: TrendingDown },
  { id: 'build', label: 'Build savings', description: 'Stay focused on a steadier long-term reserve.', icon: Target },
];

const PRIMARY = '#09356B';
const BG_COLOR = '#F1F5F9';

const SpendingGoalStep = ({ navigation, route }: any) => {
  const { incomeType, incomeRange } = route?.params || {};
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (spendingGoal: string) => {
    setSelectedId(spendingGoal);
  };

  const handleNext = () => {
    if (selectedId) {
      navigation.navigate('Completion', { incomeType, incomeRange, spendingGoal: selectedId });
    }
  };

  return (
    <View style={styles.fullscreen}>
      {/* Full Screen Background Image */}
      <Image 
        source={require('../../assets/welcomeimg.jpg')} 
        style={styles.backgroundImage} 
        resizeMode="cover" 
      />

      <Screen safeAreaStyle={styles.safeArea} withContentWrapper={false}>
        <View style={styles.container}>
          
          <View style={styles.spacer} />

          {/* Bottom Card */}
          <View style={styles.bottomCard}>
            <View style={styles.cardContent}>
              
              <View style={styles.titleContainer}>
                <Text style={styles.eyebrow}>STEP 3 OF 3</Text>
                <Text style={styles.title}>What should the app help you improve first?</Text>
                <Text style={styles.subtitle}>
                  Choose one focus area. This shapes the insights and trend callouts you see on the dashboard.
                </Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>Source: {capitalize(incomeType) || 'Not set'}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>Income: {incomeRange || 'Set later'}</Text>
                </View>
              </View>

              <View style={styles.listContainer}>
                {SPENDING_GOALS.map(item => {
                  const Icon = item.icon;
                  const isSelected = selectedId === item.id;

                  return (
                    <TouchableOpacity 
                      key={item.id} 
                      activeOpacity={0.8} 
                      onPress={() => handleSelect(item.id)}
                      style={[
                        styles.optionCard,
                        isSelected && styles.optionCardSelected
                      ]}
                    >
                      <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                        <Icon size={20} color={isSelected ? COLORS.white : '#1A1A1A'} />
                      </View>

                      <View style={styles.optionTextContainer}>
                        <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                          {item.label}
                        </Text>
                        <Text style={[styles.optionDescription, isSelected && styles.optionDescriptionSelected]}>
                          {item.description}
                        </Text>
                      </View>

                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.buttonContainer}>
                <PrimaryButton 
                  label="Continue" 
                  onPress={handleNext} 
                  disabled={!selectedId} 
                />
              </View>

            </View>
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
    flex: 1, 
  },
  bottomCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 24, 
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
    width: '100%',
  },
  cardContent: {
    paddingHorizontal: 20, 
  },
  titleContainer: {
    alignItems: 'center',
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  metaPill: {
    marginHorizontal: 4,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F0F4F8',
  },
  metaPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  listContainer: {
    gap: 10, 
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16, 
    padding: 10, 
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionCardSelected: {
    borderColor: PRIMARY,
    borderWidth: 2,
    backgroundColor: '#F0F4F8', 
  },
  iconContainer: {
    width: 44, 
    height: 44,
    borderRadius: 14,
    backgroundColor: BG_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconContainerSelected: {
    backgroundColor: PRIMARY,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16, 
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#1A1A1A',
  },
  optionDescription: {
    fontSize: 12, 
    color: '#8A8A8A',
    lineHeight: 18,
  },
  optionDescriptionSelected: {
    color: '#8A8A8A',
  },
  radioCircle: {
    width: 22, 
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14, 
  },
  radioCircleSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default SpendingGoalStep;

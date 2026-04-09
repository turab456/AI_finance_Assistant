import React, { useState } from 'react';
import { NativeModules, StyleSheet, Text, View, Image } from 'react-native';
import { BellRing, CheckCircle2, Target, Wallet } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { COLORS } from '../../utils/theme';
import storage from '../../services/storage';
import { capitalize } from '../../utils/format';

const PRIMARY = '#09356B';
const BG_COLOR = '#F1F5F9';

const CompletionStep = ({ navigation, route }: any) => {
  const { incomeType, incomeRange, spendingGoal } = route?.params || {};
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    try {
      setLoading(true);
      const existingProfile = (await storage.getUserProfile()) || {};

      await storage.setUserProfile({
        ...existingProfile,
        incomeType: incomeType || existingProfile.incomeType || 'not_set',
        incomeRange: incomeRange ?? existingProfile.incomeRange ?? null,
        spendingGoal: spendingGoal || existingProfile.spendingGoal || null,
        createdAt: existingProfile.createdAt || new Date().toISOString(),
      });
      await storage.setOnboardingCompleted(true);

      const { NotificationPermissionModule } = NativeModules;
      if (NotificationPermissionModule) {
        const isEnabled = await NotificationPermissionModule.isNotificationServiceEnabled();
        navigation.replace(isEnabled ? 'Main' : 'NotificationPermission');
        return;
      }

      navigation.replace('Main');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.fullscreen}>
      <Image 
        source={require('../../assets/welcomeimg.jpg')} 
        style={styles.backgroundImage} 
        resizeMode="cover" 
      />

      <Screen safeAreaStyle={styles.safeArea} withContentWrapper={false}>
        <View style={styles.container}>
          
          <View style={styles.spacer} />

          <View style={styles.bottomCard}>
            <View style={styles.cardContent}>
              
              <View style={styles.titleContainer}>
                <View style={styles.heroBadge}>
                  <CheckCircle2 size={32} color={PRIMARY} />
                </View>
                <Text style={styles.eyebrow}>ALL DONE</Text>
                <Text style={styles.title}>Your dashboard is ready</Text>
                <Text style={styles.subtitle}>
                  Everything is set for cleaner tracking. You can tweak these targets later from the Profile screen at any time.
                </Text>
              </View>

              <View style={styles.listContainer}>
                
                <View style={styles.summaryRow}>
                  <View style={styles.iconContainer}>
                    <Wallet size={18} color={PRIMARY} />
                  </View>
                  <View style={styles.summaryCopy}>
                    <Text style={styles.summaryLabel}>Income source</Text>
                    <Text style={styles.summaryValue}>{capitalize(incomeType) || 'Not set'}</Text>
                  </View>
                </View>

                <View style={styles.summaryRow}>
                  <View style={styles.iconContainer}>
                    <BellRing size={18} color={PRIMARY} />
                  </View>
                  <View style={styles.summaryCopy}>
                    <Text style={styles.summaryLabel}>Income amount</Text>
                    <Text style={styles.summaryValue}>{incomeRange || 'Set later'}</Text>
                  </View>
                </View>

                <View style={[styles.summaryRow, styles.summaryRowLast]}>
                  <View style={styles.iconContainer}>
                    <Target size={18} color={PRIMARY} />
                  </View>
                  <View style={styles.summaryCopy}>
                    <Text style={styles.summaryLabel}>Primary focus</Text>
                    <Text style={styles.summaryValue}>{capitalize(spendingGoal?.replace('_', ' ')) || 'Not set'}</Text>
                  </View>
                </View>

              </View>

              <View style={styles.buttonContainer}>
                <PrimaryButton 
                  label="Open dashboard" 
                  onPress={handleFinish} 
                  loading={loading}
                  disabled={loading}
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
    backgroundColor: 'transparent',
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
    marginBottom: 8, 
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: BG_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
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
  listContainer: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 44, 
    height: 44,
    borderRadius: 14,
    backgroundColor: BG_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default CompletionStep;

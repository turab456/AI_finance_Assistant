import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { User, Phone, CheckCircle2, ChevronRight, LogOut, Wallet } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS } from '../../utils/theme';
import { authApi } from '../../services/api';
import storage from '../../services/storage';
import Screen from '../../components/ui/Screen';
import ElevatedCard from '../../components/ui/ElevatedCard';

const ProfileScreen = () => {
  const [profile, setProfile] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [balance, setBalance] = useState('');
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [loading, setLoading] = useState(false);
  const sanitizePhone = (value: string) => value.replace(/\D/g, '');

  const loadProfile = useCallback(async () => {
    try {
      const data = await storage.getUserProfile();
      setProfile(data);
      if (data?.phone) setPhone(data.phone);
      if (data?.monthly_income !== undefined) setSalary(data.monthly_income.toString());
      if (data?.current_balance !== undefined && data?.current_balance !== null) {
        setBalance(data.current_balance.toString());
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const persistProfile = useCallback(async (patch: Record<string, any>) => {
    const newProfile = { ...profile, ...patch };
    await storage.setUserProfile(newProfile);
    setProfile(newProfile);
  }, [profile]);

  const handleUpdatePhone = async () => {
    const normalizedPhone = sanitizePhone(phone);
    if (!normalizedPhone || normalizedPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      const userId = profile?.id;
      if (!userId) throw new Error('User ID missing');
      await authApi.updateUserPhone(userId, normalizedPhone);
      await persistProfile({ phone: normalizedPhone });
      setPhone(normalizedPhone);
      setIsEditing(false);
      Alert.alert('Success', 'Phone number updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSalary = async () => {
    const salaryNum = Number(salary.trim());
    if (isNaN(salaryNum) || salaryNum < 0) {
      Alert.alert('Error', 'Please enter a valid salary');
      return;
    }

    try {
      setLoading(true);
      const userId = profile?.id;
      if (!userId) throw new Error('User ID missing');
      await authApi.updateUserSalary(userId, salaryNum);
      await persistProfile({ monthly_income: salaryNum });
      setSalary(String(salaryNum));
      setIsEditingSalary(false);
      Alert.alert('Success', 'Salary updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update salary');
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateBalance = async () => {
    const balanceNum = Number(balance.trim());

    if (isNaN(balanceNum) || balanceNum < 0) {
      Alert.alert('Error', 'Please enter a valid balance');
      return;
    }

    try {
      setLoading(true);
      const userId = profile?.id;
      if (!userId) throw new Error('User ID missing');
      await authApi.updateUserBalance(userId, balanceNum);
      await persistProfile({ current_balance: balanceNum });
      setBalance(String(balanceNum));
      setIsEditingBalance(false);
      Alert.alert('Success', 'Balance updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update balance');
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout? This will clear your experimental data.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          try {
            await storage.clear();
          } catch (error) {
            Alert.alert('Error', 'Logout failed. Please try again.');
          }
          // In a real app, you'd navigate back to splash or onboarding
          // navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
        }
      }
    ]);
  };

  return (
    <Screen safeAreaStyle={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.headerTitle}>Profile</Text>

          {/* User Header */}
          <ElevatedCard style={styles.profileHeader}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.avatar}>
              <User color={COLORS.white} size={40} />
            </LinearGradient>
            <View style={styles.headerText}>
              <Text style={styles.userName}>{profile?.name || 'Sufi Turab'}</Text>
              <Text style={styles.userRole}>Premium Member</Text>
            </View>
          </ElevatedCard>

          {/* Stats Section */}
          <View style={styles.statsRow}>
            <ElevatedCard style={styles.statBox}>
              <Wallet size={20} color={COLORS.primary} />
              {isEditingBalance ? (
                <View style={styles.editSalaryRow}>
                  <TextInput
                    style={styles.salaryInput}
                    value={balance}
                    onChangeText={setBalance}
                    keyboardType="numeric"
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleUpdateBalance}>
                    {loading ? <ActivityIndicator size="small" /> : <CheckCircle2 size={20} color={COLORS.income} />}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setIsEditingBalance(true)}>
                  <Text style={styles.statValue}>
                    ₹{(profile?.current_balance || 0).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              )}
              <Text style={styles.statLabel}>Current Balance</Text>
            </ElevatedCard>
            <ElevatedCard style={styles.statBox}>
              {isEditingSalary ? (
                <View style={styles.editSalaryRow}>
                  <TextInput
                    style={styles.salaryInput}
                    value={salary}
                    onChangeText={setSalary}
                    keyboardType="numeric"
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleUpdateSalary}>
                    {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <CheckCircle2 size={20} color={COLORS.income} />}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setIsEditingSalary(true)}>
                  <Text style={styles.statValue}>₹{(profile?.monthly_income || 0).toLocaleString()}</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.statLabel}>Monthly Income</Text>
            </ElevatedCard>
            <ElevatedCard style={styles.statBox}>
              <Text style={styles.statValue}>{profile?.incomeType || 'Salary'}</Text>
              <Text style={styles.statLabel}>Source</Text>
            </ElevatedCard>
          </View>

          {/* Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <ElevatedCard style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Phone size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      autoFocus
                    />
                  ) : (
                    <Text style={styles.infoValue}>{profile?.phone || 'Not set'}</Text>
                  )}
                </View>

                {isEditing ? (
                  <TouchableOpacity onPress={handleUpdatePhone}>
                    {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <CheckCircle2 size={24} color={COLORS.income} />}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Text style={styles.editText}>Change</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ElevatedCard>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            <ElevatedCard style={styles.settingsItem}>
              <TouchableOpacity style={styles.settingsItemContent}>
              <Text style={styles.settingsLabel}>Notifications</Text>
              <ChevronRight size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </ElevatedCard>
            <ElevatedCard style={styles.settingsItem}>
              <TouchableOpacity style={styles.settingsItemContent}>
              <Text style={styles.settingsLabel}>Privacy Policy</Text>
              <ChevronRight size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </ElevatedCard>
            <ElevatedCard style={styles.settingsItem}>
              <TouchableOpacity style={styles.settingsItemContent} onPress={handleLogout}>
              <Text style={[styles.settingsLabel, { color: COLORS.expense }]}>Logout</Text>
              <LogOut size={20} color={COLORS.expense} />
              </TouchableOpacity>
            </ElevatedCard>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: SPACING.xl,
  },
  statBox: {
    width: '31.5%',
    minHeight: 132,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    paddingLeft: SPACING.xs,
  },
  infoCard: {
    overflow: 'hidden',
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  input: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingVertical: 2,
  },
  editText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  settingsItem: {
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  editSalaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  salaryInput: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    marginRight: 8,
    textAlign: 'center',
    minWidth: 80,
    paddingVertical: 0,
  },
});

export default ProfileScreen;

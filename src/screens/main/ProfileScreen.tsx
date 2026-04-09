import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CheckCircle2, ChevronRight, LogOut, Phone, TrendingUp, User, Wallet } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import ElevatedCard from '../../components/ui/ElevatedCard';
import PageHeader from '../../components/ui/PageHeader';
import { COLORS, GRADIENTS, SPACING } from '../../utils/theme';
import { authApi } from '../../services/api';
import storage from '../../services/storage';
import { capitalize, formatCurrency } from '../../utils/format';

const ProfileScreen = () => {
  const [profile, setProfile] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState('');
  const [balance, setBalance] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [loading, setLoading] = useState(false);

  const sanitizePhone = (value: string) => value.replace(/\D/g, '');

  const loadProfile = useCallback(async () => {
    try {
      const data = await storage.getUserProfile();
      setProfile(data);
      if (data?.phone) {
        setPhone(data.phone);
      }
      if (data?.monthly_income !== undefined) {
        setSalary(String(data.monthly_income));
      }
      if (data?.current_balance !== undefined && data?.current_balance !== null) {
        setBalance(String(data.current_balance));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const persistProfile = useCallback(
    async (patch: Record<string, any>) => {
      const newProfile = { ...profile, ...patch };
      await storage.setUserProfile(newProfile);
      setProfile(newProfile);
    },
    [profile],
  );

  const handleUpdatePhone = async () => {
    const normalizedPhone = sanitizePhone(phone);
    if (!normalizedPhone || normalizedPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      const userId = profile?.id;
      if (!userId) {
        throw new Error('User ID missing');
      }

      await authApi.updateUserPhone(userId, normalizedPhone);
      await persistProfile({ phone: normalizedPhone });
      setPhone(normalizedPhone);
      setIsEditingPhone(false);
      Alert.alert('Success', 'Phone number updated successfully.');
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
      if (!userId) {
        throw new Error('User ID missing');
      }

      await authApi.updateUserSalary(userId, salaryNum);
      await persistProfile({ monthly_income: salaryNum });
      setSalary(String(salaryNum));
      setIsEditingSalary(false);
      Alert.alert('Success', 'Salary updated successfully.');
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
      if (!userId) {
        throw new Error('User ID missing');
      }

      await authApi.updateUserBalance(userId, balanceNum);
      await persistProfile({ current_balance: balanceNum });
      setBalance(String(balanceNum));
      setIsEditingBalance(false);
      Alert.alert('Success', 'Balance updated successfully.');
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
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await storage.clear();
          } catch (error) {
            Alert.alert('Error', 'Logout failed. Please try again.');
          }
        },
      },
    ]);
  };

  const currentBalanceDisplay =
    profile?.current_balance !== undefined && profile?.current_balance !== null ? formatCurrency(profile.current_balance) : 'Not set';
  const monthlyIncomeDisplay =
    profile?.monthly_income !== undefined && profile?.monthly_income !== null ? formatCurrency(profile.monthly_income) : 'Not set';
  const incomeSourceDisplay = capitalize(profile?.incomeType) || 'Not set';

  const renderEditableValue = (
    value: string,
    isEditing: boolean,
    onChangeText: (text: string) => void,
    onSave: () => void,
    onStartEdit: () => void,
    keyboardType: 'default' | 'numeric' | 'phone-pad' = 'default',
    displayValue?: string,
  ) => {
    if (isEditing) {
      return (
        <View style={styles.inlineEditor}>
          <TextInput
            style={styles.inlineInput}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            autoFocus
            placeholderTextColor={COLORS.textLight}
          />
          <TouchableOpacity onPress={onSave} style={styles.inlineAction} activeOpacity={0.8}>
            {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <CheckCircle2 size={18} color={COLORS.income} />}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity onPress={onStartEdit} activeOpacity={0.8}>
        <Text style={styles.fieldValue}>{displayValue || value || 'Not set'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Screen safeAreaStyle={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <PageHeader eyebrow="Account" title="Profile" subtitle="Keep your finance identity clean and up to date." containerStyle={styles.header} />

          <LinearGradient colors={GRADIENTS.primary} style={styles.heroCard}>
            <View style={styles.avatar}>
              <User size={28} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.heroName}>{profile?.name || 'Finance Member'}</Text>
            <Text style={styles.heroSubtext}>{profile?.phone || 'Phone not added yet'}</Text>

            <View style={styles.heroPills}>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>{profile?.monthly_income ? 'Income ready' : 'Income pending'}</Text>
              </View>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>{profile?.current_balance ? 'Balance ready' : 'Balance pending'}</Text>
              </View>
            </View>
          </LinearGradient>

          <ElevatedCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Financial profile</Text>

            <View style={styles.fieldRow}>
              <View style={styles.fieldIconWrap}>
                <Wallet size={18} color={COLORS.primary} />
              </View>
              <View style={styles.fieldCopy}>
                <Text style={styles.fieldLabel}>Current balance</Text>
                {renderEditableValue(
                  balance,
                  isEditingBalance,
                  setBalance,
                  handleUpdateBalance,
                  () => setIsEditingBalance(true),
                  'numeric',
                  currentBalanceDisplay,
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldRow}>
              <View style={styles.fieldIconWrap}>
                <TrendingUp size={18} color={COLORS.primary} />
              </View>
              <View style={styles.fieldCopy}>
                <Text style={styles.fieldLabel}>Monthly income</Text>
                {renderEditableValue(
                  salary,
                  isEditingSalary,
                  setSalary,
                  handleUpdateSalary,
                  () => setIsEditingSalary(true),
                  'numeric',
                  monthlyIncomeDisplay,
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldRow}>
              <View style={styles.fieldIconWrap}>
                <User size={18} color={COLORS.primary} />
              </View>
              <View style={styles.fieldCopy}>
                <Text style={styles.fieldLabel}>Income source</Text>
                <Text style={styles.fieldValue}>{incomeSourceDisplay}</Text>
              </View>
            </View>
          </ElevatedCard>

          <ElevatedCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Contact information</Text>

            <View style={styles.fieldRow}>
              <View style={styles.fieldIconWrap}>
                <Phone size={18} color={COLORS.primary} />
              </View>
              <View style={styles.fieldCopy}>
                <Text style={styles.fieldLabel}>Phone number</Text>
                {renderEditableValue(phone, isEditingPhone, setPhone, handleUpdatePhone, () => setIsEditingPhone(true), 'phone-pad', profile?.phone || 'Not set')}
              </View>
            </View>
          </ElevatedCard>

          <ElevatedCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>App settings</Text>

            <TouchableOpacity style={styles.settingRow} activeOpacity={0.8}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <ChevronRight size={18} color={COLORS.textLight} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow} activeOpacity={0.8}>
              <Text style={styles.settingLabel}>Privacy policy</Text>
              <ChevronRight size={18} color={COLORS.textLight} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow} activeOpacity={0.8} onPress={handleLogout}>
              <Text style={[styles.settingLabel, { color: COLORS.expense }]}>Logout</Text>
              <LogOut size={18} color={COLORS.expense} />
            </TouchableOpacity>
          </ElevatedCard>
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
  flex: {
    flex: 1,
  },
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingHorizontal: 0,
  },
  heroCard: {
    marginTop: SPACING.xl,
    borderRadius: 28,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  heroName: {
    marginTop: SPACING.lg,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  heroSubtext: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  heroPill: {
    marginHorizontal: 4,
    marginBottom: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  sectionCard: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  fieldIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySurface,
    marginRight: SPACING.md,
  },
  fieldCopy: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  fieldValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  inlineEditor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  inlineInput: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  inlineAction: {
    marginLeft: SPACING.sm,
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
});

export default ProfileScreen;

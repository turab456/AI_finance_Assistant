import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { User, Phone, CheckCircle2, ChevronRight, LogOut } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW, GRADIENTS } from '../../utils/theme';
import { authApi } from '../../services/api';
import storage from '../../services/storage';

const ProfileScreen = () => {
  const [profile, setProfile] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await storage.getUserProfile();
    setProfile(data);
    if (data?.phone) {
      setPhone(data.phone);
    }
    if (data?.monthly_income !== undefined) {
      setSalary(data.monthly_income.toString());
    }
  };

  const handleUpdatePhone = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      const userId = profile?.id || 1;
      await authApi.updateUserPhone(userId, phone);

      const newProfile = { ...profile, phone };
      await storage.setUserProfile(newProfile);
      setProfile(newProfile);
      setIsEditing(false);
      Alert.alert('Success', 'Phone number updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSalary = async () => {
    const salaryNum = parseFloat(salary);
    if (isNaN(salaryNum) || salaryNum < 0) {
      Alert.alert('Error', 'Please enter a valid salary');
      return;
    }

    try {
      setLoading(true);
      const userId = profile?.id || 1;
      await authApi.updateUserSalary(userId, salaryNum);

      const newProfile = { ...profile, monthly_income: salaryNum };
      await storage.setUserProfile(newProfile);
      setProfile(newProfile);
      setIsEditingSalary(false);
      Alert.alert('Success', 'Salary updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update salary');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout? This will clear your experimental data.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          await storage.clear();
          // In a real app, you'd navigate back to splash or onboarding
          // navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.headerTitle}>Profile</Text>

          {/* User Header */}
          <View style={styles.profileHeader}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.avatar}>
              <User color={COLORS.white} size={40} />
            </LinearGradient>
            <View style={styles.headerText}>
              <Text style={styles.userName}>{profile?.name || 'Sufi Turab'}</Text>
              <Text style={styles.userRole}>Premium Member</Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
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
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{profile?.incomeType || 'Salary'}</Text>
              <Text style={styles.statLabel}>Source</Text>
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <View style={styles.infoCard}>
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
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            <TouchableOpacity style={styles.settingsItem}>
              <Text style={styles.settingsLabel}>Notifications</Text>
              <ChevronRight size={20} color={COLORS.textLight} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem}>
              <Text style={styles.settingsLabel}>Privacy Policy</Text>
              <ChevronRight size={20} color={COLORS.textLight} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem} onPress={handleLogout}>
              <Text style={[styles.settingsLabel, { color: COLORS.expense }]}>Logout</Text>
              <LogOut size={20} color={COLORS.expense} />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOW,
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
    marginBottom: SPACING.xl,
  },
  statBox: {
    flex: 0.48,
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOW,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
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
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOW,
    elevation: 1,
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

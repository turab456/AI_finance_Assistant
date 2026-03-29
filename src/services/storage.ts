import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  USER_PROFILE: 'user_profile',
};

export const storage = {
  async setOnboardingCompleted(value: boolean) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving onboarding state', e);
    }
  },

  async getOnboardingCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return value ? JSON.parse(value) : false;
    } catch (e) {
      console.error('Error getting onboarding state', e);
      return false;
    }
  },

  async setUserProfile(profile: any) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving user profile', e);
    }
  },

  async getUserProfile() {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('Error getting user profile', e);
      return null;
    }
  },

  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Error clearing storage', e);
    }
  },
};

export default storage;

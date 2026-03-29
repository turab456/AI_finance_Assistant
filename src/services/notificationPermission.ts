import { NativeModules, Platform, Linking, Alert } from 'react-native';

const { NotificationPermissionModule } = NativeModules;

export const notificationPermission = {
  async isNotificationServiceEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      if (!NotificationPermissionModule) {
        console.warn('NotificationPermissionModule not found');
        return false;
      }
      return await NotificationPermissionModule.isNotificationServiceEnabled();
    } catch (error) {
      console.error('Error checking notification permission', error);
      return false;
    }
  },

  async requestNotificationPermission() {
    if (Platform.OS !== 'android') return;
    try {
      Alert.alert(
        'Permission Required',
        'To track transactions automatically, please enable Notification Access for this app in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
                if (Platform.OS === 'android') {
                    // Redirect to notification listener setting
                    Linking.sendIntent('android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS');
                }
            } 
          },
        ]
      );
    } catch (error) {
      console.error('Error requesting notification permission', error);
    }
  },
};

export default notificationPermission;

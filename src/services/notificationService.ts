/**
 * This service handles Capacitor Local Notifications.
 * To use this in your Capacitor project:
 * 1. npm install @capacitor/local-notifications
 * 2. npx cap sync
 */

import { LocalNotifications } from '@capacitor/local-notifications';

export const notificationService = {
  /**
   * Request permission to show notifications
   */
  async requestPermissions() {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (e) {
      console.warn('Capacitor LocalNotifications not available', e);
      return false;
    }
  },

  /**
   * Schedule a local notification
   */
  async schedule(title: string, body: string, id: number = Math.floor(Math.random() * 10000)) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: { at: new Date(Date.now() + 1000) }, // Show almost immediately
            sound: 'default',
            attachments: [],
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    } catch (e) {
      // Fallback for web/non-capacitor environments
      console.log('Notification (Fallback):', title, body);
    }
  },

  /**
   * Clear all notifications
   */
  async clearAll() {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    } catch (e) {
      console.warn('Capacitor LocalNotifications not available');
    }
  }
};

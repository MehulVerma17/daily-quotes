/**
 * Notification Service
 *
 * Handles local push notifications for daily quotes.
 * Uses expo-notifications for scheduling and managing notifications.
 */

import * as Notifications from 'expo-notifications';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user
 * @returns Whether permissions were granted
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Check if notification permissions are granted
 */
export const checkNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
};

/**
 * Schedule a daily notification at the specified time
 * @param time Time in HH:mm format (24-hour)
 * @returns The next scheduled time as a readable string
 */
export const scheduleDailyQuoteNotification = async (time: string): Promise<string> => {
  try {
    // Cancel any existing scheduled notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Parse time (HH:mm format)
    const [hours, minutes] = time.split(':').map(Number);

    // Calculate when the next notification will fire
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, it will fire tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Schedule daily repeating notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your Daily Quote',
        body: 'Tap to discover today\'s inspiring quote!',
        data: { screen: 'Home' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });

    // Log scheduled notifications for debugging
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', JSON.stringify(scheduled, null, 2));

    const timeStr = scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isToday = scheduledTime.toDateString() === now.toDateString();
    const dayStr = isToday ? 'today' : 'tomorrow';

    console.log(`Daily notification scheduled for ${timeStr} ${dayStr}`);
    return `${timeStr} ${dayStr}`;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelDailyQuoteNotification = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
    throw error;
  }
};

/**
 * Send an immediate test notification to verify notifications work
 */
export const sendTestNotification = async (): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your Daily Quote',
        body: 'Test notification - Notifications are working!',
        sound: true,
      },
      trigger: null, // null = send immediately
    });
    console.log('Test notification sent');
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
};

/**
 * Get all scheduled notifications (for debugging)
 */
export const getScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Format time from HH:mm to display format (e.g., "9:00 AM")
 */
export const formatNotificationTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Convert Date object to HH:mm format
 */
export const dateToTimeString = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Convert HH:mm string to Date object (for DateTimePicker)
 */
export const timeStringToDate = (time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

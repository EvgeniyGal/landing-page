import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";
import { listDecks } from "@/src/api/endpoints";
import { ensureAuthTokenLoaded } from "@/src/auth/token-store";
import {
  dateAtLocalTime,
  localDayKey,
  readStudyReminderPrefs,
  writeStudyReminderPrefs,
  type StudyReminderPrefs,
} from "@/src/lib/study-reminder-prefs";

export const STUDY_REMINDER_NOTIFICATION_ID = "study-reminder";
export const STUDY_REMINDER_CHANNEL_ID = "study-reminders";
export const STUDY_REMINDER_TASK = "study-reminder-sync";

/**
 * Android Expo Go throws when expo-notifications loads (push APIs removed in SDK 53).
 * Background tasks are also unavailable in Expo Go. Use a development build for reminders.
 */
export const STUDY_REMINDERS_SUPPORTED = !isRunningInExpoGo();

type NotificationsModule = typeof import("expo-notifications");
type BackgroundTaskModule = typeof import("expo-background-task");
type TaskManagerModule = typeof import("expo-task-manager");

let notificationsModule: NotificationsModule | null | undefined;
let backgroundTaskModule: BackgroundTaskModule | null | undefined;
let taskManagerModule: TaskManagerModule | null | undefined;
let didInitNotifications = false;
let didDefineTask = false;

function getNotifications(): NotificationsModule | null {
  if (!STUDY_REMINDERS_SUPPORTED) {
    return null;
  }
  if (notificationsModule !== undefined) {
    return notificationsModule;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    notificationsModule = require("expo-notifications") as NotificationsModule;
  } catch {
    notificationsModule = null;
  }
  return notificationsModule;
}

function getBackgroundTask(): BackgroundTaskModule | null {
  if (!STUDY_REMINDERS_SUPPORTED) {
    return null;
  }
  if (backgroundTaskModule !== undefined) {
    return backgroundTaskModule;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    backgroundTaskModule = require("expo-background-task") as BackgroundTaskModule;
  } catch {
    backgroundTaskModule = null;
  }
  return backgroundTaskModule;
}

function getTaskManager(): TaskManagerModule | null {
  if (!STUDY_REMINDERS_SUPPORTED) {
    return null;
  }
  if (taskManagerModule !== undefined) {
    return taskManagerModule;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    taskManagerModule = require("expo-task-manager") as TaskManagerModule;
  } catch {
    taskManagerModule = null;
  }
  return taskManagerModule;
}

function ensureNotificationSideEffects() {
  if (didInitNotifications) {
    return;
  }
  const Notifications = getNotifications();
  if (!Notifications) {
    return;
  }
  didInitNotifications = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  Notifications.addNotificationReceivedListener((notification) => {
    if (notification.request.identifier === STUDY_REMINDER_NOTIFICATION_ID) {
      void markNotifiedToday();
    }
  });

  Notifications.addNotificationResponseReceivedListener((response) => {
    if (response.notification.request.identifier === STUDY_REMINDER_NOTIFICATION_ID) {
      void markNotifiedToday();
    }
  });
}

function ensureBackgroundTaskDefined() {
  if (didDefineTask) {
    return;
  }
  const TaskManager = getTaskManager();
  const BackgroundTask = getBackgroundTask();
  if (!TaskManager || !BackgroundTask) {
    return;
  }
  didDefineTask = true;
  TaskManager.defineTask(STUDY_REMINDER_TASK, async () => {
    try {
      await syncStudyReminder();
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

/** Call once from app root when reminders are supported (no-op in Expo Go). */
export function initStudyReminders() {
  if (!STUDY_REMINDERS_SUPPORTED) {
    return;
  }
  ensureNotificationSideEffects();
  ensureBackgroundTaskDefined();
}

async function markNotifiedToday() {
  const prefs = await readStudyReminderPrefs();
  const todayKey = localDayKey();
  if (prefs.lastNotifiedDay === todayKey) {
    return;
  }
  await writeStudyReminderPrefs({ ...prefs, lastNotifiedDay: todayKey });
}

export type StudyReminderSyncResult = {
  due: number;
  scheduled: boolean;
  presented: boolean;
  enabled: boolean;
};

async function ensureAndroidChannel() {
  const Notifications = getNotifications();
  if (!Notifications || Platform.OS !== "android") {
    return;
  }
  await Notifications.setNotificationChannelAsync(STUDY_REMINDER_CHANNEL_ID, {
    name: "Study reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function requestStudyReminderPermissions() {
  const Notifications = getNotifications();
  if (!Notifications) {
    return false;
  }
  ensureNotificationSideEffects();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return Boolean(
    requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
  );
}

export async function fetchDueCardCount() {
  const result = await listDecks();
  return result.decks.reduce((sum, deck) => sum + (deck.cardsDueToday ?? 0), 0);
}

async function cancelStudyReminderNotifications() {
  const Notifications = getNotifications();
  if (!Notifications) {
    return;
  }
  await Notifications.cancelScheduledNotificationAsync(STUDY_REMINDER_NOTIFICATION_ID).catch(
    () => undefined,
  );
  const presented = await Notifications.getPresentedNotificationsAsync();
  await Promise.all(
    presented
      .filter((item) => item.request.identifier === STUDY_REMINDER_NOTIFICATION_ID)
      .map((item) => Notifications.dismissNotificationAsync(item.request.identifier)),
  );
}

async function registerBackgroundSync() {
  ensureBackgroundTaskDefined();
  const BackgroundTask = getBackgroundTask();
  const TaskManager = getTaskManager();
  if (!BackgroundTask || !TaskManager) {
    return;
  }
  const status = await BackgroundTask.getStatusAsync();
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) {
    return;
  }
  const registered = await TaskManager.isTaskRegisteredAsync(STUDY_REMINDER_TASK);
  if (registered) {
    return;
  }
  await BackgroundTask.registerTaskAsync(STUDY_REMINDER_TASK, {
    minimumInterval: 60,
  });
}

async function unregisterBackgroundSync() {
  const BackgroundTask = getBackgroundTask();
  const TaskManager = getTaskManager();
  if (!BackgroundTask || !TaskManager) {
    return;
  }
  const registered = await TaskManager.isTaskRegisteredAsync(STUDY_REMINDER_TASK);
  if (!registered) {
    return;
  }
  await BackgroundTask.unregisterTaskAsync(STUDY_REMINDER_TASK);
}

function notificationBody(due: number) {
  if (due === 1) {
    return "1 card is ready to study.";
  }
  return `${due} cards are ready to study.`;
}

async function presentStudyReminder(due: number) {
  const Notifications = getNotifications();
  if (!Notifications) {
    return;
  }
  ensureNotificationSideEffects();
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: STUDY_REMINDER_NOTIFICATION_ID,
    content: {
      title: "Time to study",
      body: notificationBody(due),
      data: { type: "study-reminder", due },
      sound: true,
      ...(Platform.OS === "android" ? { channelId: STUDY_REMINDER_CHANNEL_ID } : {}),
    },
    trigger: null,
  });
}

async function scheduleStudyReminderAt(when: Date, due: number) {
  const Notifications = getNotifications();
  if (!Notifications) {
    return;
  }
  if (when.getTime() <= Date.now() + 1_000) {
    return;
  }
  ensureNotificationSideEffects();
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: STUDY_REMINDER_NOTIFICATION_ID,
    content: {
      title: "Time to study",
      body: notificationBody(due),
      data: { type: "study-reminder", due },
      sound: true,
      ...(Platform.OS === "android" ? { channelId: STUDY_REMINDER_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
      ...(Platform.OS === "android" ? { channelId: STUDY_REMINDER_CHANNEL_ID } : {}),
    },
  });
}

/**
 * Keeps the next study reminder in sync with prefs + due cards.
 * Schedules/presents only when there is at least one card due.
 */
export async function syncStudyReminder(
  prefsOverride?: StudyReminderPrefs,
): Promise<StudyReminderSyncResult> {
  if (!STUDY_REMINDERS_SUPPORTED) {
    return { due: 0, scheduled: false, presented: false, enabled: false };
  }

  ensureNotificationSideEffects();
  ensureBackgroundTaskDefined();

  const prefs = prefsOverride ?? (await readStudyReminderPrefs());

  if (!prefs.enabled) {
    await cancelStudyReminderNotifications();
    await unregisterBackgroundSync();
    return { due: 0, scheduled: false, presented: false, enabled: false };
  }

  const allowed = await requestStudyReminderPermissions();
  if (!allowed) {
    await cancelStudyReminderNotifications();
    await unregisterBackgroundSync();
    return { due: 0, scheduled: false, presented: false, enabled: true };
  }

  const token = await ensureAuthTokenLoaded();
  if (!token) {
    await cancelStudyReminderNotifications();
    await unregisterBackgroundSync();
    return { due: 0, scheduled: false, presented: false, enabled: true };
  }

  let due = 0;
  try {
    due = await fetchDueCardCount();
  } catch {
    return { due: 0, scheduled: false, presented: false, enabled: true };
  }

  await cancelStudyReminderNotifications();

  if (due <= 0) {
    await registerBackgroundSync();
    return { due: 0, scheduled: false, presented: false, enabled: true };
  }

  await registerBackgroundSync();

  const now = new Date();
  const todayKey = localDayKey(now);
  const targetToday = dateAtLocalTime(now, prefs.hour, prefs.minute);
  let presented = false;

  if (now.getTime() >= targetToday.getTime()) {
    if (prefs.lastNotifiedDay !== todayKey) {
      await presentStudyReminder(due);
      presented = true;
      const nextPrefs = { ...prefs, lastNotifiedDay: todayKey };
      await writeStudyReminderPrefs(nextPrefs);
    }
    const tomorrow = dateAtLocalTime(now, prefs.hour, prefs.minute);
    tomorrow.setDate(tomorrow.getDate() + 1);
    await scheduleStudyReminderAt(tomorrow, due);
    return { due, scheduled: true, presented, enabled: true };
  }

  await scheduleStudyReminderAt(targetToday, due);
  return { due, scheduled: true, presented: false, enabled: true };
}

export async function saveStudyReminderPrefsAndSync(
  patch: Partial<Pick<StudyReminderPrefs, "enabled" | "hour" | "minute">>,
) {
  const current = await readStudyReminderPrefs();
  const next: StudyReminderPrefs = {
    ...current,
    ...patch,
    hour: patch.hour ?? current.hour,
    minute: patch.minute ?? current.minute,
    enabled: patch.enabled ?? current.enabled,
  };
  await writeStudyReminderPrefs(next);
  return syncStudyReminder(next);
}

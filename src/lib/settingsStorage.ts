const PREFIX = 'schedulemate.settings';

export type ProfileSettings = {
  displayName: string;
  email: string;
};

export type NotificationSettings = {
  emailDigest: boolean;
  desktopReminders: boolean;
};

const DEFAULT_PROFILE: ProfileSettings = { displayName: '', email: '' };
const DEFAULT_NOTIFICATIONS: NotificationSettings = { emailDigest: true, desktopReminders: false };

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function loadProfile(): ProfileSettings {
  return readJSON(`${PREFIX}.profile`, DEFAULT_PROFILE);
}

export function saveProfile(p: ProfileSettings) {
  writeJSON(`${PREFIX}.profile`, p);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('schedulemate-profile-updated'));
  }
}

export function loadNotifications(): NotificationSettings {
  return readJSON(`${PREFIX}.notifications`, DEFAULT_NOTIFICATIONS);
}

export function saveNotifications(n: NotificationSettings) {
  writeJSON(`${PREFIX}.notifications`, n);
}

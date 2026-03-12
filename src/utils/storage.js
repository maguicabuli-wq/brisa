import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LOGS: 'brisa_logs',
  JOURNAL: 'brisa_journal',
  SETTINGS: 'brisa_settings',
  STREAK: 'brisa_streak',
  SAVED_OPTIONS: 'brisa_saved_options', // User's custom saved responses
};

// --- Logs ---
export async function saveLogs(logs) {
  await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
}

export async function getLogs() {
  const data = await AsyncStorage.getItem(KEYS.LOGS);
  return data ? JSON.parse(data) : [];
}

export async function addLog(log) {
  const logs = await getLogs();
  const newLog = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...log,
  };
  logs.unshift(newLog);
  await saveLogs(logs);
  return newLog;
}

// --- Journal ---
export async function getJournalEntries() {
  const data = await AsyncStorage.getItem(KEYS.JOURNAL);
  return data ? JSON.parse(data) : [];
}

export async function addJournalEntry(entry) {
  const entries = await getJournalEntries();
  const newEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  entries.unshift(newEntry);
  await AsyncStorage.setItem(KEYS.JOURNAL, JSON.stringify(entries));
  return newEntry;
}

// --- Settings ---
export async function getSettings() {
  const data = await AsyncStorage.getItem(KEYS.SETTINGS);
  return data ? JSON.parse(data) : {
    language: 'es',
    notificationsEnabled: false,
    notificationTime: '09:00',
    notificationMessage: '',
    streakType: 'logged', // 'logged' | 'pullFree'
  };
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// --- Streak ---
export async function getStreakData() {
  const data = await AsyncStorage.getItem(KEYS.STREAK);
  return data ? JSON.parse(data) : {
    currentStreak: 0,
    longestStreak: 0,
    lastLogDate: null,
    pullFreeDays: [],
    loggedDays: [],
  };
}

export async function updateStreak(type, date) {
  const streak = await getStreakData();
  const today = date || new Date().toISOString().split('T')[0];

  if (type === 'logged') {
    if (!streak.loggedDays.includes(today)) {
      streak.loggedDays.push(today);
    }
  } else if (type === 'pullFree') {
    if (!streak.pullFreeDays.includes(today)) {
      streak.pullFreeDays.push(today);
    }
  }

  // Calculate current streak based on consecutive days
  const days = type === 'logged' ? streak.loggedDays : streak.pullFreeDays;
  days.sort();

  let currentStreak = 0;
  const todayDate = new Date(today);
  for (let i = 0; i <= 365; i++) {
    const checkDate = new Date(todayDate);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    if (days.includes(dateStr)) {
      currentStreak++;
    } else {
      break;
    }
  }

  streak.currentStreak = currentStreak;
  streak.longestStreak = Math.max(streak.longestStreak, currentStreak);
  streak.lastLogDate = today;

  await AsyncStorage.setItem(KEYS.STREAK, JSON.stringify(streak));
  return streak;
}

// --- Saved Options (smart suggestions) ---
export async function getSavedOptions(key) {
  const data = await AsyncStorage.getItem(KEYS.SAVED_OPTIONS);
  const all = data ? JSON.parse(data) : {};
  return all[key] || [];
}

export async function addSavedOption(key, value) {
  const data = await AsyncStorage.getItem(KEYS.SAVED_OPTIONS);
  const all = data ? JSON.parse(data) : {};
  if (!all[key]) all[key] = [];
  if (!all[key].includes(value)) {
    all[key].unshift(value);
    // Keep max 20 saved options per key
    all[key] = all[key].slice(0, 20);
  }
  await AsyncStorage.setItem(KEYS.SAVED_OPTIONS, JSON.stringify(all));
}

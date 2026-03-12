import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings, getStreakData, getLogs, getSavedOptions, addSavedOption } from '../utils/storage';
import strings from '../constants/strings';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [language, setLanguage] = useState('es');
  const [settings, setSettings] = useState(null);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [logs, setLogs] = useState([]);
  const [savedOptions, setSavedOptions] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    (async () => {
      try {
        const [s, st, l] = await Promise.all([
          getSettings(),
          getStreakData(),
          getLogs(),
        ]);
        setSettings(s);
        setLanguage(s.language || 'es');
        setStreak(st);
        setLogs(l);
      } catch (e) {
        console.warn('Error loading app data:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Get translated string
  const t = useCallback((key) => {
    const lang = strings[language] || strings.es;
    return lang[key] || strings.es[key] || key;
  }, [language]);

  // Update settings
  const updateSettings = useCallback(async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (newSettings.language) setLanguage(newSettings.language);
    await saveSettings(updated);
  }, [settings]);

  // Refresh logs
  const refreshLogs = useCallback(async () => {
    const l = await getLogs();
    setLogs(l);
  }, []);

  // Refresh streak
  const refreshStreak = useCallback(async () => {
    const st = await getStreakData();
    setStreak(st);
  }, []);

  // Smart suggestions — get previously used options for a field
  const getSmartOptions = useCallback(async (key) => {
    return await getSavedOptions(key);
  }, []);

  const saveSmartOption = useCallback(async (key, value) => {
    await addSavedOption(key, value);
  }, []);

  return (
    <AppContext.Provider value={{
      language,
      settings,
      streak,
      logs,
      isLoading,
      t,
      updateSettings,
      refreshLogs,
      refreshStreak,
      getSmartOptions,
      saveSmartOption,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

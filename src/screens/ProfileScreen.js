import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Switch, TextInput, Platform,
} from 'react-native';
import Colors from '../constants/colors';
import { useApp } from '../context/AppContext';

export default function ProfileScreen() {
  const { t, settings, streak, logs, updateSettings } = useApp();

  if (!settings) return null;

  const handleLanguageToggle = () => {
    updateSettings({ language: settings.language === 'es' ? 'en' : 'es' });
  };

  const handleStreakTypeToggle = () => {
    updateSettings({ streakType: settings.streakType === 'logged' ? 'pullFree' : 'logged' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('profileTitle')}</Text>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{logs.length}</Text>
            <Text style={styles.statLabel}>{t('profileLogs')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{streak.currentStreak}</Text>
            <Text style={styles.statLabel}>{t('profileStreak')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{streak.longestStreak}</Text>
            <Text style={styles.statLabel}>Mejor</Text>
          </View>
        </View>

        {/* Streak type badge */}
        <View style={styles.streakVisual}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakBig}>{streak.currentStreak}</Text>
          <Text style={styles.streakDesc}>
            {settings.streakType === 'logged' ? t('streakLogged') : t('streakPullFree')}
          </Text>
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>{t('profileSettings')}</Text>

        {/* Language */}
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>{t('profileLanguage')}</Text>
            <Text style={styles.settingDesc}>
              {settings.language === 'es' ? 'Español' : 'English'}
            </Text>
          </View>
          <TouchableOpacity style={styles.langToggle} onPress={handleLanguageToggle}>
            <Text style={styles.langToggleText}>
              {settings.language === 'es' ? 'EN' : 'ES'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Streak Type */}
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>{t('profileStreakType')}</Text>
            <Text style={styles.settingDesc}>
              {settings.streakType === 'logged' ? t('streakLogged') : t('streakPullFree')}
            </Text>
          </View>
          <TouchableOpacity style={styles.langToggle} onPress={handleStreakTypeToggle}>
            <Text style={styles.langToggleText}>
              {settings.streakType === 'logged' ? '📅' : '💪'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>{t('profileNotifications')}</Text>
            <Text style={styles.settingDesc}>{t('profileNotifTime')}</Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(val) => updateSettings({ notificationsEnabled: val })}
            trackColor={{ true: Colors.primaryLight, false: Colors.border }}
            thumbColor={settings.notificationsEnabled ? Colors.primary : Colors.textMuted}
          />
        </View>

        {settings.notificationsEnabled && (
          <>
            {/* Notification Time */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{t('profileNotifTime')}</Text>
              <TouchableOpacity style={styles.timeButton}>
                <Text style={styles.timeText}>{settings.notificationTime || '09:00'}</Text>
              </TouchableOpacity>
            </View>

            {/* Custom message */}
            <View style={styles.settingBlock}>
              <Text style={styles.settingLabel}>{t('profileNotifMessage')}</Text>
              <TextInput
                style={styles.messageInput}
                value={settings.notificationMessage}
                onChangeText={(text) => updateSettings({ notificationMessage: text })}
                placeholder="Ej: Recuerda respirar 🌿"
                placeholderTextColor={Colors.textMuted}
                multiline
              />
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.divider,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  streakVisual: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  streakEmoji: {
    fontSize: 40,
  },
  streakBig: {
    fontSize: 52,
    fontWeight: '800',
    color: Colors.primary,
    marginVertical: 4,
  },
  streakDesc: {
    fontSize: 14,
    color: Colors.textLight,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: 24,
    marginBottom: 16,
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 24,
    marginBottom: 8,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingBlock: {
    backgroundColor: Colors.card,
    marginHorizontal: 24,
    marginBottom: 8,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  settingDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  langToggle: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  langToggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  timeButton: {
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  messageInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    marginTop: 10,
    minHeight: 60,
  },
});

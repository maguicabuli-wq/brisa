import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, SafeAreaView,
} from 'react-native';
import Colors from '../constants/colors';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const BUTTON_SIZE = width * 0.48;

export default function HomeScreen({ navigation }) {
  const { t, streak, logs, refreshLogs, refreshStreak } = useApp();
  const pulseAnim = new Animated.Value(1);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    refreshLogs();
    refreshStreak();
    // Time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  // Gentle pulse animation for main button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const lastLog = logs[0];
  const lastLogTime = lastLog
    ? new Date(lastLog.timestamp).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting} 🌿</Text>
          <Text style={styles.question}>{t('homeQuestion')}</Text>
        </View>
        {streak.currentStreak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
            <Text style={styles.streakLabel}>{t('homeStreak')}</Text>
          </View>
        )}
      </View>

      {/* Main Button */}
      <View style={styles.mainSection}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('LogFlow')}
        >
          <Animated.View style={[
            styles.mainButton,
            { transform: [{ scale: pulseAnim }] },
          ]}>
            <View style={styles.mainButtonInner}>
              <Text style={styles.mainButtonIcon}>🍃</Text>
              <Text style={styles.mainButtonText}>{t('homeMainButton')}</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {lastLogTime && (
          <Text style={styles.lastLog}>
            {t('homeLastLog')}: {lastLogTime}
          </Text>
        )}
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{logs.length}</Text>
          <Text style={styles.statLabel}>{t('profileLogs')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{streak.currentStreak}</Text>
          <Text style={styles.statLabel}>{t('profileStreak')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{streak.longestStreak}</Text>
          <Text style={styles.statLabel}>Mejor racha</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  question: {
    fontSize: 18,
    color: Colors.textLight,
    marginTop: 4,
  },
  streakBadge: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  streakLabel: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 2,
  },
  mainSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  mainButtonInner: {
    width: BUTTON_SIZE * 0.78,
    height: BUTTON_SIZE * 0.78,
    borderRadius: (BUTTON_SIZE * 0.78) / 2,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  mainButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  lastLog: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
});

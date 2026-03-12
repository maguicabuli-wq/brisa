import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, SafeAreaView,
} from 'react-native';
import Colors from '../constants/colors';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');
const BUTTON_SIZE = width * 0.52;

export default function HomeScreen({ navigation }) {
  const { refreshLogs, refreshStreak } = useApp();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    refreshLogs();
    refreshStreak();
  }, []);

  // Gentle pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 3000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Soft glow animation
  useEffect(() => {
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.6, duration: 3500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 3500, useNativeDriver: true }),
      ])
    );
    glow.start();
    return () => glow.stop();
  }, []);

  // Floating animation
  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 4000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    );
    float.start();
    return () => float.stop();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Centered calming content */}
      <View style={styles.centerContent}>
        {/* Subtle ambient text */}
        <Animated.Text style={[styles.brandName, { opacity: glowAnim }]}>
          brisa
        </Animated.Text>

        {/* Main register button with calming animation */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('LogFlow')}
        >
          <Animated.View style={[
            styles.outerGlow,
            {
              opacity: glowAnim,
              transform: [{ scale: pulseAnim }, { translateY: floatAnim }],
            },
          ]} />
          <Animated.View style={[
            styles.mainButton,
            {
              transform: [{ scale: pulseAnim }, { translateY: floatAnim }],
            },
          ]}>
            <View style={styles.mainButtonInner}>
              <Text style={styles.mainButtonIcon}>~</Text>
              <Text style={styles.mainButtonText}>Registrar</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Calming subtitle */}
        <Animated.Text style={[styles.subtitle, { opacity: glowAnim }]}>
          toca cuando quieras
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.textMuted,
    letterSpacing: 6,
    textTransform: 'lowercase',
    marginBottom: 48,
  },
  outerGlow: {
    position: 'absolute',
    width: BUTTON_SIZE + 30,
    height: BUTTON_SIZE + 30,
    borderRadius: (BUTTON_SIZE + 30) / 2,
    backgroundColor: Colors.primaryLight,
    left: -15,
    top: -15,
  },
  mainButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
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
    fontSize: 32,
    color: Colors.textOnPrimary,
    fontWeight: '300',
    marginBottom: 2,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textOnPrimary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textMuted,
    marginTop: 40,
    letterSpacing: 2,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/colors';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.55;

// Particle positions for the "tunnel of lights" effect
const NUM_PARTICLES = 24;
const generateParticles = () =>
  Array.from({ length: NUM_PARTICLES }, (_, i) => ({
    id: i,
    angle: (i / NUM_PARTICLES) * Math.PI * 2,
    radius: 0.3 + Math.random() * 0.7,
    size: 3 + Math.random() * 5,
    opacity: 0.3 + Math.random() * 0.7,
  }));

export default function BreathingExercise({ duration = 6, onComplete }) {
  const { t } = useApp();
  const [phase, setPhase] = useState('ready'); // ready, inhale, hold, exhale, done
  const [timeLeft, setTimeLeft] = useState(duration);
  const [started, setStarted] = useState(false);
  const scale = useRef(new Animated.Value(0.4)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const particles = useRef(generateParticles()).current;

  // Breathing cycle: inhale 4s, hold 2s, exhale 4s (for 6s version: 2s, 1s, 3s)
  const isShort = duration <= 6;
  const inhaleTime = isShort ? 2000 : 4000;
  const holdTime = isShort ? 1000 : 4000;
  const exhaleTime = isShort ? 3000 : 7000;
  const cycleTime = inhaleTime + holdTime + exhaleTime;

  useEffect(() => {
    if (!started) return;

    let elapsed = 0;
    let timer;

    const runCycle = () => {
      // Inhale
      setPhase('inhale');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: inhaleTime, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.8, duration: inhaleTime, useNativeDriver: true }),
        Animated.timing(particleAnim, { toValue: 1, duration: inhaleTime, useNativeDriver: true }),
      ]).start();

      // Hold
      timer = setTimeout(() => {
        setPhase('hold');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }, inhaleTime);

      // Exhale
      setTimeout(() => {
        setPhase('exhale');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.4, duration: exhaleTime, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.3, duration: exhaleTime, useNativeDriver: true }),
          Animated.timing(particleAnim, { toValue: 0, duration: exhaleTime, useNativeDriver: true }),
        ]).start();
      }, inhaleTime + holdTime);

      elapsed += cycleTime;
    };

    // Countdown timer
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setPhase('done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Run breathing cycles
    runCycle();
    const cycleInterval = setInterval(runCycle, cycleTime);

    return () => {
      clearInterval(countdown);
      clearInterval(cycleInterval);
      clearTimeout(timer);
    };
  }, [started]);

  useEffect(() => {
    if (phase === 'done' && onComplete) {
      setTimeout(onComplete, 1500);
    }
  }, [phase]);

  const phaseText =
    phase === 'inhale' ? t('breatheInhale') :
    phase === 'hold' ? t('breatheHold') :
    phase === 'exhale' ? t('breatheExhale') :
    phase === 'done' ? t('breatheDone') :
    t('breatheReady');

  if (!started) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('breatheTitle')}</Text>
        <TouchableOpacity style={styles.startButton} onPress={() => setStarted(true)}>
          <View style={styles.startCircle}>
            <Text style={styles.startText}>{t('breatheStart')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('breatheTitle')}</Text>
      <Text style={styles.timer}>{timeLeft}s</Text>

      <View style={styles.circleContainer}>
        {/* Particle ring */}
        {particles.map((p) => {
          const particleScale = particleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [p.radius * 0.5, p.radius],
          });
          const x = Math.cos(p.angle) * (CIRCLE_SIZE * 0.55);
          const y = Math.sin(p.angle) * (CIRCLE_SIZE * 0.55);
          return (
            <Animated.View
              key={p.id}
              style={[
                styles.particle,
                {
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size / 2,
                  opacity: glowOpacity.interpolate({
                    inputRange: [0.3, 0.8],
                    outputRange: [p.opacity * 0.3, p.opacity],
                  }),
                  transform: [
                    { translateX: x },
                    { translateY: y },
                    { scale: particleScale },
                  ],
                },
              ]}
            />
          );
        })}

        {/* Main breathing circle */}
        <Animated.View
          style={[
            styles.breatheCircle,
            {
              transform: [{ scale }],
              opacity: glowOpacity,
            },
          ]}
        />

        {/* Inner glow */}
        <Animated.View
          style={[
            styles.innerCircle,
            { transform: [{ scale }] },
          ]}
        />

        {/* Phase label */}
        <Text style={styles.phaseText}>{phaseText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  timer: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 40,
  },
  circleContainer: {
    width: CIRCLE_SIZE * 1.3,
    height: CIRCLE_SIZE * 1.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breatheCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: Colors.primaryLight,
  },
  innerCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE * 0.6,
    height: CIRCLE_SIZE * 0.6,
    borderRadius: (CIRCLE_SIZE * 0.6) / 2,
    backgroundColor: Colors.primary,
    opacity: 0.4,
  },
  particle: {
    position: 'absolute',
    backgroundColor: Colors.accent,
  },
  phaseText: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  startButton: {
    marginTop: 40,
  },
  startCircle: {
    width: CIRCLE_SIZE * 0.7,
    height: CIRCLE_SIZE * 0.7,
    borderRadius: (CIRCLE_SIZE * 0.7) / 2,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
  },
});

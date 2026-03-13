import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Colors from '../constants/colors';

const triggerHaptic = () => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then(Haptics =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  ).catch(() => {});
};
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

/*
  Breathing pattern:
    - Inhale: 4 seconds
    - Exhale: 6 seconds
    - 3 cycles total = 30 seconds
*/
const INHALE_MS = 4000;
const EXHALE_MS = 6000;
const CYCLE_MS = INHALE_MS + EXHALE_MS; // 10s per cycle
const TOTAL_CYCLES = 3;
const TOTAL_DURATION = TOTAL_CYCLES * (CYCLE_MS / 1000); // 30 seconds

export default function BreathingExercise({ onComplete }) {
  const { t } = useApp();
  const [phase, setPhase] = useState('ready'); // ready, inhale, exhale, done
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION);
  const [started, setStarted] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const scale = useRef(new Animated.Value(0.4)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const particles = useRef(generateParticles()).current;

  useEffect(() => {
    if (!started) return;

    let cyclesDone = 0;
    let timer;

    const runCycle = () => {
      if (cyclesDone >= TOTAL_CYCLES) {
        setPhase('done');
        return;
      }

      // Inhale — 4 seconds
      setPhase('inhale');
      setCycleCount(cyclesDone + 1);
      triggerHaptic();
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: INHALE_MS, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.8, duration: INHALE_MS, useNativeDriver: true }),
        Animated.timing(particleAnim, { toValue: 1, duration: INHALE_MS, useNativeDriver: true }),
      ]).start();

      // Exhale — 6 seconds (starts after inhale)
      timer = setTimeout(() => {
        setPhase('exhale');
        triggerHaptic();
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.4, duration: EXHALE_MS, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.3, duration: EXHALE_MS, useNativeDriver: true }),
          Animated.timing(particleAnim, { toValue: 0, duration: EXHALE_MS, useNativeDriver: true }),
        ]).start();
      }, INHALE_MS);

      cyclesDone++;
    };

    // Countdown timer
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Run breathing cycles
    runCycle();
    const cycleInterval = setInterval(() => {
      runCycle();
    }, CYCLE_MS);

    // Auto-stop after all cycles
    const stopTimeout = setTimeout(() => {
      clearInterval(cycleInterval);
      setPhase('done');
    }, TOTAL_CYCLES * CYCLE_MS);

    return () => {
      clearInterval(countdown);
      clearInterval(cycleInterval);
      clearTimeout(timer);
      clearTimeout(stopTimeout);
    };
  }, [started]);

  useEffect(() => {
    if (phase === 'done' && onComplete) {
      setTimeout(onComplete, 1500);
    }
  }, [phase]);

  const phaseText =
    phase === 'inhale' ? t('breatheInhale') :
    phase === 'exhale' ? t('breatheExhale') :
    phase === 'done' ? t('breatheDone') :
    t('breatheReady');

  if (!started) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('breatheTitle')}</Text>
        <Text style={styles.instructions}>4s inhala  ~  6s exhala  ~  3 ciclos</Text>
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
      <Text style={styles.timer}>{timeLeft}s  ~  {cycleCount}/{TOTAL_CYCLES}</Text>

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
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  instructions: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 8,
    letterSpacing: 1,
  },
  timer: {
    fontSize: 14,
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

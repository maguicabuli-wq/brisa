// ============================================================
// BRISA — Complete App (Single File for Expo Snack)
// Copy-paste this entire file as App.js in Snack
// ============================================================

import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
  SafeAreaView, ScrollView, FlatList, TextInput, Switch, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LineChart, BarChart } from 'react-native-chart-kit';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================
// COLORS
// ============================================================
const Colors = {
  background: '#FFF8F0',
  surface: '#FFF2E8',
  card: '#FFFFFF',
  primary: '#D4845A',
  primaryLight: '#F0D5C4',
  primaryDark: '#B86B42',
  secondary: '#8B9E8B',
  secondaryLight: '#C5D4C5',
  accent: '#E8B298',
  accentSoft: '#FAE6D8',
  text: '#3D2C2C',
  textLight: '#7A6B6B',
  textMuted: '#B8A9A9',
  textOnPrimary: '#FFFFFF',
  border: '#F0E4DA',
  divider: '#F5EDE5',
  shadow: 'rgba(61, 44, 44, 0.08)',
  overlay: 'rgba(61, 44, 44, 0.4)',
  success: '#7DA67D',
  warning: '#E8B86D',
  error: '#D47E7E',
  info: '#7E9EB8',
  breatheGlow: '#F0D5C4',
  breatheCenter: '#D4845A',
  streak: '#E8B86D',
  badge: '#D4845A',
};


// ============================================================
// STRINGS (i18n)
// ============================================================
const strings = {
  es: {
    appName: 'Brisa',
    appTagline: 'Tu espacio de calma',
    navHome: 'Inicio',
    navData: 'Datos',
    navJournal: 'Diario',
    navProfile: 'Perfil',
    navChat: 'Chat',
    homeGreeting: 'Hola',
    homeQuestion: '¿Cómo estás?',
    homeMainButton: 'Registrar',
    homeStreak: 'días seguidos',
    homeLastLog: 'Último registro',
    logTitle: '¿Qué está pasando?',
    logOptionA: 'Estoy teniendo un episodio',
    logOptionB: 'Ya pasó mi episodio',
    logOptionC: 'No estoy segura',
    logOptionD: 'Solo estoy checkeando',
    howDoYouFeel: '¿Cómo te sientes?',
    feelScale: 'Del 0 al 10, ¿cómo te sientes?',
    urgeScale: 'Del 0 al 10, ¿qué tanta urgencia de tocarte sientes?',
    notAtAll: 'Nada',
    veryMuch: 'Mucho',
    calm: 'En calma',
    overwhelmed: 'Abrumada',
    breatheTitle: 'Respiremos juntos',
    breatheInhale: 'Inhala',
    breatheHold: 'Sostén',
    breatheExhale: 'Exhala',
    breatheReady: '¿Lista?',
    breatheStart: 'Comenzar',
    breatheDone: 'Bien hecho',
    whereTouch: '¿Dónde te estás tocando?',
    eyebrows: 'Cejas',
    eyelashes: 'Pestañas',
    scalp: 'Cabeza',
    other: 'Otro',
    specify: 'Especificar...',
    rideTheWave: 'RIDE THE WAVE OF DISCOMFORT',
    blockerMessage: 'Sé que puede dar pereza, pero vamos a buscar un blocker: guantes, pañuelo de cabeza, gorro, un juguete...',
    cantRightNow: 'No puedo ahora',
    foundOne: 'Encontré uno',
    defineTogethertitle: 'Definamos juntos',
    trigger: 'Trigger (¿qué lo provocó?)',
    behavior: 'Comportamiento (¿qué hiciste?)',
    result: 'Resultado (¿qué pasó?)',
    didYouPull: '¿Te sacaste algún pelito?',
    yes: 'Sí',
    no: 'No',
    whatDidYouGet: '¿Qué obtuviste de tocarte/jalarte?',
    observeTitle: 'Vamos a observar sin juzgar',
    whatUrgeFeels: '¿Cómo se siente la urgencia? (Conecta con tu cuerpo)',
    whatSensations: '¿Qué sensación sientes con más fuerza? (Elige 1)',
    tightness: 'Tensión',
    pressure: 'Presión',
    contraction: 'Contracción',
    restlessness: 'Inquietud',
    shallowBreath: 'Respiración corta',
    burning: 'Ardor',
    tension: 'Tensión muscular',
    clenching: 'Apretar',
    heat: 'Calor',
    pitInStomach: 'Nudo en el estómago',
    buzzing: 'Hormigueo',
    bodySideQuestion: '¿Es más del lado derecho o izquierdo? ¿En el frente, medio o atrás? ¿Dónde sientes más fuerte?',
    right: 'Derecha',
    left: 'Izquierda',
    front: 'Frente',
    middle: 'Medio',
    back: 'Atrás',
    otherSensations: '¿Hay otras sensaciones? ¿Qué pasa cuando te pones curiosa sobre ellas? ¿Cambian?',
    followSensations: 'Sigue tus sensaciones por los próximos 30 segundos. No intentes hacer nada con ellas, solo obsérvalas.',
    doTheyChange: '¿Cambian cuando las observas con curiosidad?',
    breakTitle: '¿Cómo te sientes ahora?',
    wantToContinue: '¿Quieres continuar con el ejercicio?',
    continueYes: 'Sí, continuar',
    continueNo: 'Estoy bien, terminar',
    groundingTouch: 'En momentos difíciles, toca algo que te ancle al presente (textura, peso, respiración).',
    groundingTest: 'Cada momento difícil es un test de tu mente para ver si mantienes el control.',
    groundingAccept: 'Acepta el sentimiento, ride the wave of discomfort.',
    groundingIdentity: 'Nuestra identidad es una historia que nos hemos estado contando. El momento en que decides actuar diferente, salir de viejos patrones, empiezas a expandir tu identidad.',
    celebrate: '¡Celebra cada pequeño progreso, no importa qué tan pequeño sea!',
    celebrateCheckin: '¡Qué bien que estás aquí! Solo el hecho de checkear es un progreso enorme.',
    youDidIt: '¡Lo lograste!',
    logSaved: 'Registro guardado',
    whereAreYou: '¿Dónde estás?',
    whatDoing: '¿Qué estás haciendo?',
    breatheOrFinish: '¿Quieres hacer un ejercicio de respiración o terminar el registro?',
    doBreathing: 'Ejercicio de respiración',
    finishLog: 'Terminar registro',
    dataTitle: 'Tu datos',
    dataByHour: 'Por hora del día',
    dataByLocation: 'Lugares más comunes',
    dataByBodyPart: 'Zonas más tocadas',
    dataByTrigger: 'Triggers más comunes',
    dataTotalLogs: 'Total de registros',
    dataThisWeek: 'Esta semana',
    dataThisMonth: 'Este mes',
    journalTitle: 'Mi diario',
    journalNew: 'Nueva entrada',
    journalPlaceholder: 'Escribe lo que sientes...',
    journalSaved: 'Entrada guardada',
    profileTitle: 'Mi perfil',
    profileLogs: 'Registros',
    profileStreak: 'Racha',
    profileDays: 'días',
    profileSettings: 'Configuración',
    profileLanguage: 'Idioma',
    profileNotifications: 'Notificaciones',
    profileNotifTime: 'Hora de notificación',
    profileNotifMessage: 'Mensaje personalizado',
    profileStreakType: 'Tipo de racha',
    streakLogged: 'Días que registré',
    streakPullFree: 'Días sin tocarme',
    chatTitle: 'Habla con Brisa',
    chatPlaceholder: 'Escribe o dicta tu mensaje...',
    chatWelcome: 'Hola, soy Brisa. Estoy aquí para acompañarte. Puedes preguntarme lo que quieras sobre tricotilomanía.',
    next: 'Siguiente',
    done: 'Listo',
    save: 'Guardar',
    cancel: 'Cancelar',
    skip: 'Saltar',
    close: 'Cerrar',
    tapToSpeak: 'Toca para dictar',
    listening: 'Escuchando...',
  },
  en: {
    appName: 'Brisa',
    appTagline: 'Your calm space',
    navHome: 'Home',
    navData: 'Data',
    navJournal: 'Journal',
    navProfile: 'Profile',
    navChat: 'Chat',
    homeGreeting: 'Hi',
    homeQuestion: 'How are you?',
    homeMainButton: 'Log',
    homeStreak: 'day streak',
    homeLastLog: 'Last log',
    logTitle: "What's happening?",
    logOptionA: "I'm having an episode right now",
    logOptionB: 'My episode already passed',
    logOptionC: "I'm not sure",
    logOptionD: 'Just checking in',
    howDoYouFeel: 'How do you feel?',
    feelScale: 'From 0 to 10, how do you feel?',
    urgeScale: 'From 0 to 10, how strong is the urge to touch?',
    notAtAll: 'Not at all',
    veryMuch: 'Very much',
    calm: 'Calm',
    overwhelmed: 'Overwhelmed',
    breatheTitle: "Let's breathe together",
    breatheInhale: 'Inhale',
    breatheHold: 'Hold',
    breatheExhale: 'Exhale',
    breatheReady: 'Ready?',
    breatheStart: 'Start',
    breatheDone: 'Well done',
    whereTouch: 'Where are you touching?',
    eyebrows: 'Eyebrows',
    eyelashes: 'Eyelashes',
    scalp: 'Scalp',
    other: 'Other',
    specify: 'Specify...',
    rideTheWave: 'RIDE THE WAVE OF DISCOMFORT',
    blockerMessage: "I know it can feel like a lot, but let's find a blocker: gloves, headscarf, hat, a fidget toy...",
    cantRightNow: "I can't right now",
    foundOne: 'Found one',
    defineTogethertitle: "Let's define together",
    trigger: 'Trigger (what caused it?)',
    behavior: 'Behavior (what did you do?)',
    result: 'Result (what happened?)',
    didYouPull: 'Did you pull any hair?',
    yes: 'Yes',
    no: 'No',
    whatDidYouGet: 'What did you get from pulling/touching?',
    observeTitle: "Let's observe without judging",
    whatUrgeFeels: 'What does the urge feel like? (Check in with your body)',
    whatSensations: 'What sensation do you feel most strongly? (Choose 1)',
    tightness: 'Tightness',
    pressure: 'Pressure',
    contraction: 'Contraction',
    restlessness: 'Restlessness',
    shallowBreath: 'Shallow breath',
    burning: 'Burning',
    tension: 'Tension',
    clenching: 'Clenching',
    heat: 'Heat',
    pitInStomach: 'Pit in stomach',
    buzzing: 'Buzzing',
    bodySideQuestion: 'Is it more on the right side or the left? In the front, middle, or back? Where do you feel most strongly?',
    right: 'Right',
    left: 'Left',
    front: 'Front',
    middle: 'Middle',
    back: 'Back',
    otherSensations: 'Are there other sensations? What happens when you get curious about them? Do they change?',
    followSensations: 'Follow your sensations over the next 30 seconds. Not trying to do anything to or about them, simply observing them.',
    doTheyChange: 'Do they change at all when you observe them with an attitude of curiosity?',
    breakTitle: 'How do you feel now?',
    wantToContinue: 'Do you want to continue the exercise?',
    continueYes: 'Yes, continue',
    continueNo: "I'm good, finish",
    groundingTouch: 'In difficult moments, touch something that anchors you to the present (texture, weight, breath).',
    groundingTest: 'Every difficult moment is a test from your mind to see if you keep control.',
    groundingAccept: 'Accept the feeling, ride the wave of discomfort.',
    groundingIdentity: "Our identity is a story we've been telling ourselves. The moment you decide to act differently, to step outside old patterns, you start expanding your identity.",
    celebrate: 'Celebrate every small progress, no matter how small!',
    celebrateCheckin: "So glad you're here! Just checking in is huge progress.",
    youDidIt: 'You did it!',
    logSaved: 'Log saved',
    whereAreYou: 'Where are you?',
    whatDoing: 'What are you doing?',
    breatheOrFinish: 'Would you like to do a breathing exercise or finish the log?',
    doBreathing: 'Breathing exercise',
    finishLog: 'Finish log',
    dataTitle: 'Your data',
    dataByHour: 'By hour of day',
    dataByLocation: 'Most common places',
    dataByBodyPart: 'Most touched areas',
    dataByTrigger: 'Most common triggers',
    dataTotalLogs: 'Total logs',
    dataThisWeek: 'This week',
    dataThisMonth: 'This month',
    journalTitle: 'My journal',
    journalNew: 'New entry',
    journalPlaceholder: 'Write what you feel...',
    journalSaved: 'Entry saved',
    profileTitle: 'My profile',
    profileLogs: 'Logs',
    profileStreak: 'Streak',
    profileDays: 'days',
    profileSettings: 'Settings',
    profileLanguage: 'Language',
    profileNotifications: 'Notifications',
    profileNotifTime: 'Notification time',
    profileNotifMessage: 'Custom message',
    profileStreakType: 'Streak type',
    streakLogged: 'Days I logged',
    streakPullFree: 'Pull-free days',
    chatTitle: 'Talk to Brisa',
    chatPlaceholder: 'Type or dictate your message...',
    chatWelcome: "Hi, I'm Brisa. I'm here to support you. Ask me anything about trichotillomania.",
    next: 'Next',
    done: 'Done',
    save: 'Save',
    cancel: 'Cancel',
    skip: 'Skip',
    close: 'Close',
    tapToSpeak: 'Tap to dictate',
    listening: 'Listening...',
  },
};


// ============================================================
// STORAGE (AsyncStorage helpers)
// ============================================================
const STORAGE_KEYS = {
  LOGS: 'brisa_logs',
  JOURNAL: 'brisa_journal',
  SETTINGS: 'brisa_settings',
  STREAK: 'brisa_streak',
  SAVED_OPTIONS: 'brisa_saved_options',
};

async function saveLogs(logs) {
  await AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
}

async function getLogs() {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.LOGS);
  return data ? JSON.parse(data) : [];
}

async function addLog(log) {
  const logs = await getLogs();
  const newLog = { id: Date.now().toString(), timestamp: new Date().toISOString(), ...log };
  logs.unshift(newLog);
  await saveLogs(logs);
  return newLog;
}

async function getJournalEntries() {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.JOURNAL);
  return data ? JSON.parse(data) : [];
}

async function addJournalEntry(entry) {
  const entries = await getJournalEntries();
  const newEntry = { id: Date.now().toString(), timestamp: new Date().toISOString(), ...entry };
  entries.unshift(newEntry);
  await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
  return newEntry;
}

async function getSettings() {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : {
    language: 'es', notificationsEnabled: false, notificationTime: '09:00',
    notificationMessage: '', streakType: 'logged',
  };
}

async function saveSettings(settings) {
  await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

async function getStreakData() {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
  return data ? JSON.parse(data) : {
    currentStreak: 0, longestStreak: 0, lastLogDate: null, pullFreeDays: [], loggedDays: [],
  };
}

async function updateStreak(type, date) {
  const streak = await getStreakData();
  const today = date || new Date().toISOString().split('T')[0];
  if (type === 'logged') {
    if (!streak.loggedDays.includes(today)) streak.loggedDays.push(today);
  } else if (type === 'pullFree') {
    if (!streak.pullFreeDays.includes(today)) streak.pullFreeDays.push(today);
  }
  const days = type === 'logged' ? streak.loggedDays : streak.pullFreeDays;
  days.sort();
  let currentStreak = 0;
  const todayDate = new Date(today);
  for (let i = 0; i <= 365; i++) {
    const checkDate = new Date(todayDate);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    if (days.includes(dateStr)) { currentStreak++; } else { break; }
  }
  streak.currentStreak = currentStreak;
  streak.longestStreak = Math.max(streak.longestStreak, currentStreak);
  streak.lastLogDate = today;
  await AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  return streak;
}

async function getSavedOptions(key) {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_OPTIONS);
  const all = data ? JSON.parse(data) : {};
  return all[key] || [];
}

async function addSavedOption(key, value) {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_OPTIONS);
  const all = data ? JSON.parse(data) : {};
  if (!all[key]) all[key] = [];
  if (!all[key].includes(value)) {
    all[key].unshift(value);
    all[key] = all[key].slice(0, 20);
  }
  await AsyncStorage.setItem(STORAGE_KEYS.SAVED_OPTIONS, JSON.stringify(all));
}

// ============================================================
// CONTEXT (AppProvider + useApp)
// ============================================================
const AppContext = createContext();

function AppProvider({ children }) {
  const [language, setLanguage] = useState('es');
  const [settings, setSettingsState] = useState(null);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, st, l] = await Promise.all([getSettings(), getStreakData(), getLogs()]);
        setSettingsState(s);
        setLanguage(s.language || 'es');
        setStreak(st);
        setLogs(l);
      } catch (e) { console.warn('Error loading app data:', e); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const t = useCallback((key) => {
    const lang = strings[language] || strings.es;
    return lang[key] || strings.es[key] || key;
  }, [language]);

  const updateSettings = useCallback(async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    if (newSettings.language) setLanguage(newSettings.language);
    await saveSettings(updated);
  }, [settings]);

  const refreshLogs = useCallback(async () => { setLogs(await getLogs()); }, []);
  const refreshStreak = useCallback(async () => { setStreak(await getStreakData()); }, []);
  const getSmartOptions = useCallback(async (key) => await getSavedOptions(key), []);
  const saveSmartOption = useCallback(async (key, value) => await addSavedOption(key, value), []);

  return (
    <AppContext.Provider value={{
      language, settings, streak, logs, isLoading, t,
      updateSettings, refreshLogs, refreshStreak, getSmartOptions, saveSmartOption,
    }}>
      {children}
    </AppContext.Provider>
  );
}

function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}


// ============================================================
// COMPONENTS
// ============================================================

// --- OptionButton ---
function OptionButton({ label, onPress, selected, icon, small, secondary }) {
  return (
    <TouchableOpacity
      style={[
        optBtnStyles.button,
        selected && optBtnStyles.selected,
        small && optBtnStyles.small,
        secondary && optBtnStyles.secondary,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon ? <Text style={optBtnStyles.icon}>{icon}</Text> : null}
      <Text style={[
        optBtnStyles.label,
        selected && optBtnStyles.labelSelected,
        small && optBtnStyles.labelSmall,
        secondary && optBtnStyles.labelSecondary,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const optBtnStyles = StyleSheet.create({
  button: {
    backgroundColor: Colors.card, borderRadius: 16, paddingVertical: 18, paddingHorizontal: 24,
    marginVertical: 6, borderWidth: 1.5, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center',
  },
  selected: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  small: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, marginVertical: 4 },
  secondary: { backgroundColor: 'transparent', borderColor: Colors.border, borderStyle: 'dashed' },
  icon: { fontSize: 20, marginRight: 12 },
  label: { fontSize: 16, fontWeight: '500', color: Colors.text, flex: 1 },
  labelSelected: { color: Colors.primaryDark, fontWeight: '600' },
  labelSmall: { fontSize: 14 },
  labelSecondary: { color: Colors.textLight, fontStyle: 'italic' },
});

// --- ScaleSlider ---
function ScaleSlider({ label, value, onChange, leftLabel, rightLabel, min = 0, max = 10 }) {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <View style={scaleStyles.container}>
      {label && <Text style={scaleStyles.label}>{label}</Text>}
      <View style={scaleStyles.row}>
        {numbers.map((num) => (
          <TouchableOpacity
            key={num}
            style={[scaleStyles.dot, num === value && scaleStyles.dotActive, num <= value && scaleStyles.dotFilled]}
            onPress={() => onChange(num)}
          >
            <Text style={[scaleStyles.dotText, num === value && scaleStyles.dotTextActive]}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={scaleStyles.labelsRow}>
        <Text style={scaleStyles.edgeLabel}>{leftLabel}</Text>
        <Text style={scaleStyles.edgeLabel}>{rightLabel}</Text>
      </View>
    </View>
  );
}

const scaleStyles = StyleSheet.create({
  container: { marginVertical: 16 },
  label: { fontSize: 16, fontWeight: '500', color: Colors.text, marginBottom: 16, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  dot: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.border,
  },
  dotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary, transform: [{ scale: 1.2 }] },
  dotFilled: { borderColor: Colors.primaryLight, backgroundColor: Colors.primaryLight },
  dotText: { fontSize: 12, fontWeight: '600', color: Colors.textLight },
  dotTextActive: { color: Colors.textOnPrimary },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 },
  edgeLabel: { fontSize: 12, color: Colors.textMuted },
});

// --- VoiceInput ---
function VoiceInput({ value, onChangeText, placeholder, multiline = true, style }) {
  const { t } = useApp();
  const [isListening, setIsListening] = useState(false);
  const handleMicPress = () => { setIsListening(true); setTimeout(() => setIsListening(false), 2000); };
  return (
    <View style={[voiceStyles.container, style]}>
      <TextInput
        style={[voiceStyles.input, multiline && voiceStyles.multiline]}
        value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor={Colors.textMuted} multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      <TouchableOpacity style={[voiceStyles.micButton, isListening && voiceStyles.micButtonActive]} onPress={handleMicPress}>
        <Text style={voiceStyles.micIcon}>{isListening ? '...' : 'mic'}</Text>
        <Text style={[voiceStyles.micLabel, isListening && voiceStyles.micLabelActive]}>
          {isListening ? t('listening') : t('tapToSpeak')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const voiceStyles = StyleSheet.create({
  container: { marginVertical: 8 },
  input: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16, fontSize: 16,
    color: Colors.text, borderWidth: 1, borderColor: Colors.border, minHeight: 48,
  },
  multiline: { minHeight: 100, paddingTop: 16 },
  micButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8,
    paddingVertical: 10, paddingHorizontal: 20, backgroundColor: Colors.surface, borderRadius: 24, alignSelf: 'center',
  },
  micButtonActive: { backgroundColor: Colors.primaryLight },
  micIcon: { fontSize: 14, marginRight: 8, color: Colors.textLight },
  micLabel: { fontSize: 14, color: Colors.textLight },
  micLabelActive: { color: Colors.primary, fontWeight: '600' },
});

// --- BreathingExercise (4s inhale, 6s exhale, 3 cycles) ---
const CIRCLE_SIZE = SCREEN_WIDTH * 0.55;
const NUM_PARTICLES = 24;
const generateParticles = () =>
  Array.from({ length: NUM_PARTICLES }, (_, i) => ({
    id: i, angle: (i / NUM_PARTICLES) * Math.PI * 2,
    radius: 0.3 + Math.random() * 0.7, size: 3 + Math.random() * 5, opacity: 0.3 + Math.random() * 0.7,
  }));

const INHALE_MS = 4000;
const EXHALE_MS = 6000;
const CYCLE_MS = INHALE_MS + EXHALE_MS;
const TOTAL_CYCLES = 3;
const TOTAL_DURATION = TOTAL_CYCLES * (CYCLE_MS / 1000);

function BreathingExercise({ onComplete }) {
  const { t } = useApp();
  const [phase, setPhase] = useState('ready');
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
      if (cyclesDone >= TOTAL_CYCLES) { setPhase('done'); return; }
      setPhase('inhale');
      setCycleCount(cyclesDone + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: INHALE_MS, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.8, duration: INHALE_MS, useNativeDriver: true }),
        Animated.timing(particleAnim, { toValue: 1, duration: INHALE_MS, useNativeDriver: true }),
      ]).start();
      timer = setTimeout(() => {
        setPhase('exhale');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.4, duration: EXHALE_MS, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.3, duration: EXHALE_MS, useNativeDriver: true }),
          Animated.timing(particleAnim, { toValue: 0, duration: EXHALE_MS, useNativeDriver: true }),
        ]).start();
      }, INHALE_MS);
      cyclesDone++;
    };
    const countdown = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { clearInterval(countdown); return 0; } return prev - 1; });
    }, 1000);
    runCycle();
    const cycleInterval = setInterval(runCycle, CYCLE_MS);
    const stopTimeout = setTimeout(() => { clearInterval(cycleInterval); setPhase('done'); }, TOTAL_CYCLES * CYCLE_MS);
    return () => { clearInterval(countdown); clearInterval(cycleInterval); clearTimeout(timer); clearTimeout(stopTimeout); };
  }, [started]);

  useEffect(() => { if (phase === 'done' && onComplete) setTimeout(onComplete, 1500); }, [phase]);

  const phaseText = phase === 'inhale' ? t('breatheInhale') : phase === 'exhale' ? t('breatheExhale') : phase === 'done' ? t('breatheDone') : t('breatheReady');

  if (!started) {
    return (
      <View style={breathStyles.container}>
        <Text style={breathStyles.title}>{t('breatheTitle')}</Text>
        <Text style={breathStyles.instructions}>4s inhala  ~  6s exhala  ~  3 ciclos</Text>
        <TouchableOpacity style={breathStyles.startButton} onPress={() => setStarted(true)}>
          <View style={breathStyles.startCircle}><Text style={breathStyles.startText}>{t('breatheStart')}</Text></View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={breathStyles.container}>
      <Text style={breathStyles.title}>{t('breatheTitle')}</Text>
      <Text style={breathStyles.timer}>{timeLeft}s  ~  {cycleCount}/{TOTAL_CYCLES}</Text>
      <View style={breathStyles.circleContainer}>
        {particles.map((p) => {
          const ps = particleAnim.interpolate({ inputRange: [0, 1], outputRange: [p.radius * 0.5, p.radius] });
          const x = Math.cos(p.angle) * (CIRCLE_SIZE * 0.55);
          const y = Math.sin(p.angle) * (CIRCLE_SIZE * 0.55);
          return (
            <Animated.View key={p.id} style={[breathStyles.particle, {
              width: p.size, height: p.size, borderRadius: p.size / 2,
              opacity: glowOpacity.interpolate({ inputRange: [0.3, 0.8], outputRange: [p.opacity * 0.3, p.opacity] }),
              transform: [{ translateX: x }, { translateY: y }, { scale: ps }],
            }]} />
          );
        })}
        <Animated.View style={[breathStyles.breatheCircle, { transform: [{ scale }], opacity: glowOpacity }]} />
        <Animated.View style={[breathStyles.innerCircle, { transform: [{ scale }] }]} />
        <Text style={breathStyles.phaseText}>{phaseText}</Text>
      </View>
    </View>
  );
}

const breathStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  instructions: { fontSize: 13, color: Colors.textMuted, marginBottom: 8, letterSpacing: 1 },
  timer: { fontSize: 14, color: Colors.textMuted, marginBottom: 40 },
  circleContainer: { width: CIRCLE_SIZE * 1.3, height: CIRCLE_SIZE * 1.3, alignItems: 'center', justifyContent: 'center' },
  breatheCircle: { position: 'absolute', width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2, backgroundColor: Colors.primaryLight },
  innerCircle: { position: 'absolute', width: CIRCLE_SIZE * 0.6, height: CIRCLE_SIZE * 0.6, borderRadius: (CIRCLE_SIZE * 0.6) / 2, backgroundColor: Colors.primary, opacity: 0.4 },
  particle: { position: 'absolute', backgroundColor: Colors.accent },
  phaseText: { position: 'absolute', fontSize: 20, fontWeight: '600', color: Colors.text },
  startButton: { marginTop: 40 },
  startCircle: { width: CIRCLE_SIZE * 0.7, height: CIRCLE_SIZE * 0.7, borderRadius: (CIRCLE_SIZE * 0.7) / 2, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  startText: { fontSize: 20, fontWeight: '600', color: Colors.primary },
});


// ============================================================
// SCREENS
// ============================================================

// --- HomeScreen (calming, only register button) ---
const BUTTON_SIZE = SCREEN_WIDTH * 0.52;

function HomeScreen({ navigation }) {
  const { refreshLogs, refreshStreak } = useApp();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { refreshLogs(); refreshStreak(); }, []);

  useEffect(() => {
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.06, duration: 3000, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
    ]));
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    const glow = Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 0.6, duration: 3500, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.3, duration: 3500, useNativeDriver: true }),
    ]));
    glow.start();
    return () => glow.stop();
  }, []);

  useEffect(() => {
    const float = Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: -8, duration: 4000, useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: 0, duration: 4000, useNativeDriver: true }),
    ]));
    float.start();
    return () => float.stop();
  }, []);

  return (
    <SafeAreaView style={homeStyles.container}>
      <View style={homeStyles.centerContent}>
        <Animated.Text style={[homeStyles.brandName, { opacity: glowAnim }]}>brisa</Animated.Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('LogFlow')}>
          <Animated.View style={[homeStyles.outerGlow, { opacity: glowAnim, transform: [{ scale: pulseAnim }, { translateY: floatAnim }] }]} />
          <Animated.View style={[homeStyles.mainButton, { transform: [{ scale: pulseAnim }, { translateY: floatAnim }] }]}>
            <View style={homeStyles.mainButtonInner}>
              <Text style={homeStyles.mainButtonIcon}>~</Text>
              <Text style={homeStyles.mainButtonText}>Registrar</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
        <Animated.Text style={[homeStyles.subtitle, { opacity: glowAnim }]}>toca cuando quieras</Animated.Text>
      </View>
    </SafeAreaView>
  );
}

const homeStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 18, fontWeight: '300', color: Colors.textMuted, letterSpacing: 6, textTransform: 'lowercase', marginBottom: 48 },
  outerGlow: { position: 'absolute', width: BUTTON_SIZE + 30, height: BUTTON_SIZE + 30, borderRadius: (BUTTON_SIZE + 30) / 2, backgroundColor: Colors.primaryLight, left: -15, top: -15 },
  mainButton: { width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BUTTON_SIZE / 2, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 30, elevation: 8 },
  mainButtonInner: { width: BUTTON_SIZE * 0.78, height: BUTTON_SIZE * 0.78, borderRadius: (BUTTON_SIZE * 0.78) / 2, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  mainButtonIcon: { fontSize: 32, color: Colors.textOnPrimary, fontWeight: '300', marginBottom: 2 },
  mainButtonText: { fontSize: 18, fontWeight: '600', color: Colors.textOnPrimary, letterSpacing: 1 },
  subtitle: { fontSize: 14, fontWeight: '300', color: Colors.textMuted, marginTop: 40, letterSpacing: 2 },
});


// --- DataScreen ---
const CHART_WIDTH = SCREEN_WIDTH - 48;
const chartConfig = {
  backgroundColor: Colors.card, backgroundGradientFrom: Colors.card, backgroundGradientTo: Colors.card,
  color: (opacity = 1) => `rgba(212, 132, 90, ${opacity})`, labelColor: () => Colors.textLight,
  propsForDots: { r: '4', strokeWidth: '2', stroke: Colors.primary }, decimalPlaces: 0,
  barPercentage: 0.6, style: { borderRadius: 16 },
};

function DataScreen() {
  const { t, logs } = useApp();
  const analytics = useMemo(() => {
    if (!logs.length) return null;
    const hourCounts = Array(24).fill(0);
    logs.forEach((log) => { const hour = new Date(log.timestamp).getHours(); hourCounts[hour]++; });
    const bodyParts = {}; logs.forEach((log) => { if (log.bodyPart) bodyParts[log.bodyPart] = (bodyParts[log.bodyPart] || 0) + 1; });
    const locations = {}; logs.forEach((log) => { if (log.location) locations[log.location] = (locations[log.location] || 0) + 1; });
    const triggers = {}; logs.forEach((log) => { if (log.trigger) triggers[log.trigger] = (triggers[log.trigger] || 0) + 1; });
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = logs.filter((l) => new Date(l.timestamp) >= weekAgo).length;
    const thisMonth = logs.filter((l) => new Date(l.timestamp) >= monthAgo).length;
    const recentLogs = logs.slice(0, 14).reverse();
    const feelData = recentLogs.map((l) => l.feelScale ?? 5);
    return { hourCounts, bodyParts, locations, triggers, thisWeek, thisMonth, feelData, recentLogs };
  }, [logs]);

  const renderTopItems = (obj, title) => {
    const sorted = Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (!sorted.length) return null;
    const max = sorted[0][1];
    return (
      <View style={dataStyles.section}>
        <Text style={dataStyles.sectionTitle}>{title}</Text>
        {sorted.map(([key, count]) => (
          <View key={key} style={dataStyles.barItem}>
            <Text style={dataStyles.barLabel}>{key}</Text>
            <View style={dataStyles.barTrack}><View style={[dataStyles.barFill, { width: `${(count / max) * 100}%` }]} /></View>
            <Text style={dataStyles.barCount}>{count}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (!analytics) {
    return (
      <SafeAreaView style={dataStyles.container}>
        <Text style={dataStyles.title}>{t('dataTitle')}</Text>
        <View style={dataStyles.emptyState}>
          <Text style={dataStyles.emptyIcon}>~</Text>
          <Text style={dataStyles.emptyText}>Aún no hay datos. Haz tu primer registro para ver tu análisis aquí.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hourLabels = ['0', '3', '6', '9', '12', '15', '18', '21'];
  const hourData = [0, 3, 6, 9, 12, 15, 18, 21].map((h) => analytics.hourCounts[h]);

  return (
    <SafeAreaView style={dataStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={dataStyles.title}>{t('dataTitle')}</Text>
        <View style={dataStyles.summaryRow}>
          <View style={dataStyles.summaryCard}><Text style={dataStyles.summaryNumber}>{logs.length}</Text><Text style={dataStyles.summaryLabel}>{t('dataTotalLogs')}</Text></View>
          <View style={dataStyles.summaryCard}><Text style={dataStyles.summaryNumber}>{analytics.thisWeek}</Text><Text style={dataStyles.summaryLabel}>{t('dataThisWeek')}</Text></View>
          <View style={dataStyles.summaryCard}><Text style={dataStyles.summaryNumber}>{analytics.thisMonth}</Text><Text style={dataStyles.summaryLabel}>{t('dataThisMonth')}</Text></View>
        </View>
        {analytics.feelData.length > 1 && (
          <View style={dataStyles.section}>
            <Text style={dataStyles.sectionTitle}>{t('howDoYouFeel')} — tendencia</Text>
            <LineChart data={{ labels: analytics.recentLogs.map((_, i) => (i % 3 === 0 ? `${i + 1}` : '')), datasets: [{ data: analytics.feelData }] }} width={CHART_WIDTH} height={180} chartConfig={chartConfig} bezier style={dataStyles.chart} withInnerLines={false} />
          </View>
        )}
        <View style={dataStyles.section}>
          <Text style={dataStyles.sectionTitle}>{t('dataByHour')}</Text>
          <BarChart data={{ labels: hourLabels, datasets: [{ data: hourData }] }} width={CHART_WIDTH} height={180} chartConfig={chartConfig} style={dataStyles.chart} withInnerLines={false} showValuesOnTopOfBars />
        </View>
        {renderTopItems(analytics.bodyParts, t('dataByBodyPart'))}
        {renderTopItems(analytics.locations, t('dataByLocation'))}
        {renderTopItems(analytics.triggers, t('dataByTrigger'))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const dataStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16, color: Colors.textMuted },
  emptyText: { fontSize: 16, color: Colors.textLight, textAlign: 'center', lineHeight: 24 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  summaryCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  summaryNumber: { fontSize: 24, fontWeight: '700', color: Colors.primary },
  summaryLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  section: { paddingHorizontal: 24, marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 16 },
  chart: { borderRadius: 16, paddingRight: 0 },
  barItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  barLabel: { width: 90, fontSize: 14, color: Colors.text },
  barTrack: { flex: 1, height: 10, backgroundColor: Colors.surface, borderRadius: 5, marginHorizontal: 8, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 5 },
  barCount: { width: 30, fontSize: 14, fontWeight: '600', color: Colors.textLight, textAlign: 'right' },
});


// --- JournalScreen ---
function JournalScreen() {
  const { t } = useApp();
  const [entries, setEntries] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [newText, setNewText] = useState('');
  const loadEntries = useCallback(async () => { setEntries(await getJournalEntries()); }, []);
  useEffect(() => { loadEntries(); }, []);
  const handleSave = async () => {
    if (!newText.trim()) return;
    await addJournalEntry({ text: newText.trim() });
    setNewText(''); setShowNew(false); loadEntries();
  };
  const formatDate = (iso) => new Date(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (iso) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const renderEntry = ({ item }) => (
    <View style={journalStyles.entry}>
      <View style={journalStyles.entryHeader}>
        <Text style={journalStyles.entryDate}>{formatDate(item.timestamp)}</Text>
        <Text style={journalStyles.entryTime}>{formatTime(item.timestamp)}</Text>
      </View>
      <Text style={journalStyles.entryText}>{item.text}</Text>
    </View>
  );
  return (
    <SafeAreaView style={journalStyles.container}>
      <View style={journalStyles.header}>
        <Text style={journalStyles.title}>{t('journalTitle')}</Text>
        <TouchableOpacity style={journalStyles.newButton} onPress={() => setShowNew(true)}>
          <Text style={journalStyles.newButtonText}>+ {t('journalNew')}</Text>
        </TouchableOpacity>
      </View>
      {entries.length === 0 ? (
        <View style={journalStyles.emptyState}>
          <Text style={journalStyles.emptyText}>Tu diario está vacío. Empieza a escribir lo que sientes.</Text>
        </View>
      ) : (
        <FlatList data={entries} renderItem={renderEntry} keyExtractor={(item) => item.id} contentContainerStyle={journalStyles.list} showsVerticalScrollIndicator={false} />
      )}
      <Modal visible={showNew} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={journalStyles.modalOverlay}>
          <View style={journalStyles.modalContent}>
            <View style={journalStyles.modalHeader}>
              <TouchableOpacity onPress={() => { setShowNew(false); setNewText(''); }}><Text style={journalStyles.modalCancel}>{t('cancel')}</Text></TouchableOpacity>
              <Text style={journalStyles.modalTitle}>{t('journalNew')}</Text>
              <TouchableOpacity onPress={handleSave}><Text style={journalStyles.modalSave}>{t('save')}</Text></TouchableOpacity>
            </View>
            <Text style={journalStyles.modalDate}>{formatDate(new Date().toISOString())}</Text>
            <TextInput style={journalStyles.modalInput} value={newText} onChangeText={setNewText} placeholder={t('journalPlaceholder')} placeholderTextColor={Colors.textMuted} multiline autoFocus textAlignVertical="top" />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const journalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text },
  newButton: { backgroundColor: Colors.primaryLight, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  newButtonText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  list: { paddingHorizontal: 24, paddingBottom: 20 },
  entry: { backgroundColor: Colors.card, borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  entryDate: { fontSize: 13, fontWeight: '600', color: Colors.primary, textTransform: 'capitalize' },
  entryTime: { fontSize: 13, color: Colors.textMuted },
  entryText: { fontSize: 16, color: Colors.text, lineHeight: 24 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: Colors.textLight, textAlign: 'center', lineHeight: 24 },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  modalCancel: { fontSize: 16, color: Colors.textLight },
  modalSave: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  modalDate: { fontSize: 14, color: Colors.textMuted, marginBottom: 16, textTransform: 'capitalize' },
  modalInput: { flex: 1, fontSize: 16, color: Colors.text, lineHeight: 26 },
});

// --- ChatScreen ---
function getSimulatedResponse(userText) {
  const lower = userText.toLowerCase();
  if (lower.includes('qué es') || lower.includes('what is') || lower.includes('tricho'))
    return 'La tricotilomanía es un trastorno de comportamiento repetitivo centrado en el cuerpo (BFRB). Se caracteriza por la urgencia recurrente de jalarse el cabello. Es más común de lo que piensas — afecta a aproximadamente el 1-2% de la población. No estás sola.';
  if (lower.includes('ayuda') || lower.includes('help') || lower.includes('no puedo'))
    return 'Entiendo que puede ser muy difícil. Recuerda: cada momento es una oportunidad nueva. Intenta identificar qué estás sintiendo ahora mismo. ¿Puedes describir qué sensación física tienes? A veces, nombrar lo que sentimos nos ayuda a procesarlo. Estoy aquí contigo.';
  if (lower.includes('tip') || lower.includes('consejo'))
    return 'Aquí van algunos tips:\n\nTen un "kit de blockers" a la mano: guantes, gorro, juguete sensorial\n\nPractica la técnica de "surfear la ola" — observa la urgencia sin actuar\n\nRegistra tus episodios para identificar patrones\n\nSé gentil contigo misma — el progreso no es lineal';
  if (lower.includes('respirar') || lower.includes('breath') || lower.includes('ansiedad'))
    return 'La respiración es una herramienta poderosa. Intenta esto:\n\n1. Inhala 4 segundos\n2. Exhala 6 segundos\n\nRepite 3 veces. Esto activa tu sistema nervioso parasimpático y te ayuda a sentir calma. Puedes usar el botón de registro en la pantalla principal para hacer un ejercicio guiado.';
  return 'Gracias por compartir eso conmigo. ¿Puedes contarme más sobre cómo te sientes? Estoy aquí para escucharte y ayudarte a explorar tus emociones. Recuerda que cada paso que das, por pequeño que sea, cuenta.';
}

function ChatScreen() {
  const { t } = useApp();
  const [messages, setMessages] = useState([{ id: '0', role: 'assistant', text: t('chatWelcome') }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();
  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { id: Date.now().toString(), role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]); setInput(''); setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: getSimulatedResponse(userMessage.text) }]);
      setIsTyping(false);
    }, 1500);
  };
  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[chatStyles.messageBubble, isUser ? chatStyles.userBubble : chatStyles.aiBubble]}>
        {!isUser && <Text style={chatStyles.aiAvatar}>~</Text>}
        <View style={[chatStyles.messageContent, isUser ? chatStyles.userContent : chatStyles.aiContent]}>
          <Text style={[chatStyles.messageText, isUser && chatStyles.userText]}>{item.text}</Text>
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView style={chatStyles.container}>
      <View style={chatStyles.header}>
        <Text style={chatStyles.headerIcon}>~</Text>
        <Text style={chatStyles.title}>{t('chatTitle')}</Text>
      </View>
      <KeyboardAvoidingView style={chatStyles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        <FlatList ref={flatListRef} data={messages} renderItem={renderMessage} keyExtractor={(item) => item.id} contentContainerStyle={chatStyles.messagesList} onContentSizeChange={() => flatListRef.current?.scrollToEnd()} showsVerticalScrollIndicator={false} />
        {isTyping && <View style={chatStyles.typingContainer}><Text style={chatStyles.typingText}>Brisa está escribiendo...</Text></View>}
        <View style={chatStyles.inputBar}>
          <TextInput style={chatStyles.input} value={input} onChangeText={setInput} placeholder={t('chatPlaceholder')} placeholderTextColor={Colors.textMuted} multiline maxLength={1000} />
          <TouchableOpacity style={[chatStyles.sendButton, !input.trim() && chatStyles.sendButtonDisabled]} onPress={handleSend} disabled={!input.trim()}>
            <Text style={chatStyles.sendIcon}>^</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const chatStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  headerIcon: { fontSize: 24, marginRight: 10, color: Colors.primary },
  title: { fontSize: 20, fontWeight: '600', color: Colors.text },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageBubble: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },
  aiAvatar: { fontSize: 20, marginRight: 8, marginBottom: 4, color: Colors.primary },
  messageContent: { maxWidth: '80%', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16 },
  userContent: { backgroundColor: Colors.primary, borderBottomRightRadius: 4, marginLeft: 'auto' },
  aiContent: { backgroundColor: Colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  messageText: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  userText: { color: Colors.textOnPrimary },
  typingContainer: { paddingHorizontal: 24, paddingBottom: 8 },
  typingText: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.divider, backgroundColor: Colors.background },
  input: { flex: 1, backgroundColor: Colors.card, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, fontSize: 15, color: Colors.text, maxHeight: 100, borderWidth: 1, borderColor: Colors.border },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  sendButtonDisabled: { backgroundColor: Colors.border },
  sendIcon: { fontSize: 18, fontWeight: '700', color: Colors.textOnPrimary },
});


// --- ProfileScreen ---
function ProfileScreen() {
  const { t, settings, streak, logs, updateSettings } = useApp();
  if (!settings) return null;
  const handleLanguageToggle = () => updateSettings({ language: settings.language === 'es' ? 'en' : 'es' });
  const handleStreakTypeToggle = () => updateSettings({ streakType: settings.streakType === 'logged' ? 'pullFree' : 'logged' });
  return (
    <SafeAreaView style={profStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={profStyles.title}>{t('profileTitle')}</Text>
        <View style={profStyles.statsCard}>
          <View style={profStyles.statItem}><Text style={profStyles.statNumber}>{logs.length}</Text><Text style={profStyles.statLabel}>{t('profileLogs')}</Text></View>
          <View style={profStyles.statDivider} />
          <View style={profStyles.statItem}><Text style={profStyles.statNumber}>{streak.currentStreak}</Text><Text style={profStyles.statLabel}>{t('profileStreak')}</Text></View>
          <View style={profStyles.statDivider} />
          <View style={profStyles.statItem}><Text style={profStyles.statNumber}>{streak.longestStreak}</Text><Text style={profStyles.statLabel}>Mejor</Text></View>
        </View>
        <View style={profStyles.streakVisual}>
          <Text style={profStyles.streakBig}>{streak.currentStreak}</Text>
          <Text style={profStyles.streakDesc}>{settings.streakType === 'logged' ? t('streakLogged') : t('streakPullFree')}</Text>
        </View>
        <Text style={profStyles.sectionTitle}>{t('profileSettings')}</Text>
        <View style={profStyles.settingRow}>
          <View><Text style={profStyles.settingLabel}>{t('profileLanguage')}</Text><Text style={profStyles.settingDesc}>{settings.language === 'es' ? 'Español' : 'English'}</Text></View>
          <TouchableOpacity style={profStyles.langToggle} onPress={handleLanguageToggle}><Text style={profStyles.langToggleText}>{settings.language === 'es' ? 'EN' : 'ES'}</Text></TouchableOpacity>
        </View>
        <View style={profStyles.settingRow}>
          <View style={{ flex: 1 }}><Text style={profStyles.settingLabel}>{t('profileStreakType')}</Text><Text style={profStyles.settingDesc}>{settings.streakType === 'logged' ? t('streakLogged') : t('streakPullFree')}</Text></View>
          <TouchableOpacity style={profStyles.langToggle} onPress={handleStreakTypeToggle}><Text style={profStyles.langToggleText}>{settings.streakType === 'logged' ? 'A' : 'B'}</Text></TouchableOpacity>
        </View>
        <View style={profStyles.settingRow}>
          <View style={{ flex: 1 }}><Text style={profStyles.settingLabel}>{t('profileNotifications')}</Text><Text style={profStyles.settingDesc}>{t('profileNotifTime')}</Text></View>
          <Switch value={settings.notificationsEnabled} onValueChange={(val) => updateSettings({ notificationsEnabled: val })} trackColor={{ true: Colors.primaryLight, false: Colors.border }} thumbColor={settings.notificationsEnabled ? Colors.primary : Colors.textMuted} />
        </View>
        {settings.notificationsEnabled && (
          <>
            <View style={profStyles.settingRow}><Text style={profStyles.settingLabel}>{t('profileNotifTime')}</Text><TouchableOpacity style={profStyles.timeButton}><Text style={profStyles.timeText}>{settings.notificationTime || '09:00'}</Text></TouchableOpacity></View>
            <View style={profStyles.settingBlock}><Text style={profStyles.settingLabel}>{t('profileNotifMessage')}</Text><TextInput style={profStyles.messageInput} value={settings.notificationMessage} onChangeText={(text) => updateSettings({ notificationMessage: text })} placeholder="Ej: Recuerda respirar" placeholderTextColor={Colors.textMuted} multiline /></View>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const profStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  statsCard: { flexDirection: 'row', backgroundColor: Colors.card, marginHorizontal: 24, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: Colors.border },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.divider },
  statNumber: { fontSize: 28, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  streakVisual: { alignItems: 'center', paddingVertical: 28 },
  streakBig: { fontSize: 52, fontWeight: '800', color: Colors.primary, marginVertical: 4 },
  streakDesc: { fontSize: 14, color: Colors.textLight },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: Colors.text, paddingHorizontal: 24, marginBottom: 16, marginTop: 8 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, marginHorizontal: 24, marginBottom: 8, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: Colors.border },
  settingBlock: { backgroundColor: Colors.card, marginHorizontal: 24, marginBottom: 8, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: Colors.border },
  settingLabel: { fontSize: 16, fontWeight: '500', color: Colors.text },
  settingDesc: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  langToggle: { backgroundColor: Colors.primaryLight, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  langToggleText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  timeButton: { backgroundColor: Colors.surface, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  timeText: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  messageInput: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.text, marginTop: 10, minHeight: 60 },
});


// --- LogFlowScreen ---
const LOG_STEPS = {
  initial: { type: 'initial' },
  feelScale: { type: 'scale', key: 'feelScale', labelKey: 'feelScale', leftKey: 'calm', rightKey: 'overwhelmed' },
  urgeScale: { type: 'scale', key: 'urgeScale', labelKey: 'urgeScale', leftKey: 'notAtAll', rightKey: 'veryMuch' },
  breatheShort: { type: 'breathing', duration: 6 },
  breatheLong: { type: 'breathing', duration: 15 },
  whereTouch: { type: 'options', key: 'bodyPart', labelKey: 'whereTouch', options: ['eyebrows', 'eyelashes', 'scalp', 'other'], showOtherInput: true },
  whereAreYou: { type: 'textWithSuggestions', key: 'location', labelKey: 'whereAreYou', suggestKey: 'location' },
  whatDoing: { type: 'textWithSuggestions', key: 'activity', labelKey: 'whatDoing', suggestKey: 'activity' },
  blocker: { type: 'blocker' },
  triggerBehavior: { type: 'triggerBehavior' },
  didPull: { type: 'yesNo', key: 'didPull', labelKey: 'didYouPull' },
  whatGot: { type: 'text', key: 'whatGot', labelKey: 'whatDidYouGet' },
  observeIntro: { type: 'text', key: 'urgeFeeling', labelKey: 'whatUrgeFeels', titleKey: 'observeTitle' },
  sensations: { type: 'options', key: 'sensation', labelKey: 'whatSensations', options: ['tightness', 'pressure', 'contraction', 'restlessness', 'shallowBreath', 'burning', 'tension', 'clenching', 'heat', 'pitInStomach', 'buzzing'], small: true },
  bodySide: { type: 'text', key: 'bodySide', labelKey: 'bodySideQuestion' },
  otherSensations: { type: 'text', key: 'otherSensations', labelKey: 'otherSensations' },
  followSensations: { type: 'timer', duration: 30, labelKey: 'followSensations' },
  doTheyChange: { type: 'text', key: 'doTheyChange', labelKey: 'doTheyChange' },
  breakCheck: { type: 'breakCheck' },
  grounding1: { type: 'message', labelKey: 'groundingTouch', icon: '~' },
  grounding2: { type: 'message', labelKey: 'groundingTest', icon: '~' },
  grounding3: { type: 'message', labelKey: 'groundingAccept', icon: '~' },
  grounding4: { type: 'message', labelKey: 'groundingIdentity', icon: '~' },
  celebrate: { type: 'celebrate' },
  breatheOrFinish: { type: 'breatheOrFinish' },
  checkinCelebrate: { type: 'checkinCelebrate' },
};

const LOG_PATH_A = ['feelScale','urgeScale','breatheShort','whereTouch','whereAreYou','whatDoing','blocker','triggerBehavior','didPull','whatGot','observeIntro','sensations','bodySide','otherSensations','followSensations','doTheyChange','breakCheck','grounding1','grounding2','grounding3','grounding4','celebrate'];
const LOG_PATH_B = ['feelScale','urgeScale','whereTouch','whereAreYou','whatDoing','triggerBehavior','didPull','whatGot','breatheOrFinish'];
const LOG_PATH_D = ['checkinCelebrate','feelScale','urgeScale','breatheShort','celebrate'];

function TimerStep({ duration, label, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { clearInterval(timer); onComplete(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const progress = (duration - timeLeft) / duration;
  return (
    <View style={logStyles.timerContainer}>
      <Text style={logStyles.timerLabel}>{label}</Text>
      <View style={logStyles.timerCircle}><Text style={logStyles.timerText}>{timeLeft}s</Text></View>
      <View style={logStyles.timerBar}><View style={[logStyles.timerFill, { width: `${progress * 100}%` }]} /></View>
    </View>
  );
}

function LogFlowScreen({ navigation }) {
  const { t, refreshLogs, refreshStreak, getSmartOptions, saveSmartOption } = useApp();
  const [path, setPath] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState({});
  const [suggestions, setSuggestions] = useState({});
  const fadeAnim = useState(new Animated.Value(1))[0];

  const getSteps = () => {
    if (path === 'A' || path === 'C') return LOG_PATH_A;
    if (path === 'B') return LOG_PATH_B;
    if (path === 'D') return LOG_PATH_D;
    return [];
  };

  const currentStepKey = path ? getSteps()[stepIndex] : null;
  const currentStep = currentStepKey ? LOG_STEPS[currentStepKey] : null;

  useEffect(() => {
    if (currentStep?.suggestKey) {
      getSmartOptions(currentStep.suggestKey).then((opts) => setSuggestions((prev) => ({ ...prev, [currentStep.suggestKey]: opts })));
    }
  }, [currentStepKey]);

  const animateTransition = (cb) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const goNext = () => { const steps = getSteps(); if (stepIndex < steps.length - 1) animateTransition(() => setStepIndex(stepIndex + 1)); else finishLog(); };
  const goBack = () => { if (stepIndex > 0) animateTransition(() => setStepIndex(stepIndex - 1)); else setPath(null); };
  const skipToStep = (targetKey) => { const idx = getSteps().indexOf(targetKey); if (idx >= 0) animateTransition(() => setStepIndex(idx)); };
  const updateData = (key, value) => setData((prev) => ({ ...prev, [key]: value }));
  const closeFlow = () => navigation.goBack();

  const finishLog = async () => {
    const log = { ...data, path, completedAt: new Date().toISOString() };
    await addLog(log); await updateStreak('logged');
    if (data.location) await saveSmartOption('location', data.location);
    if (data.activity) await saveSmartOption('activity', data.activity);
    await refreshLogs(); await refreshStreak(); navigation.goBack();
  };

  if (!path) {
    return (
      <SafeAreaView style={logStyles.container}>
        <View style={logStyles.closeRow}>
          <TouchableOpacity onPress={closeFlow} style={logStyles.closeHitArea} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={logStyles.closeButton}>{'\u2715'}</Text>
          </TouchableOpacity>
        </View>
        <View style={logStyles.content}>
          <Text style={logStyles.bigTitle}>{t('logTitle')}</Text>
          <View style={logStyles.optionsList}>
            <OptionButton label={t('logOptionA')} onPress={() => { setPath('A'); setStepIndex(0); }} />
            <OptionButton label={t('logOptionB')} onPress={() => { setPath('B'); setStepIndex(0); }} />
            <OptionButton label={t('logOptionC')} onPress={() => { setPath('C'); setStepIndex(0); }} />
            <OptionButton label={t('logOptionD')} onPress={() => { setPath('D'); setStepIndex(0); }} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const renderStep = () => {
    if (!currentStep) return null;
    switch (currentStep.type) {
      case 'scale':
        return (<View style={logStyles.stepContent}><ScaleSlider label={t(currentStep.labelKey)} value={data[currentStep.key] ?? 5} onChange={(val) => updateData(currentStep.key, val)} leftLabel={t(currentStep.leftKey)} rightLabel={t(currentStep.rightKey)} /></View>);
      case 'breathing':
        return <BreathingExercise onComplete={goNext} />;
      case 'options':
        return (
          <View style={logStyles.stepContent}>
            <Text style={logStyles.stepTitle}>{t(currentStep.labelKey)}</Text>
            <View style={currentStep.small ? logStyles.optionsGrid : logStyles.optionsList}>
              {currentStep.options.map((opt) => (<OptionButton key={opt} label={t(opt)} selected={data[currentStep.key] === opt} onPress={() => updateData(currentStep.key, opt)} small={currentStep.small} />))}
            </View>
            {currentStep.showOtherInput && data[currentStep.key] === 'other' && (<VoiceInput value={data[`${currentStep.key}Other`] || ''} onChangeText={(text) => updateData(`${currentStep.key}Other`, text)} placeholder={t('specify')} multiline={false} />)}
          </View>
        );
      case 'text':
        return (<View style={logStyles.stepContent}>{currentStep.titleKey && <Text style={logStyles.stepTitle}>{t(currentStep.titleKey)}</Text>}<Text style={logStyles.stepLabel}>{t(currentStep.labelKey)}</Text><VoiceInput value={data[currentStep.key] || ''} onChangeText={(text) => updateData(currentStep.key, text)} placeholder={t('specify')} /></View>);
      case 'textWithSuggestions':
        const sugs = suggestions[currentStep.suggestKey] || [];
        return (
          <View style={logStyles.stepContent}>
            <Text style={logStyles.stepTitle}>{t(currentStep.labelKey)}</Text>
            {sugs.length > 0 && (<View style={logStyles.suggestionsRow}>{sugs.slice(0, 5).map((sug) => (<TouchableOpacity key={sug} style={[logStyles.suggestionChip, data[currentStep.key] === sug && logStyles.suggestionChipActive]} onPress={() => updateData(currentStep.key, sug)}><Text style={[logStyles.suggestionText, data[currentStep.key] === sug && logStyles.suggestionTextActive]}>{sug}</Text></TouchableOpacity>))}</View>)}
            <VoiceInput value={data[currentStep.key] || ''} onChangeText={(text) => updateData(currentStep.key, text)} placeholder={t('specify')} multiline={false} />
          </View>
        );
      case 'yesNo':
        return (
          <View style={logStyles.stepContent}>
            <Text style={logStyles.stepTitle}>{t(currentStep.labelKey)}</Text>
            <View style={logStyles.yesNoRow}>
              <TouchableOpacity style={[logStyles.yesNoButton, data[currentStep.key] === true && logStyles.yesNoActive]} onPress={() => updateData(currentStep.key, true)}><Text style={[logStyles.yesNoText, data[currentStep.key] === true && logStyles.yesNoTextActive]}>{t('yes')}</Text></TouchableOpacity>
              <TouchableOpacity style={[logStyles.yesNoButton, data[currentStep.key] === false && logStyles.yesNoActive]} onPress={() => updateData(currentStep.key, false)}><Text style={[logStyles.yesNoText, data[currentStep.key] === false && logStyles.yesNoTextActive]}>{t('no')}</Text></TouchableOpacity>
            </View>
          </View>
        );
      case 'blocker':
        return (<View style={logStyles.stepContent}><Text style={logStyles.rideWave}>{t('rideTheWave')}</Text><Text style={logStyles.stepMessage}>{t('blockerMessage')}</Text><View style={logStyles.blockerButtons}><OptionButton label={t('foundOne')} onPress={goNext} /><OptionButton label={t('cantRightNow')} secondary onPress={goNext} /></View></View>);
      case 'triggerBehavior':
        return (<View style={logStyles.stepContent}><Text style={logStyles.stepTitle}>{t('defineTogethertitle')}</Text><Text style={logStyles.inputLabel}>{t('trigger')}</Text><VoiceInput value={data.trigger || ''} onChangeText={(text) => updateData('trigger', text)} placeholder="..." multiline={false} /><Text style={logStyles.inputLabel}>{t('behavior')}</Text><VoiceInput value={data.behavior || ''} onChangeText={(text) => updateData('behavior', text)} placeholder="..." multiline={false} /><Text style={logStyles.inputLabel}>{t('result')}</Text><VoiceInput value={data.result || ''} onChangeText={(text) => updateData('result', text)} placeholder="..." multiline={false} /></View>);
      case 'timer':
        return <TimerStep duration={currentStep.duration} label={t(currentStep.labelKey)} onComplete={goNext} />;
      case 'message':
        return (<View style={logStyles.stepContent}><Text style={logStyles.messageIcon}>{currentStep.icon}</Text><Text style={logStyles.messageText}>{t(currentStep.labelKey)}</Text></View>);
      case 'breakCheck':
        return (
          <View style={logStyles.stepContent}>
            <Text style={logStyles.stepTitle}>{t('breakTitle')}</Text>
            <ScaleSlider label={t('feelScale')} value={data.breakFeel ?? 5} onChange={(val) => updateData('breakFeel', val)} leftLabel={t('calm')} rightLabel={t('overwhelmed')} />
            <ScaleSlider label={t('urgeScale')} value={data.breakUrge ?? 5} onChange={(val) => updateData('breakUrge', val)} leftLabel={t('notAtAll')} rightLabel={t('veryMuch')} />
            {(data.breakFeel ?? 5) <= 4 && (data.breakUrge ?? 5) <= 4 ? (<View style={logStyles.breakOptions}><OptionButton label={t('continueYes')} onPress={goNext} /><OptionButton label={t('continueNo')} secondary onPress={() => skipToStep('celebrate')} /></View>) : null}
          </View>
        );
      case 'celebrate':
        return (<View style={logStyles.celebrateContent}><Text style={logStyles.celebrateSymbol}>~</Text><Text style={logStyles.celebrateTitle}>{t('youDidIt')}</Text><Text style={logStyles.celebrateMessage}>{t('celebrate')}</Text><Text style={logStyles.logSaved}>{t('logSaved')}</Text></View>);
      case 'breatheOrFinish':
        return (<View style={logStyles.stepContent}><Text style={logStyles.stepTitle}>{t('breatheOrFinish')}</Text><OptionButton label={t('doBreathing')} onPress={() => { updateData('didBreathingEnd', true); setData((prev) => ({ ...prev, _showBreathing: true })); }} /><View style={{ height: 8 }} /><OptionButton label={t('finishLog')} secondary onPress={finishLog} /></View>);
      case 'checkinCelebrate':
        return (<View style={logStyles.stepContent}><Text style={logStyles.celebrateSymbol}>~</Text><Text style={logStyles.celebrateTitle}>{t('celebrateCheckin')}</Text></View>);
      default: return null;
    }
  };

  if (data._showBreathing) {
    return (<SafeAreaView style={logStyles.container}><BreathingExercise onComplete={async () => { setData((prev) => ({ ...prev, _showBreathing: false })); await finishLog(); }} /></SafeAreaView>);
  }

  const steps = getSteps();
  const isLastStep = stepIndex === steps.length - 1;
  const isCelebrate = currentStepKey === 'celebrate';
  const isBreathing = currentStep?.type === 'breathing';
  const isTimer = currentStep?.type === 'timer';
  const showNav = !isBreathing && !isTimer;

  return (
    <SafeAreaView style={logStyles.container}>
      <View style={logStyles.header}>
        <TouchableOpacity onPress={closeFlow} style={logStyles.closeHitArea} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={logStyles.closeButton}>{'\u2715'}</Text>
        </TouchableOpacity>
        <View style={logStyles.progressBar}><View style={[logStyles.progressFill, { width: `${((stepIndex + 1) / steps.length) * 100}%` }]} /></View>
        <Text style={logStyles.stepCount}>{stepIndex + 1}/{steps.length}</Text>
      </View>
      <ScrollView style={logStyles.scrollContent} contentContainerStyle={logStyles.scrollInner} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>{renderStep()}</Animated.View>
      </ScrollView>
      {showNav && (
        <View style={logStyles.nav}>
          {stepIndex > 0 && (<TouchableOpacity style={logStyles.backButton} onPress={goBack}><Text style={logStyles.backText}>{t('back')}</Text></TouchableOpacity>)}
          <TouchableOpacity style={[logStyles.nextButton, isCelebrate && logStyles.doneButton]} onPress={isCelebrate || isLastStep ? finishLog : goNext}>
            <Text style={logStyles.nextText}>{isCelebrate || isLastStep ? t('done') : t('next')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const logStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  closeRow: { paddingHorizontal: 24, paddingTop: 16, alignItems: 'flex-end' },
  closeHitArea: { padding: 8 },
  closeButton: { fontSize: 22, color: Colors.textLight, fontWeight: '300' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  bigTitle: { fontSize: 28, fontWeight: '600', color: Colors.text, textAlign: 'center', marginBottom: 32 },
  optionsList: { gap: 10 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 12 },
  progressBar: { flex: 1, height: 3, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  stepCount: { fontSize: 12, color: Colors.textMuted, minWidth: 35, textAlign: 'right' },
  scrollContent: { flex: 1 },
  scrollInner: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },
  stepContent: { flex: 1, justifyContent: 'center' },
  stepTitle: { fontSize: 22, fontWeight: '600', color: Colors.text, marginBottom: 24, textAlign: 'center' },
  stepLabel: { fontSize: 16, color: Colors.textLight, marginBottom: 12, lineHeight: 24, textAlign: 'center' },
  inputLabel: { fontSize: 14, fontWeight: '500', color: Colors.textLight, marginTop: 12, marginBottom: 4 },
  rideWave: { fontSize: 20, fontWeight: '700', color: Colors.primary, textAlign: 'center', marginBottom: 20, letterSpacing: 1 },
  stepMessage: { fontSize: 16, color: Colors.text, textAlign: 'center', lineHeight: 26, marginBottom: 28 },
  blockerButtons: { gap: 8 },
  yesNoRow: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  yesNoButton: { flex: 1, paddingVertical: 20, backgroundColor: Colors.card, borderRadius: 20, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  yesNoActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  yesNoText: { fontSize: 18, fontWeight: '600', color: Colors.text },
  yesNoTextActive: { color: Colors.primaryDark },
  messageIcon: { fontSize: 36, textAlign: 'center', marginBottom: 20, color: Colors.primary },
  messageText: { fontSize: 18, color: Colors.text, textAlign: 'center', lineHeight: 28 },
  celebrateContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  celebrateSymbol: { fontSize: 48, color: Colors.primary, marginBottom: 16, fontWeight: '300' },
  celebrateTitle: { fontSize: 26, fontWeight: '600', color: Colors.primary, marginBottom: 12, textAlign: 'center' },
  celebrateMessage: { fontSize: 16, color: Colors.textLight, textAlign: 'center', lineHeight: 26 },
  logSaved: { fontSize: 14, color: Colors.textMuted, marginTop: 20 },
  breakOptions: { gap: 8, marginTop: 20 },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  suggestionChip: { backgroundColor: Colors.surface, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  suggestionChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  suggestionText: { fontSize: 14, color: Colors.textLight },
  suggestionTextActive: { color: Colors.primaryDark, fontWeight: '600' },
  nav: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 16, gap: 12, borderTopWidth: 1, borderTopColor: Colors.divider },
  backButton: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16, backgroundColor: Colors.surface },
  backText: { fontSize: 16, fontWeight: '500', color: Colors.textLight },
  nextButton: { flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center' },
  doneButton: { backgroundColor: Colors.success },
  nextText: { fontSize: 16, fontWeight: '600', color: Colors.textOnPrimary },
  timerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  timerLabel: { fontSize: 16, color: Colors.text, textAlign: 'center', lineHeight: 26, marginBottom: 30 },
  timerCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  timerText: { fontSize: 28, fontWeight: '700', color: Colors.primary },
  timerBar: { width: '80%', height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  timerFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
});


// ============================================================
// NAVIGATION (App Root)
// ============================================================
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Home: { icon: '\u2302', label: 'Inicio' },
  Data: { icon: '\u25CB', label: 'Datos' },
  Journal: { icon: '\u2661', label: 'Diario' },
  Chat: { icon: '\u2740', label: 'Chat' },
  Profile: { icon: '\u2726', label: 'Perfil' },
};

function TabIcon({ name, focused }) {
  return (
    <View style={[tabStyles.tabIcon, focused && tabStyles.tabIconActive]}>
      <Text style={[tabStyles.tabSymbol, focused ? tabStyles.tabSymbolActive : tabStyles.tabSymbolInactive]}>
        {TAB_ICONS[name].icon}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: Colors.card, borderTopColor: Colors.divider, borderTopWidth: 1, paddingTop: 8, paddingBottom: 8, height: 76 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '400', marginTop: 2, letterSpacing: 0.5 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Data" component={DataScreen} options={{ tabBarLabel: 'Datos' }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ tabBarLabel: 'Diario' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  tabIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: Colors.primaryLight },
  tabSymbol: { fontSize: 20 },
  tabSymbolActive: { color: Colors.primary },
  tabSymbolInactive: { color: Colors.textMuted },
});

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="LogFlow" component={LogFlowScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

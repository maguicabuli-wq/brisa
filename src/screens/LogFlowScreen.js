import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import Colors from '../constants/colors';
import { useApp } from '../context/AppContext';
import { addLog, updateStreak } from '../utils/storage';
import ScaleSlider from '../components/ScaleSlider';
import OptionButton from '../components/OptionButton';
import VoiceInput from '../components/VoiceInput';
import BreathingExercise from '../components/BreathingExercise';

/*
  Log Flow — Step-based questionnaire
  Path A: Currently having an episode (full flow)
  Path B: Episode already passed (abbreviated)
  Path C: Not sure (same as A)
  Path D: Just checking in (celebration + check-in)
*/

// Step definitions for each path
const STEPS = {
  // Initial choice
  initial: { type: 'initial' },

  // Scales
  feelScale: { type: 'scale', key: 'feelScale', labelKey: 'feelScale', leftKey: 'calm', rightKey: 'overwhelmed' },
  urgeScale: { type: 'scale', key: 'urgeScale', labelKey: 'urgeScale', leftKey: 'notAtAll', rightKey: 'veryMuch' },

  // Breathing
  breatheShort: { type: 'breathing', duration: 6 },
  breatheLong: { type: 'breathing', duration: 15 },

  // Where touching + Context
  whereTouch: {
    type: 'options',
    key: 'bodyPart',
    labelKey: 'whereTouch',
    options: ['eyebrows', 'eyelashes', 'scalp', 'other'],
    showOtherInput: true,
  },
  whereAreYou: { type: 'textWithSuggestions', key: 'location', labelKey: 'whereAreYou', suggestKey: 'location' },
  whatDoing: { type: 'textWithSuggestions', key: 'activity', labelKey: 'whatDoing', suggestKey: 'activity' },

  // Blocker
  blocker: { type: 'blocker' },

  // Trigger/Behavior/Result
  triggerBehavior: { type: 'triggerBehavior' },

  // Did you pull?
  didPull: { type: 'yesNo', key: 'didPull', labelKey: 'didYouPull' },

  // What did you get
  whatGot: { type: 'text', key: 'whatGot', labelKey: 'whatDidYouGet' },

  // Mindfulness sequence
  observeIntro: { type: 'text', key: 'urgeFeeling', labelKey: 'whatUrgeFeels', titleKey: 'observeTitle' },
  sensations: {
    type: 'options',
    key: 'sensation',
    labelKey: 'whatSensations',
    options: ['tightness', 'pressure', 'contraction', 'restlessness', 'shallowBreath', 'burning', 'tension', 'clenching', 'heat', 'pitInStomach', 'buzzing'],
    small: true,
  },
  bodySide: { type: 'text', key: 'bodySide', labelKey: 'bodySideQuestion' },
  otherSensations: { type: 'text', key: 'otherSensations', labelKey: 'otherSensations' },
  followSensations: { type: 'timer', duration: 30, labelKey: 'followSensations' },
  doTheyChange: { type: 'text', key: 'doTheyChange', labelKey: 'doTheyChange' },

  // Break check-in
  breakCheck: { type: 'breakCheck' },

  // Grounding messages
  grounding1: { type: 'message', labelKey: 'groundingTouch', icon: '🌍' },
  grounding2: { type: 'message', labelKey: 'groundingTest', icon: '🧠' },
  grounding3: { type: 'message', labelKey: 'groundingAccept', icon: '🌊' },
  grounding4: { type: 'message', labelKey: 'groundingIdentity', icon: '🦋' },

  // Celebration
  celebrate: { type: 'celebrate' },

  // Path B ending
  breatheOrFinish: { type: 'breatheOrFinish' },

  // Path D
  checkinCelebrate: { type: 'checkinCelebrate' },
};

// Path definitions
const PATH_A = [
  'feelScale', 'urgeScale', 'breatheShort', 'whereTouch', 'whereAreYou', 'whatDoing',
  'blocker', 'triggerBehavior', 'didPull', 'whatGot', 'observeIntro', 'sensations',
  'bodySide', 'otherSensations', 'followSensations', 'doTheyChange',
  'breakCheck', // branching point: if good → celebrate, if bad → grounding → celebrate
  'grounding1', 'grounding2', 'grounding3', 'grounding4', 'celebrate',
];

const PATH_B = [
  'feelScale', 'urgeScale', 'whereTouch', 'whereAreYou', 'whatDoing',
  'triggerBehavior', 'didPull', 'whatGot', 'breatheOrFinish',
];

const PATH_D = [
  'checkinCelebrate', 'feelScale', 'urgeScale', 'breatheShort', 'celebrate',
];

export default function LogFlowScreen({ navigation }) {
  const { t, refreshLogs, refreshStreak, getSmartOptions, saveSmartOption } = useApp();
  const [path, setPath] = useState(null); // A, B, C, D
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState({});
  const [suggestions, setSuggestions] = useState({});
  const fadeAnim = useState(new Animated.Value(1))[0];

  const getSteps = () => {
    if (path === 'A' || path === 'C') return PATH_A;
    if (path === 'B') return PATH_B;
    if (path === 'D') return PATH_D;
    return [];
  };

  const currentStepKey = path ? getSteps()[stepIndex] : null;
  const currentStep = currentStepKey ? STEPS[currentStepKey] : null;

  // Load smart suggestions when entering text fields
  useEffect(() => {
    if (currentStep?.suggestKey) {
      getSmartOptions(currentStep.suggestKey).then((opts) => {
        setSuggestions((prev) => ({ ...prev, [currentStep.suggestKey]: opts }));
      });
    }
  }, [currentStepKey]);

  const animateTransition = (callback) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const goNext = () => {
    const steps = getSteps();
    if (stepIndex < steps.length - 1) {
      animateTransition(() => setStepIndex(stepIndex + 1));
    } else {
      finishLog();
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      animateTransition(() => setStepIndex(stepIndex - 1));
    } else {
      setPath(null);
    }
  };

  const skipToStep = (targetKey) => {
    const steps = getSteps();
    const idx = steps.indexOf(targetKey);
    if (idx >= 0) {
      animateTransition(() => setStepIndex(idx));
    }
  };

  const updateData = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const finishLog = async () => {
    const log = {
      ...data,
      path,
      completedAt: new Date().toISOString(),
    };
    await addLog(log);
    await updateStreak('logged');

    // Save smart options for location/activity
    if (data.location) await saveSmartOption('location', data.location);
    if (data.activity) await saveSmartOption('activity', data.activity);

    await refreshLogs();
    await refreshStreak();
    navigation.goBack();
  };

  // --- Render initial path selection ---
  if (!path) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.closeRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.bigTitle}>{t('logTitle')}</Text>
          <View style={styles.optionsList}>
            <OptionButton icon="🔴" label={t('logOptionA')} onPress={() => { setPath('A'); setStepIndex(0); }} />
            <OptionButton icon="✅" label={t('logOptionB')} onPress={() => { setPath('B'); setStepIndex(0); }} />
            <OptionButton icon="🤔" label={t('logOptionC')} onPress={() => { setPath('C'); setStepIndex(0); }} />
            <OptionButton icon="👋" label={t('logOptionD')} onPress={() => { setPath('D'); setStepIndex(0); }} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // --- Render current step ---
  const renderStep = () => {
    if (!currentStep) return null;

    switch (currentStep.type) {
      case 'scale':
        return (
          <View style={styles.stepContent}>
            <ScaleSlider
              label={t(currentStep.labelKey)}
              value={data[currentStep.key] ?? 5}
              onChange={(val) => updateData(currentStep.key, val)}
              leftLabel={t(currentStep.leftKey)}
              rightLabel={t(currentStep.rightKey)}
            />
          </View>
        );

      case 'breathing':
        return (
          <BreathingExercise
            duration={currentStep.duration}
            onComplete={goNext}
          />
        );

      case 'options':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t(currentStep.labelKey)}</Text>
            <View style={currentStep.small ? styles.optionsGrid : styles.optionsList}>
              {currentStep.options.map((opt) => (
                <OptionButton
                  key={opt}
                  label={t(opt)}
                  selected={data[currentStep.key] === opt}
                  onPress={() => updateData(currentStep.key, opt)}
                  small={currentStep.small}
                />
              ))}
            </View>
            {currentStep.showOtherInput && data[currentStep.key] === 'other' && (
              <VoiceInput
                value={data[`${currentStep.key}Other`] || ''}
                onChangeText={(text) => updateData(`${currentStep.key}Other`, text)}
                placeholder={t('specify')}
                multiline={false}
              />
            )}
          </View>
        );

      case 'text':
        return (
          <View style={styles.stepContent}>
            {currentStep.titleKey && <Text style={styles.stepTitle}>{t(currentStep.titleKey)}</Text>}
            <Text style={styles.stepLabel}>{t(currentStep.labelKey)}</Text>
            <VoiceInput
              value={data[currentStep.key] || ''}
              onChangeText={(text) => updateData(currentStep.key, text)}
              placeholder={t('specify')}
            />
          </View>
        );

      case 'textWithSuggestions':
        const sugs = suggestions[currentStep.suggestKey] || [];
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t(currentStep.labelKey)}</Text>
            {sugs.length > 0 && (
              <View style={styles.suggestionsRow}>
                {sugs.slice(0, 5).map((sug) => (
                  <TouchableOpacity
                    key={sug}
                    style={[styles.suggestionChip, data[currentStep.key] === sug && styles.suggestionChipActive]}
                    onPress={() => updateData(currentStep.key, sug)}
                  >
                    <Text style={[styles.suggestionText, data[currentStep.key] === sug && styles.suggestionTextActive]}>
                      {sug}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <VoiceInput
              value={data[currentStep.key] || ''}
              onChangeText={(text) => updateData(currentStep.key, text)}
              placeholder={t('specify')}
              multiline={false}
            />
          </View>
        );

      case 'yesNo':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t(currentStep.labelKey)}</Text>
            <View style={styles.yesNoRow}>
              <TouchableOpacity
                style={[styles.yesNoButton, data[currentStep.key] === true && styles.yesNoActive]}
                onPress={() => updateData(currentStep.key, true)}
              >
                <Text style={[styles.yesNoText, data[currentStep.key] === true && styles.yesNoTextActive]}>
                  {t('yes')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.yesNoButton, data[currentStep.key] === false && styles.yesNoActive]}
                onPress={() => updateData(currentStep.key, false)}
              >
                <Text style={[styles.yesNoText, data[currentStep.key] === false && styles.yesNoTextActive]}>
                  {t('no')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'blocker':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.rideWave}>{t('rideTheWave')}</Text>
            <Text style={styles.stepMessage}>{t('blockerMessage')}</Text>
            <View style={styles.blockerButtons}>
              <OptionButton label={t('foundOne')} icon="✅" onPress={goNext} />
              <OptionButton label={t('cantRightNow')} secondary onPress={goNext} />
            </View>
          </View>
        );

      case 'triggerBehavior':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('defineTogethertitle')}</Text>
            <Text style={styles.inputLabel}>{t('trigger')}</Text>
            <VoiceInput
              value={data.trigger || ''}
              onChangeText={(text) => updateData('trigger', text)}
              placeholder="..."
              multiline={false}
            />
            <Text style={styles.inputLabel}>{t('behavior')}</Text>
            <VoiceInput
              value={data.behavior || ''}
              onChangeText={(text) => updateData('behavior', text)}
              placeholder="..."
              multiline={false}
            />
            <Text style={styles.inputLabel}>{t('result')}</Text>
            <VoiceInput
              value={data.result || ''}
              onChangeText={(text) => updateData('result', text)}
              placeholder="..."
              multiline={false}
            />
          </View>
        );

      case 'timer':
        return <TimerStep duration={currentStep.duration} label={t(currentStep.labelKey)} onComplete={goNext} />;

      case 'message':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.messageIcon}>{currentStep.icon}</Text>
            <Text style={styles.messageText}>{t(currentStep.labelKey)}</Text>
          </View>
        );

      case 'breakCheck':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('breakTitle')}</Text>
            <ScaleSlider
              label={t('feelScale')}
              value={data.breakFeel ?? 5}
              onChange={(val) => updateData('breakFeel', val)}
              leftLabel={t('calm')}
              rightLabel={t('overwhelmed')}
            />
            <ScaleSlider
              label={t('urgeScale')}
              value={data.breakUrge ?? 5}
              onChange={(val) => updateData('breakUrge', val)}
              leftLabel={t('notAtAll')}
              rightLabel={t('veryMuch')}
            />
            {(data.breakFeel ?? 5) <= 4 && (data.breakUrge ?? 5) <= 4 ? (
              <View style={styles.breakOptions}>
                <OptionButton label={t('continueYes')} onPress={goNext} />
                <OptionButton label={t('continueNo')} secondary onPress={() => skipToStep('celebrate')} />
              </View>
            ) : null}
          </View>
        );

      case 'celebrate':
        return (
          <View style={styles.celebrateContent}>
            <Text style={styles.celebrateEmoji}>🎉</Text>
            <Text style={styles.celebrateTitle}>{t('youDidIt')}</Text>
            <Text style={styles.celebrateMessage}>{t('celebrate')}</Text>
            <Text style={styles.logSaved}>{t('logSaved')}</Text>
          </View>
        );

      case 'breatheOrFinish':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('breatheOrFinish')}</Text>
            <OptionButton icon="🌬️" label={t('doBreathing')} onPress={() => {
              // Insert a breathing step and go to it, then celebrate
              updateData('didBreathingEnd', true);
              // Navigate to breathing, then on complete finish
              setData((prev) => ({ ...prev, _showBreathing: true }));
            }} />
            <OptionButton icon="✅" label={t('finishLog')} secondary onPress={finishLog} />
          </View>
        );

      case 'checkinCelebrate':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.celebrateEmoji}>🌟</Text>
            <Text style={styles.celebrateTitle}>{t('celebrateCheckin')}</Text>
          </View>
        );

      default:
        return null;
    }
  };

  // Special: inline breathing at end of Path B
  if (data._showBreathing) {
    return (
      <SafeAreaView style={styles.container}>
        <BreathingExercise
          duration={15}
          onComplete={async () => {
            setData((prev) => ({ ...prev, _showBreathing: false }));
            await finishLog();
          }}
        />
      </SafeAreaView>
    );
  }

  const steps = getSteps();
  const isLastStep = stepIndex === steps.length - 1;
  const isCelebrate = currentStepKey === 'celebrate';
  const isBreathing = currentStep?.type === 'breathing';
  const isTimer = currentStep?.type === 'timer';
  const showNav = !isBreathing && !isTimer;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((stepIndex + 1) / steps.length) * 100}%` }]} />
        </View>
        <Text style={styles.stepCount}>{stepIndex + 1}/{steps.length}</Text>
      </View>

      {/* Step content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          {renderStep()}
        </Animated.View>
      </ScrollView>

      {/* Navigation */}
      {showNav && (
        <View style={styles.nav}>
          {stepIndex > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <Text style={styles.backText}>{t('back')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextButton, isCelebrate && styles.doneButton]}
            onPress={isCelebrate || isLastStep ? finishLog : goNext}
          >
            <Text style={styles.nextText}>
              {isCelebrate || isLastStep ? t('done') : t('next')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// Timer component for the 30-second observation
function TimerStep({ duration, label, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const progress = (duration - timeLeft) / duration;

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerLabel}>{label}</Text>
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{timeLeft}s</Text>
      </View>
      <View style={styles.timerBar}>
        <View style={[styles.timerFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  closeRow: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'flex-end',
  },
  closeButton: {
    fontSize: 24,
    color: Colors.textMuted,
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  bigTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsList: {
    gap: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepCount: {
    fontSize: 13,
    color: Colors.textMuted,
    minWidth: 35,
    textAlign: 'right',
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  stepLabel: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 12,
    lineHeight: 24,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
    marginTop: 12,
    marginBottom: 4,
  },
  rideWave: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  stepMessage: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 28,
  },
  blockerButtons: {
    gap: 8,
  },
  yesNoRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  yesNoButton: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: Colors.card,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  yesNoActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  yesNoText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  yesNoTextActive: {
    color: Colors.primaryDark,
  },
  messageIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 20,
  },
  messageText: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  celebrateContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  celebrateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  celebrateTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  celebrateMessage: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 26,
  },
  logSaved: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 20,
  },
  breakOptions: {
    gap: 8,
    marginTop: 20,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  suggestionChip: {
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  suggestionTextActive: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  nav: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.surface,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textLight,
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: Colors.success,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timerLabel: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 30,
  },
  timerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  timerBar: {
    width: '80%',
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
});

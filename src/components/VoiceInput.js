import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import { useApp } from '../context/AppContext';

// Voice-to-text input component
// Note: In production, this would use expo-speech or a speech-to-text API.
// For now we provide the UI with a mic button + text input.
export default function VoiceInput({ value, onChangeText, placeholder, multiline = true, style }) {
  const { t } = useApp();
  const [isListening, setIsListening] = useState(false);

  const handleMicPress = async () => {
    // TODO: Integrate with speech-to-text API (e.g., Google Speech, Apple Dictation)
    // For now, show listening state as a placeholder
    setIsListening(true);
    setTimeout(() => setIsListening(false), 2000);
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      <TouchableOpacity
        style={[styles.micButton, isListening && styles.micButtonActive]}
        onPress={handleMicPress}
      >
        <Text style={styles.micIcon}>{isListening ? '🔴' : '🎙️'}</Text>
        <Text style={[styles.micLabel, isListening && styles.micLabelActive]}>
          {isListening ? t('listening') : t('tapToSpeak')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 48,
  },
  multiline: {
    minHeight: 100,
    paddingTop: 16,
  },
  micButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    alignSelf: 'center',
  },
  micButtonActive: {
    backgroundColor: Colors.primaryLight,
  },
  micIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  micLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  micLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

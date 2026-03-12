import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/colors';

export default function ScaleSlider({ label, value, onChange, leftLabel, rightLabel, min = 0, max = 10 }) {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {numbers.map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.dot,
              num === value && styles.dotActive,
              num <= value && styles.dotFilled,
            ]}
            onPress={() => onChange(num)}
          >
            <Text style={[
              styles.dotText,
              num === value && styles.dotTextActive,
            ]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.labelsRow}>
        <Text style={styles.edgeLabel}>{leftLabel}</Text>
        <Text style={styles.edgeLabel}>{rightLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    transform: [{ scale: 1.2 }],
  },
  dotFilled: {
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primaryLight,
  },
  dotText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
  },
  dotTextActive: {
    color: Colors.textOnPrimary,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  edgeLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});

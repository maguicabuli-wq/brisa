import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Colors from '../constants/colors';

export default function OptionButton({ label, onPress, selected, icon, small, secondary }) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        selected && styles.selected,
        small && styles.small,
        secondary && styles.secondary,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[
        styles.label,
        selected && styles.labelSelected,
        small && styles.labelSmall,
        secondary && styles.labelSecondary,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginVertical: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  small: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginVertical: 4,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
  },
  labelSelected: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 14,
  },
  labelSecondary: {
    color: Colors.textLight,
    fontStyle: 'italic',
  },
});

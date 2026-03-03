import React, { useState } from 'react';
import {
  View, TextInput, Text, StyleSheet, TouchableOpacity, ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../styles/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  submitLabel?: string;
  style?: ViewStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export default function Input({
  value, onChangeText, placeholder, onSubmit, submitLabel = 'Add', style, autoCapitalize = 'words',
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.focused, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        onSubmitEditing={onSubmit}
        returnKeyType="done"
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {onSubmit && value.trim().length > 0 && (
        <TouchableOpacity onPress={onSubmit} style={styles.submitBtn} activeOpacity={0.75}>
          <Text style={styles.submitLabel}>{submitLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  focused: {
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: 4,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
  },
  submitLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});

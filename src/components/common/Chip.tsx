import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../styles/theme';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  variant?: 'filter' | 'ingredient' | 'tag';
  style?: ViewStyle;
}

export default function Chip({ label, selected = false, onPress, onRemove, variant = 'filter', style }: Props) {
  return (
    <TouchableOpacity
      onPress={onRemove ?? onPress}
      activeOpacity={0.75}
      style={[
        styles.chip,
        selected && styles.selected,
        variant === 'ingredient' && styles.ingredient,
        variant === 'tag' && styles.tag,
        style,
      ]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel, variant === 'ingredient' && styles.ingredientLabel]}>
        {label}
        {(onRemove) ? '  ×' : ''}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  ingredient: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  tag: {
    backgroundColor: colors.accentLight,
    borderColor: colors.accent,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  selectedLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  ingredientLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});

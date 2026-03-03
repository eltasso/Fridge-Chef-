import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../styles/theme';

interface Props {
  name: string;
  amount: string;
  checked?: boolean;
  missing?: boolean;
}

export default function IngredientTag({ name, amount, checked = false, missing = false }: Props) {
  return (
    <View style={[styles.row, checked && styles.checkedRow]}>
      <View style={[styles.dot, checked && styles.dotChecked, missing && styles.dotMissing]} />
      <Text style={[styles.amount, checked && styles.dimText]}>{amount}</Text>
      <Text style={[styles.name, checked && styles.dimText, missing && styles.missingText]}>
        {name}
      </Text>
      {missing && <Text style={styles.missingBadge}>missing</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    gap: spacing.sm,
  },
  checkedRow: {
    opacity: 0.5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  dotChecked: {
    backgroundColor: colors.success,
  },
  dotMissing: {
    backgroundColor: colors.danger,
  },
  amount: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    minWidth: 60,
  },
  name: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  dimText: {
    color: colors.textMuted,
  },
  missingText: {
    color: colors.danger,
  },
  missingBadge: {
    fontSize: 10,
    color: colors.danger,
    fontWeight: '600',
    backgroundColor: '#fdecea',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
});

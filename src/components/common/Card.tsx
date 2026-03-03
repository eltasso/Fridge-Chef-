import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '../../styles/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'sm' | 'md' | 'lg' | 'none';
  padding?: boolean;
}

export default function Card({ children, style, elevation = 'md', padding = true }: Props) {
  return (
    <View style={[styles.card, elevation !== 'none' && shadows[elevation], padding && styles.padding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  padding: {
    padding: spacing.md,
  },
});

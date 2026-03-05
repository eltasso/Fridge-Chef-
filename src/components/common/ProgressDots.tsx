import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  total?: number;
  current: number; // 1-indexed
}

export default function ProgressDots({ total = 4, current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, i < current ? styles.dotFilled : styles.dotEmpty]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotFilled: { backgroundColor: '#FF6B35' },
  dotEmpty: { backgroundColor: '#E0E0E0' },
});

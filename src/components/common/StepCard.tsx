import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet, Platform, View } from 'react-native';

interface Props {
  emoji: string;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  multiSelect?: boolean;
}

export default function StepCard({ emoji, title, subtitle, selected, onPress, multiSelect }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      try {
        const Haptics = require('expo-haptics');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[styles.card, selected && styles.cardSelected]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {selected && multiSelect && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.06)',
  },
  checkmark: {
    position: 'absolute', top: 10, right: 10,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
  },
  checkmarkText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  emoji: { fontSize: 32, marginBottom: 8 },
  title: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  titleSelected: { color: '#FF6B35' },
  subtitle: { fontSize: 11, color: '#999', marginTop: 3, textAlign: 'center' },
});

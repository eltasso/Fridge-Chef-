import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { MealTime, Preference, RootStackParamList } from '../types';
import { colors, spacing, radius, typography, shadows } from '../styles/theme';

type Nav = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const MEAL_TIMES: { value: MealTime; label: string; emoji: string; subtitle: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅', subtitle: 'Morning fuel' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️', subtitle: 'Midday boost' },
  { value: 'snack', label: 'Snack', emoji: '🍎', subtitle: 'Between meals' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙', subtitle: 'Evening meal' },
];

const PREFERENCES: { value: Preference; label: string; emoji: string; subtitle: string }[] = [
  { value: 'savory', label: 'Savory', emoji: '🧂', subtitle: 'Rich & hearty' },
  { value: 'sweet', label: 'Sweet', emoji: '🍯', subtitle: 'Light & sweet' },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { state, setMealTime, setPreference } = useApp();

  const canContinue = state.mealTime !== null && state.preference !== null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🧑‍🍳</Text>
          <Text style={styles.heroTitle}>Fridge Chef</Text>
          <Text style={styles.heroSubtitle}>Turn what you have into something delicious</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What are you cooking for?</Text>
          <View style={styles.grid}>
            {MEAL_TIMES.map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => setMealTime(item.value)}
                activeOpacity={0.8}
                style={[styles.optionCard, state.mealTime === item.value && styles.selectedCard]}
              >
                <Text style={styles.optionEmoji}>{item.emoji}</Text>
                <Text style={[styles.optionLabel, state.mealTime === item.value && styles.selectedLabel]}>
                  {item.label}
                </Text>
                <Text style={styles.optionSub}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What's your craving?</Text>
          <View style={styles.prefRow}>
            {PREFERENCES.map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => setPreference(item.value)}
                activeOpacity={0.8}
                style={[styles.prefCard, state.preference === item.value && styles.selectedCard]}
              >
                <Text style={styles.optionEmoji}>{item.emoji}</Text>
                <Text style={[styles.optionLabel, state.preference === item.value && styles.selectedLabel]}>
                  {item.label}
                </Text>
                <Text style={styles.optionSub}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Ingredients')}
          disabled={!canContinue}
          activeOpacity={0.85}
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
        >
          <Text style={styles.ctaText}>Add Ingredients →</Text>
        </TouchableOpacity>

        {!canContinue && (
          <Text style={styles.hint}>Select a meal time and preference to continue</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  heroEmoji: { fontSize: 64, marginBottom: spacing.sm },
  heroTitle: { ...typography.h1, fontSize: 32, color: colors.primary, marginBottom: spacing.xs },
  heroSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  section: { marginBottom: spacing.xl },
  sectionLabel: { ...typography.h4, marginBottom: spacing.md, color: colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionCard: {
    flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
    ...shadows.sm,
  },
  selectedCard: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  prefRow: { flexDirection: 'row', gap: spacing.sm },
  prefCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
    ...shadows.sm,
  },
  optionEmoji: { fontSize: 32, marginBottom: spacing.xs },
  optionLabel: { ...typography.h4, marginBottom: 2 },
  selectedLabel: { color: colors.primary },
  optionSub: { ...typography.caption, textAlign: 'center' },
  cta: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: spacing.md, alignItems: 'center', ...shadows.md,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  hint: { ...typography.caption, textAlign: 'center', marginTop: spacing.md, color: colors.textMuted },
});

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { MealTime, Preference, RootStackParamList } from '../types';

type Nav = StackNavigationProp<RootStackParamList, 'Ingredients'>;

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { state, setMealTime, setPreference } = useApp();
  const { t } = useTranslation();

  const MEAL_TIMES: { value: MealTime; label: string; emoji: string }[] = [
    { value: 'breakfast', label: t('onboarding.breakfast'), emoji: '🌅' },
    { value: 'lunch', label: t('onboarding.lunch'), emoji: '☀️' },
    { value: 'snack', label: t('onboarding.snack'), emoji: '🍪' },
    { value: 'dinner', label: t('onboarding.dinner'), emoji: '🌙' },
  ];

  const PREFERENCES: { value: Preference; label: string }[] = [
    { value: 'sweet', label: t('onboarding.sweet') },
    { value: 'savory', label: t('onboarding.savory') },
  ];

  const canContinue = state.mealTime !== null && state.preference !== null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>👨‍🍳</Text>
          <Text style={styles.heroTitle}>{t('onboarding.title')}</Text>
          <Text style={styles.heroSubtitle}>{t('onboarding.subtitle')}</Text>
        </View>

        <View style={styles.grid}>
          {MEAL_TIMES.map((item) => {
            const selected = state.mealTime === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setMealTime(item.value)}
                activeOpacity={0.8}
                style={[styles.mealCard, selected && styles.mealCardSelected]}
              >
                <Text style={styles.mealEmoji}>{item.emoji}</Text>
                <Text style={[styles.mealLabel, selected && styles.mealLabelSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.prefSection}>
          <Text style={styles.prefTitle}>{t('onboarding.prefTitle')}</Text>
          <View style={styles.prefRow}>
            {PREFERENCES.map((item) => {
              const selected = state.preference === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setPreference(item.value)}
                  activeOpacity={0.8}
                  style={[styles.prefPill, selected && styles.prefPillSelected]}
                >
                  <Text style={[styles.prefPillText, selected && styles.prefPillTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Ingredients')}
          disabled={!canContinue}
          activeOpacity={0.85}
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
        >
          <Text style={styles.ctaText}>{t('onboarding.cta')}</Text>
        </TouchableOpacity>

        {!canContinue && (
          <Text style={styles.hint}>{t('onboarding.hint')}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 24, paddingBottom: 48 },

  hero: { alignItems: 'center', marginBottom: 36 },
  heroEmoji: { fontSize: 80, marginBottom: 16 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { fontSize: 16, color: '#999999', textAlign: 'center' },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32,
  },
  mealCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EEEEEE',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  mealCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255,107,53,0.05)',
  },
  mealEmoji: { fontSize: 40, marginBottom: 8 },
  mealLabel: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  mealLabelSelected: { color: '#FF6B35' },

  prefSection: { marginBottom: 36 },
  prefTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 16 },
  prefRow: { flexDirection: 'row', gap: 12 },
  prefPill: {
    flex: 1, height: 44, borderRadius: 25,
    backgroundColor: '#F0F0F0',
    alignItems: 'center', justifyContent: 'center',
  },
  prefPillSelected: { backgroundColor: '#FF6B35' },
  prefPillText: { fontSize: 15, fontWeight: '600', color: '#666666' },
  prefPillTextSelected: { color: '#FFFFFF' },

  cta: {
    backgroundColor: '#FF6B35', borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  hint: { fontSize: 13, color: '#999999', textAlign: 'center', marginTop: 12 },
});

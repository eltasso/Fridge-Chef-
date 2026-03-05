import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { RootStackParamList } from '../types';
import ProgressDots from '../components/common/ProgressDots';
import StepCard from '../components/common/StepCard';

type Nav = StackNavigationProp<RootStackParamList, 'TimeStep'>;

const TIME_OPTIONS: { value: number; emoji: string; titleKey: string; subKey: string }[] = [
  { value: 15,   emoji: '⚡',    titleKey: 'steps.time15',       subKey: 'steps.time15Sub' },
  { value: 30,   emoji: '🕐',    titleKey: 'steps.time30',       subKey: 'steps.time30Sub' },
  { value: 60,   emoji: '🕐',    titleKey: 'steps.time60',       subKey: 'steps.time60Sub' },
  { value: 9999, emoji: '👨‍🍳', titleKey: 'steps.timeUnlimited', subKey: 'steps.timeUnlimitedSub' },
];

export default function TimeStepScreen() {
  const navigation = useNavigation<Nav>();
  const { state, setFilters, setOnboardingCompleted } = useApp();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(state.filters.maxTime);

  const handleSelect = (value: number) => {
    setSelected(value);
    setFilters({ maxTime: value === 9999 ? null : value });
  };

  const handleSeeRecipes = () => {
    if (!selected) return;
    setOnboardingCompleted(true);
    navigation.navigate('Paywall', { fromOnboarding: true });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{t('steps.prev')}</Text>
          </TouchableOpacity>
          <ProgressDots total={4} current={4} />
        </View>

        <Text style={styles.stepLabel}>{t('steps.step')} 4 {t('steps.of')} 4</Text>
        <Text style={styles.title}>⏱ {t('steps.timeTitle')}</Text>
        <Text style={styles.subtitle}>{t('steps.timeSubtitle')}</Text>

        <View style={styles.grid}>
          {TIME_OPTIONS.map((opt) => (
            <StepCard
              key={opt.value}
              emoji={opt.emoji}
              title={t(opt.titleKey as any)}
              subtitle={t(opt.subKey as any)}
              selected={selected === opt.value}
              onPress={() => handleSelect(opt.value)}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
            onPress={handleSeeRecipes}
            activeOpacity={0.85}
            disabled={!selected}
          >
            <Text style={styles.nextBtnText}>{t('steps.seeRecipes')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1, padding: 24 },
  topRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  backBtn: { paddingVertical: 4 },
  backText: { fontSize: 15, color: '#999', fontWeight: '500' },
  stepLabel: { fontSize: 13, color: '#999', marginBottom: 8, fontWeight: '500' },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#999', marginBottom: 28 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, flex: 1 },
  buttons: { paddingTop: 16 },
  nextBtn: {
    backgroundColor: '#FF6B35', borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#F0F0F0' },
  nextBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});

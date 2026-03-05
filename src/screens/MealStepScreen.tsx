import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { MealTime, RootStackParamList } from '../types';
import ProgressDots from '../components/common/ProgressDots';
import StepCard from '../components/common/StepCard';

type Nav = StackNavigationProp<RootStackParamList, 'MealStep'>;

const MEAL_OPTIONS: { value: MealTime; emoji: string; titleKey: string; subKey: string }[] = [
  { value: 'breakfast', emoji: '🌅', titleKey: 'steps.breakfast', subKey: 'steps.breakfastSub' },
  { value: 'lunch',     emoji: '☀️', titleKey: 'steps.lunch',     subKey: 'steps.lunchSub' },
  { value: 'snack',     emoji: '🍪', titleKey: 'steps.snack',     subKey: 'steps.snackSub' },
  { value: 'dinner',    emoji: '🌙', titleKey: 'steps.dinner',    subKey: 'steps.dinnerSub' },
];

export default function MealStepScreen() {
  const navigation = useNavigation<Nav>();
  const { state, setMealTime } = useApp();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<MealTime | null>(state.mealTime);

  const handleSelect = (value: MealTime) => {
    setSelected(value);
    setMealTime(value);
  };

  const handleNext = () => {
    if (!selected) return;
    navigation.navigate('PeopleStep');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{t('steps.prev')}</Text>
          </TouchableOpacity>
          <ProgressDots total={4} current={1} />
        </View>

        <Text style={styles.stepLabel}>{t('steps.step')} 1 {t('steps.of')} 4</Text>
        <Text style={styles.title}>🍽 {t('steps.mealTitle')}</Text>
        <Text style={styles.subtitle}>{t('steps.mealSubtitle')}</Text>

        {/* Cards 2x2 grid */}
        <View style={styles.grid}>
          {MEAL_OPTIONS.map((opt) => (
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

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
            onPress={handleNext}
            activeOpacity={0.85}
            disabled={!selected}
          >
            <Text style={styles.nextBtnText}>{t('steps.next')}</Text>
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

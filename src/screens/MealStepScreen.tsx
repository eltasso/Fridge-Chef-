import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { MealTime, RootStackParamList } from '../types';
import { useHideTabBar } from '../hooks/useHideTabBar';
import ProgressDots from '../components/common/ProgressDots';
import StepCard from '../components/common/StepCard';

type Nav = StackNavigationProp<RootStackParamList, 'MealStep'>;

const ROW1 = [
  { value: 'breakfast' as MealTime, emoji: '🌅', titleKey: 'steps.breakfast', subKey: 'steps.breakfastSub' },
  { value: 'lunch' as MealTime,     emoji: '☀️',  titleKey: 'steps.lunch',     subKey: 'steps.lunchSub' },
];
const ROW2 = [
  { value: 'snack' as MealTime, emoji: '🍪', titleKey: 'steps.snack', subKey: 'steps.snackSub' },
  { value: 'dinner' as MealTime, emoji: '🌙', titleKey: 'steps.dinner', subKey: 'steps.dinnerSub' },
];

export default function MealStepScreen() {
  const navigation = useNavigation<Nav>();
  const { state, setMealTime } = useApp();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<MealTime | null>(state.mealTime);
  useHideTabBar();

  const handleSelect = (value: MealTime) => {
    setSelected(value);
    setMealTime(value);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{t('steps.prev')}</Text>
          </TouchableOpacity>
          <ProgressDots total={4} current={1} />
        </View>

        <Text style={styles.stepLabel}>{t('steps.step')} 1 {t('steps.of')} 4</Text>
        <Text style={styles.title}>🍽 {t('steps.mealTitle')}</Text>
        <Text style={styles.subtitle}>{t('steps.mealSubtitle')}</Text>

        <View style={styles.grid}>
          <View style={styles.row}>
            {ROW1.map((opt) => (
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
          <View style={styles.row}>
            {ROW2.map((opt) => (
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
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
          onPress={() => selected && navigation.navigate('PeopleStep')}
          activeOpacity={0.85}
          disabled={!selected}
        >
          <Text style={[styles.nextBtnText, !selected && styles.nextBtnTextDisabled]}>
            {t('steps.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1, padding: 24 },
  topRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  backBtn: { paddingVertical: 4 },
  backText: { fontSize: 15, color: '#999', fontWeight: '500' },
  stepLabel: { fontSize: 13, color: '#999', marginBottom: 6, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#999', marginBottom: 20 },
  grid: { flex: 1, gap: 12 },
  row: { flex: 1, flexDirection: 'row', gap: 12 },
  nextBtn: {
    backgroundColor: '#FF6B35', borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: 16,
  },
  nextBtnDisabled: { backgroundColor: '#F0F0F0' },
  nextBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  nextBtnTextDisabled: { color: '#CCC' },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { RootStackParamList } from '../types';
import { useHideTabBar } from '../hooks/useHideTabBar';
import ProgressDots from '../components/common/ProgressDots';

type Nav = StackNavigationProp<RootStackParamList, 'PeopleStep'>;

function getEmoji(n: number): string {
  if (n === 1) return '🧑';
  if (n === 2) return '👥';
  if (n <= 4) return '👨‍👩‍👧‍👦';
  if (n <= 7) return '🎉';
  return '🏟️';
}

export default function PeopleStepScreen() {
  const navigation = useNavigation<Nav>();
  const { state, setServings } = useApp();
  const { t } = useTranslation();
  const [count, setCount] = useState(state.servings ?? 2);
  useHideTabBar();

  const handleChange = (value: number) => {
    const n = Math.round(value);
    setCount(n);
    setServings(n);
    if (Platform.OS !== 'web') {
      try {
        const Haptics = require('expo-haptics');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  };

  const personLabel = (n: number) => {
    if (n === 1) return t('language') === 'es' ? '1 persona' : '1 person';
    if (n >= 10) return `10+ ${t('language') === 'es' ? 'personas' : 'people'}`;
    return `${n} ${t('language') === 'es' ? 'personas' : 'people'}`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{t('steps.prev')}</Text>
          </TouchableOpacity>
          <ProgressDots total={4} current={2} />
        </View>

        <Text style={styles.stepLabel}>{t('steps.step')} 2 {t('steps.of')} 4</Text>
        <Text style={styles.title}>👥 {t('steps.peopleTitle')}</Text>
        <Text style={styles.subtitle}>{t('steps.peopleSubtitle')}</Text>

        {/* Big display */}
        <View style={styles.displayArea}>
          <Text style={styles.emoji}>{getEmoji(count)}</Text>
          <Text style={styles.countText}>{count >= 10 ? '10+' : count}</Text>
          <Text style={styles.countLabel}>
            {count === 1
              ? (t('steps.soloSub'))
              : count >= 10
              ? (t('steps.groupSub'))
              : count <= 2
              ? (t('steps.coupleSub'))
              : count <= 4
              ? (t('steps.familySub'))
              : (t('steps.groupSub'))
            }
          </Text>
        </View>

        {/* Slider */}
        <View style={styles.sliderArea}>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={count}
            onValueChange={handleChange}
            minimumTrackTintColor="#FF6B35"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#FF6B35"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>1</Text>
            <Text style={styles.sliderLabel}>5</Text>
            <Text style={styles.sliderLabel}>10+</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => navigation.navigate('CuisineStep')}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>{t('steps.next')}</Text>
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

  displayArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 80, marginBottom: 16 },
  countText: {
    fontSize: 72, fontWeight: '900', color: '#FF6B35',
    lineHeight: 80,
  },
  countLabel: { fontSize: 18, color: '#999', marginTop: 8, fontWeight: '500' },

  sliderArea: { marginBottom: 20 },
  slider: { width: '100%', height: 40 },
  sliderLabels: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 12, marginTop: -4,
  },
  sliderLabel: { fontSize: 12, color: '#BBB', fontWeight: '500' },

  nextBtn: {
    backgroundColor: '#FF6B35', borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  nextBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});

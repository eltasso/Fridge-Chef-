import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
  Image, Alert, Platform, Animated,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import * as KeepAwake from 'expo-keep-awake';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import {
  RootStackParamList, ShoppingItem,
  getLocalizedName, getLocalizedDescription,
  getLocalizedIngredients, getLocalizedSteps,
} from '../types';
import { getMissingIngredients, scaleIngredients } from '../utils/filterRecipes';
import { shareRecipe } from '../utils/share';

type Route = RouteProp<RootStackParamList, 'RecipeDetail'>;

function playBeep() {
  if (Platform.OS === 'web') {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 1.0);
    } catch {}
  } else {
    try {
      const Haptics = require('expo-haptics');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 400);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 800);
    } catch {}
  }
}

export default function RecipeDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { recipe } = route.params;
  const { state, toggleFavorite, isFavorite, addToShoppingList } = useApp();
  const { t, language } = useTranslation();

  const [servings, setServings] = useState(recipe.servings);
  const [cookMode, setCookMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Countdown timer state
  const defaultMinutes = Math.max(1, recipe.cookTime);
  const [timerMinutes, setTimerMinutes] = useState(defaultMinutes);
  const [timerSeconds, setTimerSeconds] = useState(defaultMinutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer done flash animation
  const flashAnim = useRef(new Animated.Value(0)).current;

  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  const favorite = isFavorite(recipe.id);
  const displayIngredients = getLocalizedIngredients(recipe, language);
  const displaySteps = getLocalizedSteps(recipe, language);
  const scaledIngredients = scaleIngredients(displayIngredients, recipe.servings, servings);
  const missing = getMissingIngredients(recipe, state.sessionIngredients);
  const missingNames = new Set(missing.map((m) => m.name.toLowerCase()));
  const localName = getLocalizedName(recipe, language);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (cookMode) {
      KeepAwake.activateKeepAwakeAsync();
    } else {
      KeepAwake.deactivateKeepAwake();
      clearInterval(timerRef.current!);
      setTimerRunning(false);
    }
    return () => {
      KeepAwake.deactivateKeepAwake();
      clearInterval(timerRef.current!);
    };
  }, [cookMode]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerRunning(false);
            setTimerDone(true);
            playBeep();
            // Flash animation
            Animated.sequence([
              ...Array(6).fill(null).map((_, i) =>
                Animated.timing(flashAnim, {
                  toValue: i % 2 === 0 ? 1 : 0,
                  duration: 250,
                  useNativeDriver: false,
                })
              ),
            ]).start();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current!);
    }
    return () => clearInterval(timerRef.current!);
  }, [timerRunning]);

  const resetTimer = () => {
    clearInterval(timerRef.current!);
    setTimerRunning(false);
    setTimerDone(false);
    setTimerSeconds(timerMinutes * 60);
    flashAnim.setValue(0);
  };

  const adjustTimerMinutes = (delta: number) => {
    if (timerRunning) return;
    const next = Math.max(1, Math.min(60, timerMinutes + delta));
    setTimerMinutes(next);
    setTimerSeconds(next * 60);
    setTimerDone(false);
    flashAnim.setValue(0);
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = timerMinutes > 0
    ? 1 - (timerSeconds / (timerMinutes * 60))
    : 0;
  const isLow = timerSeconds > 0 && timerSeconds <= 30 && timerRunning;

  const handleAddToShopping = () => {
    if (missing.length === 0) {
      Alert.alert(t('recipeDetail.allGood'), t('recipeDetail.allGoodMsg'));
      return;
    }
    const items: ShoppingItem[] = missing.map((m) => {
      // Match by index to get localized ingredient
      const idx = recipe.ingredients.findIndex(
        (ing) => ing.name.toLowerCase() === m.name.toLowerCase()
      );
      const localizedIng = idx >= 0 && displayIngredients[idx] ? displayIngredients[idx] : m;
      return {
        id: `${recipe.id}_${m.name}_${Date.now()}`,
        name: localizedIng.name,
        amount: localizedIng.amount,
        checked: false,
        recipeId: recipe.id,
        recipeName: localName,
      };
    });
    addToShoppingList(items);
    Alert.alert(t('recipeDetail.added'), `${missing.length} ${t('recipeDetail.addedMsg')}`);
  };

  const toggleIngredientCheck = (index: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  const totalTime = recipe.prepTime + recipe.cookTime;

  // ── COOK MODE ──────────────────────────────────────────────────────────────
  if (cookMode) {
    const flashBg = flashAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#1A1A1A', '#FF4444'],
    });

    return (
      <SafeAreaView style={styles.cookSafe}>
        <View style={styles.cookHeader}>
          <TouchableOpacity onPress={() => setCookMode(false)} style={styles.cookClose}>
            <Text style={styles.cookCloseText}>{t('recipeDetail.exit')}</Text>
          </TouchableOpacity>
          <Text style={styles.cookTitle}>{t('recipeDetail.cookMode')}</Text>
          <Text style={styles.cookProgress}>{currentStep + 1}/{displaySteps.length}</Text>
        </View>

        <View style={styles.cookBody}>
          <Text style={styles.cookStepNum}>{t('recipeDetail.step')} {currentStep + 1}</Text>
          <Text style={styles.cookStep}>{displaySteps[currentStep]}</Text>
        </View>

        {/* Timer section */}
        <Animated.View style={[styles.timerSection, { backgroundColor: flashBg }]}>
          <Text style={styles.timerSectionLabel}>
            {timerDone ? t('recipeDetail.timeUp') : t('recipeDetail.timerLabel')}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBarTrack}>
            <View style={[
              styles.progressBarFill,
              { width: `${Math.round(progress * 100)}%` as any },
              isLow && styles.progressBarLow,
              timerDone && styles.progressBarDone,
            ]} />
          </View>

          <View style={styles.timerRow}>
            {/* Adjust time */}
            {!timerRunning && !timerDone && (
              <TouchableOpacity onPress={() => adjustTimerMinutes(-1)} style={styles.adjustBtn}>
                <Text style={styles.adjustBtnText}>−</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => { setTimerDone(false); setTimerRunning(!timerRunning); }}
              style={styles.timerResetBtn}
              onLongPress={resetTimer}
            >
              <Text style={[styles.timerText, isLow && styles.timerTextLow, timerDone && styles.timerTextDone]}>
                {formatTimer(timerSeconds)}
              </Text>
            </TouchableOpacity>

            {!timerRunning && !timerDone && (
              <TouchableOpacity onPress={() => adjustTimerMinutes(1)} style={styles.adjustBtn}>
                <Text style={styles.adjustBtnText}>+</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.timerControls}>
            <TouchableOpacity
              onPress={resetTimer}
              style={styles.timerIconBtn}
            >
              <Text style={styles.timerIconText}>↺</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setTimerDone(false); setTimerRunning(!timerRunning); }}
              style={[styles.timerPlayBtn, timerRunning && styles.timerPauseBtn]}
            >
              <Text style={styles.timerPlayText}>{timerRunning ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
          </View>

          {!timerRunning && !timerDone && (
            <Text style={styles.timerHint}>{t('recipeDetail.tapToStart')}</Text>
          )}
        </Animated.View>

        <View style={styles.cookNav}>
          <TouchableOpacity
            onPress={() => { setCurrentStep((s) => Math.max(0, s - 1)); resetTimer(); }}
            disabled={currentStep === 0}
            style={[styles.cookNavBtn, currentStep === 0 && styles.navDisabled]}
          >
            <Text style={styles.cookNavText}>{t('recipeDetail.prev')}</Text>
          </TouchableOpacity>

          {currentStep < displaySteps.length - 1 ? (
            <TouchableOpacity
              onPress={() => { setCurrentStep((s) => s + 1); resetTimer(); }}
              style={styles.cookNavBtnPrimary}
            >
              <Text style={styles.cookNavTextPrimary}>{t('recipeDetail.next')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setCookMode(false)} style={styles.cookNavBtnPrimary}>
              <Text style={styles.cookNavTextPrimary}>{t('recipeDetail.done')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ── NORMAL VIEW ────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          {recipe.imageUrl ? (
            <Image source={{ uri: recipe.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderEmoji}>🍽️</Text>
            </View>
          )}
          <SafeAreaView style={styles.imageOverlay}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.overlayCircle}>
              <Text style={styles.overlayBack}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleFavorite(recipe)} style={styles.overlayCircle}>
              <Text style={[styles.overlayHeart, favorite && styles.overlayHeartActive]}>
                {favorite ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.contentCard}>
          {recipe.isAIGenerated && (
            <View style={styles.aiTag}>
              <Text style={styles.aiTagText}>{t('recipeDetail.aiGenerated')}</Text>
            </View>
          )}
          <Text style={styles.recipeName}>{localName}</Text>
          <View style={styles.starsRow}>
            <Text style={styles.stars}>⭐⭐⭐⭐</Text>
            <Text style={styles.starsCount}>(128 {t('recipeDetail.reviews')})</Text>
          </View>
          <View style={styles.infoPills}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
              </Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>⏱ {totalTime} {t('common.min')}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>👥 {servings} {t('recipeDetail.serv')}</Text>
            </View>
          </View>

          <View style={styles.servingsRow}>
            <Text style={styles.servingsLabel}>{t('recipeDetail.servings')}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => setServings((s) => Math.max(1, s - 1))} style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.servingsCount}>{servings}</Text>
              <TouchableOpacity onPress={() => setServings((s) => Math.min(12, s + 1))} style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('recipeDetail.ingredients')}</Text>
            <Text style={styles.sectionCount}>{scaledIngredients.length} {t('recipeDetail.items')}</Text>
          </View>
          {scaledIngredients.map((ing, i) => {
            const canonicalEn = recipe.ingredients[i]?.name.toLowerCase() ?? ing.name.toLowerCase();
            const isMissing = missingNames.has(canonicalEn);
            const isChecked = checkedIngredients.has(i);
            return (
              <TouchableOpacity key={i} style={styles.ingRow} onPress={() => toggleIngredientCheck(i)} activeOpacity={0.7}>
                <View style={[styles.ingCheckbox, isChecked && styles.ingCheckboxChecked]}>
                  {isChecked && <Text style={styles.ingCheck}>✓</Text>}
                </View>
                <View style={styles.ingInfo}>
                  <Text style={[styles.ingName, isMissing && styles.ingNameMissing, isChecked && styles.ingNameDone]}>
                    {ing.name}
                  </Text>
                  <Text style={styles.ingAmount}>{ing.amount}</Text>
                </View>
                {isMissing && <Text style={styles.missingTag}>{t('recipeDetail.missing')}</Text>}
              </TouchableOpacity>
            );
          })}

          <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>
            {t('recipeDetail.steps')}
          </Text>
          {displaySteps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepNum}>{i + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleAddToShopping} style={styles.addMissingBtn} activeOpacity={0.8}>
          <Text style={styles.addMissingText}>{t('recipeDetail.addMissing')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCookMode(true)} style={styles.cookBtn} activeOpacity={0.85}>
          <Text style={styles.cookBtnText}>{t('recipeDetail.startCooking')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { paddingBottom: 100 },

  imageContainer: { height: 280, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%', height: '100%', backgroundColor: '#FFF0EB',
    alignItems: 'center', justifyContent: 'center',
  },
  imagePlaceholderEmoji: { fontSize: 80 },
  imageOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16,
  },
  overlayCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  overlayBack: { fontSize: 18, color: '#1A1A1A' },
  overlayHeart: { fontSize: 18, color: '#DDD' },
  overlayHeartActive: { color: '#E85D4C' },

  contentCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    marginTop: -20, padding: 24, paddingBottom: 16,
  },
  aiTag: {
    alignSelf: 'flex-start', backgroundColor: '#FFF0EB', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10,
  },
  aiTagText: { color: '#FF6B35', fontSize: 12, fontWeight: '700' },
  recipeName: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  stars: { fontSize: 14 },
  starsCount: { fontSize: 13, color: '#999' },
  infoPills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  pill: {
    backgroundColor: '#F0F0F0', borderRadius: 12,
    paddingHorizontal: 12, height: 32, alignItems: 'center', justifyContent: 'center',
  },
  pillText: { fontSize: 13, color: '#666', fontWeight: '500' },
  servingsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F8F8F8', borderRadius: 14, padding: 12, marginBottom: 24,
  },
  servingsLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
  },
  stepBtnText: { fontSize: 18, color: '#FFF', fontWeight: '700', lineHeight: 22 },
  servingsCount: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', minWidth: 24, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  sectionCount: { fontSize: 14, color: '#4ECDC4', fontWeight: '600' },
  ingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  ingCheckbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
  },
  ingCheckboxChecked: { backgroundColor: '#FF6B35' },
  ingCheck: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  ingInfo: { flex: 1 },
  ingName: { fontSize: 15, fontWeight: '500', color: '#1A1A1A' },
  ingNameMissing: { color: '#E85D4C' },
  ingNameDone: { textDecorationLine: 'line-through', color: '#BBB' },
  ingAmount: { fontSize: 13, color: '#999', marginTop: 2 },
  missingTag: {
    fontSize: 11, color: '#E85D4C', fontWeight: '600',
    backgroundColor: '#FCE4EC', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  stepRow: { flexDirection: 'row', gap: 14, marginBottom: 20, alignItems: 'flex-start' },
  stepNum: { fontSize: 20, fontWeight: '700', color: '#FF6B35', width: 28 },
  stepText: { flex: 1, fontSize: 15, color: '#444', lineHeight: 24 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF', flexDirection: 'row', gap: 12,
    padding: 20, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: '#EEEEEE',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
  },
  addMissingBtn: {
    flex: 1, height: 52, borderRadius: 16,
    borderWidth: 2, borderColor: '#4ECDC4',
    alignItems: 'center', justifyContent: 'center',
  },
  addMissingText: { color: '#4ECDC4', fontWeight: '700', fontSize: 15 },
  cookBtn: {
    flex: 1.5, height: 52, borderRadius: 16,
    backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
  },
  cookBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  // Cook Mode
  cookSafe: { flex: 1, backgroundColor: '#1A1A1A' },
  cookHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 24,
    borderBottomWidth: 1, borderBottomColor: '#333',
  },
  cookClose: { flex: 1 },
  cookCloseText: { color: '#999', fontSize: 15 },
  cookTitle: { flex: 2, textAlign: 'center', color: '#FFF', fontWeight: '700', fontSize: 16 },
  cookProgress: { flex: 1, textAlign: 'right', color: '#FF6B35', fontWeight: '600' },
  cookBody: { flex: 1, padding: 32, justifyContent: 'center', alignItems: 'center' },
  cookStepNum: { fontSize: 14, color: '#FF6B35', fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
  cookStep: { color: '#FFF', fontSize: 22, lineHeight: 34, fontWeight: '500', textAlign: 'center' },

  // Timer
  timerSection: {
    paddingHorizontal: 24, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#333',
    alignItems: 'center', gap: 8,
  },
  timerSectionLabel: { fontSize: 12, color: '#888', fontWeight: '600', letterSpacing: 0.5 },
  progressBarTrack: {
    width: '100%', height: 4, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%', backgroundColor: '#FF6B35', borderRadius: 2,
  },
  progressBarLow: { backgroundColor: '#FF4444' },
  progressBarDone: { backgroundColor: '#FF4444', width: '100%' as any },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  timerResetBtn: { paddingHorizontal: 8 },
  timerText: { color: '#FFF', fontSize: 52, fontWeight: '100', letterSpacing: 2 },
  timerTextLow: { color: '#FF4444' },
  timerTextDone: { color: '#FF4444' },
  adjustBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#333', alignItems: 'center', justifyContent: 'center',
  },
  adjustBtnText: { color: '#FFF', fontSize: 20, fontWeight: '300' },
  timerControls: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 4 },
  timerIconBtn: { padding: 8 },
  timerIconText: { fontSize: 22, color: '#666' },
  timerPlayBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  timerPauseBtn: { backgroundColor: '#444' },
  timerPlayText: { fontSize: 20, color: '#FFF' },
  timerHint: { fontSize: 11, color: '#555' },

  cookNav: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#333' },
  cookNavBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#444', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  navDisabled: { opacity: 0.3 },
  cookNavText: { color: '#AAA', fontWeight: '600', fontSize: 15 },
  cookNavBtnPrimary: {
    flex: 1, backgroundColor: '#FF6B35', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  cookNavTextPrimary: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});

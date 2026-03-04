import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
  Image, Alert, Platform,
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

export default function RecipeDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { recipe } = route.params;
  const { state, toggleFavorite, isFavorite, addToShoppingList } = useApp();
  const { t, language } = useTranslation();

  const [servings, setServings] = useState(recipe.servings);
  const [cookMode, setCookMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const favorite = isFavorite(recipe.id);
  const displayIngredients = getLocalizedIngredients(recipe, language);
  const displaySteps = getLocalizedSteps(recipe, language);
  const scaledIngredients = scaleIngredients(displayIngredients, recipe.servings, servings);
  const missing = getMissingIngredients(recipe, state.sessionIngredients);
  const missingNames = new Set(missing.map((m) => m.name.toLowerCase()));

  const localName = getLocalizedName(recipe, language);
  const localDesc = getLocalizedDescription(recipe, language);

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
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current!);
    }
    return () => clearInterval(timerRef.current!);
  }, [timerRunning]);

  const handleAddToShopping = () => {
    if (missing.length === 0) {
      Alert.alert(t('recipeDetail.allGood'), t('recipeDetail.allGoodMsg'));
      return;
    }
    const items: ShoppingItem[] = missing.map((m) => ({
      id: `${recipe.id}_${m.name}_${Date.now()}`,
      name: m.name,
      amount: m.amount,
      checked: false,
      recipeId: recipe.id,
      recipeName: localName,
    }));
    addToShoppingList(items);
    Alert.alert(
      t('recipeDetail.added'),
      `${missing.length} ${t('recipeDetail.addedMsg')}`
    );
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const toggleIngredientCheck = (index: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const totalTime = recipe.prepTime + recipe.cookTime;

  // Cook Mode
  if (cookMode) {
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

        <View style={styles.timerRow}>
          <TouchableOpacity
            onPress={() => { setTimer(0); setTimerRunning(false); }}
            style={styles.timerBtn}
          >
            <Text style={styles.timerReset}>↺</Text>
          </TouchableOpacity>
          <Text style={styles.timerText}>{formatTimer(timer)}</Text>
          <TouchableOpacity
            onPress={() => setTimerRunning(!timerRunning)}
            style={styles.timerBtn}
          >
            <Text style={styles.timerToggle}>{timerRunning ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cookNav}>
          <TouchableOpacity
            onPress={() => { setCurrentStep((s) => Math.max(0, s - 1)); setTimer(0); setTimerRunning(false); }}
            disabled={currentStep === 0}
            style={[styles.cookNavBtn, currentStep === 0 && styles.navDisabled]}
          >
            <Text style={styles.cookNavText}>{t('recipeDetail.prev')}</Text>
          </TouchableOpacity>

          {currentStep < displaySteps.length - 1 ? (
            <TouchableOpacity
              onPress={() => { setCurrentStep((s) => s + 1); setTimer(0); setTimerRunning(false); }}
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

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image */}
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

        {/* Content Card */}
        <View style={styles.contentCard}>
          {recipe.isAIGenerated && (
            <View style={styles.aiTag}>
              <Text style={styles.aiTagText}>{t('recipeDetail.aiGenerated')}</Text>
            </View>
          )}

          <Text style={styles.recipeName}>{localName}</Text>

          {/* Stars */}
          <View style={styles.starsRow}>
            <Text style={styles.stars}>⭐⭐⭐⭐</Text>
            <Text style={styles.starsCount}>(128 {t('recipeDetail.reviews')})</Text>
          </View>

          {/* Info pills */}
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

          {/* Serving adjuster */}
          <View style={styles.servingsRow}>
            <Text style={styles.servingsLabel}>{t('recipeDetail.servings')}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                onPress={() => setServings((s) => Math.max(1, s - 1))}
                style={styles.stepBtn}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.servingsCount}>{servings}</Text>
              <TouchableOpacity
                onPress={() => setServings((s) => Math.min(12, s + 1))}
                style={styles.stepBtn}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('recipeDetail.ingredients')}</Text>
            <Text style={styles.sectionCount}>{scaledIngredients.length} {t('recipeDetail.items')}</Text>
          </View>
          {scaledIngredients.map((ing, i) => {
            // Check missing against English canonical names
            const canonicalEn = recipe.ingredients[i]?.name.toLowerCase() ?? ing.name.toLowerCase();
            const isMissing = missingNames.has(canonicalEn);
            const isChecked = checkedIngredients.has(i);
            return (
              <TouchableOpacity
                key={i}
                style={styles.ingRow}
                onPress={() => toggleIngredientCheck(i)}
                activeOpacity={0.7}
              >
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

          {/* Steps */}
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

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleAddToShopping}
          style={styles.addMissingBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.addMissingText}>{t('recipeDetail.addMissing')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCookMode(true)}
          style={styles.cookBtn}
          activeOpacity={0.85}
        >
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
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 4,
  },

  aiTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0EB', borderRadius: 999,
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
    borderWidth: 2, borderColor: '#FF6B35',
    alignItems: 'center', justifyContent: 'center',
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
    backgroundColor: '#FCE4EC', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
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
    backgroundColor: '#FF6B35',
    alignItems: 'center', justifyContent: 'center',
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
  cookStep: { color: '#FFF', fontSize: 24, lineHeight: 36, fontWeight: '500', textAlign: 'center' },
  timerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32,
    paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#333',
  },
  timerBtn: { padding: 12 },
  timerText: { color: '#FFF', fontSize: 40, fontWeight: '200' },
  timerReset: { fontSize: 24, color: '#999' },
  timerToggle: { fontSize: 28 },
  cookNav: {
    flexDirection: 'row', padding: 20, gap: 12,
    borderTopWidth: 1, borderTopColor: '#333',
  },
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

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
  Image, Alert, Animated,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import * as KeepAwake from 'expo-keep-awake';
import { useApp } from '../context/AppContext';
import { RootStackParamList, ShoppingItem } from '../types';
import { getMissingIngredients, scaleIngredients } from '../utils/filterRecipes';
import { shareRecipe } from '../utils/share';
import IngredientTag from '../components/recipe/IngredientTag';
import { colors, spacing, radius, typography, shadows } from '../styles/theme';

type Route = RouteProp<RootStackParamList, 'RecipeDetail'>;

export default function RecipeDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { recipe } = route.params;
  const { state, toggleFavorite, isFavorite, addToShoppingList } = useApp();

  const [servings, setServings] = useState(recipe.servings);
  const [cookMode, setCookMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const favorite = isFavorite(recipe.id);
  const scaledIngredients = scaleIngredients(recipe.ingredients, recipe.servings, servings);
  const missing = getMissingIngredients(recipe, state.sessionIngredients);
  const missingNames = new Set(missing.map((m) => m.name.toLowerCase()));

  useEffect(() => {
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
      Alert.alert('All good!', 'You have all the ingredients for this recipe.');
      return;
    }
    const items: ShoppingItem[] = missing.map((m) => ({
      id: `${recipe.id}_${m.name}_${Date.now()}`,
      name: m.name,
      amount: m.amount,
      checked: false,
      recipeId: recipe.id,
      recipeName: recipe.name,
    }));
    addToShoppingList(items);
    Alert.alert('Added!', `${missing.length} ingredient${missing.length > 1 ? 's' : ''} added to your shopping list.`);
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (cookMode) {
    return (
      <SafeAreaView style={styles.cookSafe}>
        <View style={styles.cookHeader}>
          <TouchableOpacity onPress={() => setCookMode(false)} style={styles.cookClose}>
            <Text style={styles.cookCloseText}>✕ Exit</Text>
          </TouchableOpacity>
          <Text style={styles.cookTitle}>Cook Mode</Text>
          <Text style={styles.cookProgress}>{currentStep + 1} / {recipe.steps.length}</Text>
        </View>

        <View style={styles.cookBody}>
          <Text style={styles.cookStep}>{recipe.steps[currentStep]}</Text>
        </View>

        <View style={styles.timerRow}>
          <TouchableOpacity
            onPress={() => { setTimer(0); setTimerRunning(false); }}
            style={styles.timerResetBtn}
          >
            <Text style={styles.timerReset}>↺</Text>
          </TouchableOpacity>
          <Text style={styles.timerText}>{formatTimer(timer)}</Text>
          <TouchableOpacity
            onPress={() => setTimerRunning(!timerRunning)}
            style={styles.timerToggleBtn}
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
            <Text style={styles.cookNavText}>← Previous</Text>
          </TouchableOpacity>

          {currentStep < recipe.steps.length - 1 ? (
            <TouchableOpacity
              onPress={() => { setCurrentStep((s) => s + 1); setTimer(0); setTimerRunning(false); }}
              style={styles.cookNavBtnPrimary}
            >
              <Text style={styles.cookNavTextPrimary}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setCookMode(false)} style={styles.cookNavBtnPrimary}>
              <Text style={styles.cookNavTextPrimary}>Done! 🎉</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {recipe.imageUrl ? (
            <Image source={{ uri: recipe.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🍽️</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleFavorite(recipe)} style={styles.favBtn}>
            <Text style={styles.favBtnText}>{favorite ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {recipe.isAIGenerated && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>✨ AI Generated</Text>
            </View>
          )}

          <Text style={styles.name}>{recipe.name}</Text>
          <Text style={styles.description}>{recipe.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaCard}>
              <Text style={styles.metaValue}>{recipe.prepTime}m</Text>
              <Text style={styles.metaKey}>Prep</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaValue}>{recipe.cookTime}m</Text>
              <Text style={styles.metaKey}>Cook</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaValue}>{recipe.difficulty}</Text>
              <Text style={styles.metaKey}>Difficulty</Text>
            </View>
          </View>

          <View style={styles.servingsRow}>
            <Text style={styles.sectionTitle}>Servings</Text>
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

          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.card}>
            {scaledIngredients.map((ing, i) => (
              <IngredientTag
                key={i}
                name={ing.name}
                amount={ing.amount}
                missing={missingNames.has(ing.name.toLowerCase())}
              />
            ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Steps</Text>
          {recipe.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          <View style={styles.actions}>
            <TouchableOpacity onPress={() => setCookMode(true)} style={styles.cookModeBtn} activeOpacity={0.85}>
              <Text style={styles.cookModeBtnText}>👨‍🍳 Cook Mode</Text>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => shareRecipe(recipe)} style={styles.actionBtn} activeOpacity={0.8}>
                <Text style={styles.actionBtnText}>📤 Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddToShopping}
                style={[styles.actionBtn, missing.length > 0 && styles.actionBtnAlert]}
                activeOpacity={0.8}
              >
                <Text style={[styles.actionBtnText, missing.length > 0 && styles.actionBtnAlertText]}>
                  🛒 {missing.length > 0 ? `Buy ${missing.length} items` : 'All in pantry'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  imageContainer: { position: 'relative', height: 260 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: '100%', backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 80 },
  backBtn: { position: 'absolute', top: spacing.lg, left: spacing.md, backgroundColor: 'rgba(255,255,255,0.9)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 20, color: colors.textPrimary },
  favBtn: { position: 'absolute', top: spacing.lg, right: spacing.md, backgroundColor: 'rgba(255,255,255,0.9)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  favBtnText: { fontSize: 20, color: colors.danger },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  aiBadge: { backgroundColor: colors.primaryLight, alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, marginBottom: spacing.sm },
  aiBadgeText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  name: { ...typography.h1, marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 22 },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  metaCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', ...shadows.sm },
  metaValue: { ...typography.h4, color: colors.primary, marginBottom: spacing.xs, textTransform: 'capitalize' },
  metaKey: { ...typography.caption },
  servingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: { backgroundColor: colors.primaryLight, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 20, color: colors.primary, fontWeight: '700', lineHeight: 22 },
  servingsCount: { ...typography.h3, minWidth: 30, textAlign: 'center' },
  sectionTitle: { ...typography.h4, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, ...shadows.sm, marginBottom: spacing.sm },
  stepRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  stepNumberText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  stepText: { flex: 1, ...typography.body, lineHeight: 22, color: colors.textPrimary },
  actions: { marginTop: spacing.xl, gap: spacing.sm },
  cookModeBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center', ...shadows.md },
  cookModeBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
  actionBtnAlert: { borderColor: colors.accent, backgroundColor: colors.accentLight },
  actionBtnText: { fontWeight: '600', color: colors.textSecondary },
  actionBtnAlertText: { color: colors.accent },
  cookSafe: { flex: 1, backgroundColor: '#1A1A1A' },
  cookHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: '#333' },
  cookClose: { flex: 1 },
  cookCloseText: { color: colors.textMuted, fontSize: 15 },
  cookTitle: { flex: 2, textAlign: 'center', color: '#fff', fontWeight: '700', fontSize: 16 },
  cookProgress: { flex: 1, textAlign: 'right', color: colors.primary, fontWeight: '600' },
  cookBody: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  cookStep: { color: '#fff', fontSize: 22, lineHeight: 34, fontWeight: '500', textAlign: 'center' },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: '#333' },
  timerText: { color: '#fff', fontSize: 40, fontWeight: '200', fontVariant: ['tabular-nums'] },
  timerResetBtn: { padding: spacing.sm },
  timerReset: { fontSize: 24, color: colors.textMuted },
  timerToggleBtn: { padding: spacing.sm },
  timerToggle: { fontSize: 28 },
  cookNav: { flexDirection: 'row', padding: spacing.lg, gap: spacing.sm, borderTopWidth: 1, borderTopColor: '#333' },
  cookNavBtn: { flex: 1, borderWidth: 1.5, borderColor: '#444', borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  navDisabled: { opacity: 0.3 },
  cookNavText: { color: '#aaa', fontWeight: '600', fontSize: 15 },
  cookNavBtnPrimary: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  cookNavTextPrimary: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

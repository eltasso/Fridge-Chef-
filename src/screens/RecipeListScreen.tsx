import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { Recipe, RootStackParamList } from '../types';
import { LOCAL_RECIPES } from '../data/recipes';
import { generateRecipes } from '../services/openai';
import { filterRecipes } from '../utils/filterRecipes';
import RecipeCard from '../components/recipe/RecipeCard';
import { colors, spacing, radius, typography, shadows } from '../styles/theme';

type Nav = StackNavigationProp<RootStackParamList, 'RecipeList'>;

export default function RecipeListScreen() {
  const navigation = useNavigation<Nav>();
  const { state, toggleFavorite, isFavorite, setCachedRecipes, getCacheKey } = useApp();
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const localFiltered = filterRecipes(
    LOCAL_RECIPES,
    state.sessionIngredients,
    state.mealTime,
    state.preference,
    state.filters
  );

  const cacheKey = getCacheKey();
  const cached = state.cachedRecipes[cacheKey] ?? [];

  const allRecipes = [...localFiltered, ...(aiRecipes.length > 0 ? aiRecipes : cached)];

  const handleGenerateAI = useCallback(async () => {
    if (!state.mealTime || !state.preference) return;

    if (cached.length > 0 && aiRecipes.length === 0) {
      setAiRecipes(cached);
      return;
    }

    setLoading(true);
    try {
      const recipes = await generateRecipes({
        ingredients: state.sessionIngredients,
        mealTime: state.mealTime,
        preference: state.preference,
        difficulty: state.filters.difficulty,
        dietary: state.filters.dietary,
      });
      setAiRecipes(recipes);
      setCachedRecipes(cacheKey, recipes);
    } catch (error: any) {
      Alert.alert(
        'AI Generation Failed',
        error.message === 'OpenAI API key not configured'
          ? 'Add your OpenAI API key to the .env file to enable AI recipe generation.'
          : 'Could not generate recipes. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  }, [state, cacheKey, cached, aiRecipes]);

  const handleRegenerate = useCallback(async () => {
    if (!state.mealTime || !state.preference) return;
    setLoading(true);
    setAiRecipes([]);
    try {
      const recipes = await generateRecipes({
        ingredients: state.sessionIngredients,
        mealTime: state.mealTime,
        preference: state.preference,
        difficulty: state.filters.difficulty,
        dietary: state.filters.dietary,
      });
      setAiRecipes(recipes);
      setCachedRecipes(cacheKey, recipes);
    } catch {
      Alert.alert('Error', 'Could not regenerate recipes.');
    } finally {
      setLoading(false);
    }
  }, [state, cacheKey]);

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recipes</Text>
        <Text style={styles.subtitle}>
          {state.mealTime} · {state.preference}
          {state.sessionIngredients.length > 0 ? ` · ${state.sessionIngredients.length} ingredients` : ''}
        </Text>
      </View>

      {localFiltered.length === 0 && allRecipes.length === 0 && (
        <View style={styles.emptyLocal}>
          <Text style={styles.emptyText}>No local recipes match your filters.</Text>
        </View>
      )}

      {localFiltered.length > 0 && (
        <Text style={styles.sectionLabel}>Local Recipes ({localFiltered.length})</Text>
      )}
    </View>
  );

  const renderFooter = () => (
    <View>
      {aiRecipes.length > 0 || cached.length > 0 ? (
        <>
          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
            AI Recipes {cached.length > 0 && aiRecipes.length === 0 ? '(cached)' : ''}
          </Text>
          {(aiRecipes.length > 0 ? aiRecipes : cached).map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onPress={() => navigation.navigate('RecipeDetail', { recipe })}
              onFavorite={() => toggleFavorite(recipe)}
              isFavorite={isFavorite(recipe.id)}
            />
          ))}
          <TouchableOpacity
            onPress={handleRegenerate}
            disabled={loading}
            style={styles.regenBtn}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={styles.regenText}>↻ Regenerate AI Recipes</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.aiSection}>
          <Text style={styles.aiTitle}>Want more ideas?</Text>
          <Text style={styles.aiSubtitle}>Generate personalized recipes with AI</Text>
          <TouchableOpacity
            onPress={handleGenerateAI}
            disabled={loading}
            style={styles.aiBtn}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.aiBtnText}>✨ Generate AI Recipes</Text>
            )}
          </TouchableOpacity>
          {loading && (
            <Text style={styles.loadingHint}>This may take a few seconds...</Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={localFiltered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
            onFavorite={() => toggleFavorite(item)}
            isFavorite={isFavorite(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  backBtn: { marginBottom: spacing.sm },
  backText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  title: { ...typography.h2, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, textTransform: 'capitalize' },
  sectionLabel: { ...typography.label, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md, color: colors.textMuted },
  emptyLocal: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  aiSection: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    alignItems: 'center', ...shadows.md, marginTop: spacing.md,
  },
  aiTitle: { ...typography.h3, marginBottom: spacing.xs },
  aiSubtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg, textAlign: 'center' },
  aiBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14,
    paddingHorizontal: spacing.xl, ...shadows.sm,
  },
  aiBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  loadingHint: { ...typography.caption, marginTop: spacing.sm, color: colors.textMuted },
  regenBtn: {
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 12, alignItems: 'center', marginTop: spacing.md,
  },
  regenText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
});

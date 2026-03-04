import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { Recipe, RootStackParamList } from '../types';
import { LOCAL_RECIPES } from '../data/recipes';
import { generateRecipes } from '../services/openai';
import { filterRecipes } from '../utils/filterRecipes';

type Nav = StackNavigationProp<RootStackParamList, 'RecipeList'>;

type FilterTab = 'all' | 'quick' | 'easy' | 'ai';

function RecipeRow({
  recipe,
  onPress,
  onFavorite,
  isFavorite,
}: {
  recipe: Recipe;
  onPress: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
}) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  const difficultyColor =
    recipe.difficulty === 'easy'
      ? { bg: '#E8F5E9', text: '#4CAF50' }
      : recipe.difficulty === 'medium'
      ? { bg: '#FFF3E0', text: '#FF9800' }
      : { bg: '#FCE4EC', text: '#E91E63' };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardImagePlaceholder}>
        <Text style={styles.cardImageEmoji}>🍽️</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={2}>{recipe.name}</Text>
        <View style={styles.cardMeta}>
          <View style={[styles.diffBadge, { backgroundColor: difficultyColor.bg }]}>
            <Text style={[styles.diffBadgeText, { color: difficultyColor.text }]}>
              {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
            </Text>
          </View>
          <Text style={styles.cardTime}>⏱ {totalTime} min</Text>
          {recipe.isAIGenerated && (
            <Text style={styles.aiBadge}>✨ AI</Text>
          )}
        </View>
        <Text style={styles.cardDesc} numberOfLines={1}>{recipe.description}</Text>
      </View>
      <TouchableOpacity onPress={onFavorite} style={styles.heartBtn}>
        <Text style={[styles.heartIcon, isFavorite && styles.heartIconActive]}>
          {isFavorite ? '♥' : '♡'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function RecipeListScreen() {
  const navigation = useNavigation<Nav>();
  const { state, toggleFavorite, isFavorite, setCachedRecipes, getCacheKey } = useApp();
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const localFiltered = filterRecipes(
    LOCAL_RECIPES,
    state.sessionIngredients,
    state.mealTime,
    state.preference,
    state.filters
  );

  const cacheKey = getCacheKey();
  const cached = state.cachedRecipes[cacheKey] ?? [];
  const displayedAI = aiRecipes.length > 0 ? aiRecipes : cached;

  const allRecipes = [...localFiltered, ...displayedAI];

  const filteredByTab = allRecipes.filter((r) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'quick') return r.prepTime + r.cookTime < 15;
    if (activeTab === 'easy') return r.difficulty === 'easy';
    if (activeTab === 'ai') return r.isAIGenerated;
    return true;
  });

  const handleGenerateAI = useCallback(async () => {
    if (!state.mealTime || !state.preference) return;

    if (cached.length > 0 && aiRecipes.length === 0) {
      setAiRecipes(cached);
      setActiveTab('ai');
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
      setActiveTab('ai');
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

  const ingredientSummary = state.sessionIngredients.slice(0, 4).join(', ') +
    (state.sessionIngredients.length > 4 ? ` +${state.sessionIngredients.length - 4} more` : '');

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'quick', label: 'Quick (<15min)' },
    { key: 'easy', label: 'Easy' },
    { key: 'ai', label: '✨ AI Generated' },
  ];

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recipes for You</Text>
        {state.sessionIngredients.length > 0 && (
          <Text style={styles.subtitle}>Based on: {ingredientSummary}</Text>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabPill, activeTab === tab.key && styles.tabPillActive]}
          >
            <Text style={[styles.tabPillText, activeTab === tab.key && styles.tabPillTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredByTab.length === 0 && !loading && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No recipes match your filters.</Text>
        </View>
      )}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      {displayedAI.length > 0 && (
        <TouchableOpacity
          onPress={handleRegenerate}
          disabled={loading}
          style={styles.regenBtn}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#4ECDC4" size="small" />
          ) : (
            <Text style={styles.regenText}>↻ Regenerate AI Recipes</Text>
          )}
        </TouchableOpacity>
      )}
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
      <Text style={styles.aiHint}>Powered by AI — uses your ingredients to create new recipes</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={filteredByTab}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <RecipeRow
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
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { padding: 20, paddingBottom: 48 },

  header: { marginBottom: 20 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 24, color: '#4ECDC4', fontWeight: '400' },
  title: { fontSize: 32, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#999999' },

  tabsRow: { marginBottom: 16 },
  tabPill: {
    borderRadius: 20, height: 36, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: '#DDD', backgroundColor: '#FFF',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  tabPillActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  tabPillText: { fontSize: 13, color: '#666', fontWeight: '500' },
  tabPillTextActive: { color: '#FFF', fontWeight: '600' },

  emptyCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  emptyText: { fontSize: 15, color: '#666' },

  card: {
    flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16,
    marginBottom: 12, padding: 12, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  cardImagePlaceholder: {
    width: 90, height: 90, borderRadius: 12,
    backgroundColor: '#FFF0EB', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardImageEmoji: { fontSize: 36 },
  cardContent: { flex: 1, justifyContent: 'center', gap: 6 },
  cardName: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  diffBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  diffBadgeText: { fontSize: 12, fontWeight: '600' },
  cardTime: { fontSize: 13, color: '#999' },
  aiBadge: { fontSize: 12, color: '#FF6B35', fontWeight: '600' },
  cardDesc: { fontSize: 13, color: '#999' },
  heartBtn: { padding: 4, alignSelf: 'flex-start' },
  heartIcon: { fontSize: 22, color: '#DDD' },
  heartIconActive: { color: '#FF6B35' },

  footer: { gap: 12, marginTop: 8 },
  regenBtn: {
    borderWidth: 1.5, borderColor: '#4ECDC4', borderRadius: 16,
    height: 52, alignItems: 'center', justifyContent: 'center',
  },
  regenText: { color: '#4ECDC4', fontWeight: '600', fontSize: 15 },
  aiBtn: {
    backgroundColor: '#4ECDC4', borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4ECDC4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  aiBtnText: { color: '#FFF', fontWeight: '700', fontSize: 17 },
  aiHint: { fontSize: 12, color: '#999', textAlign: 'center' },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { Difficulty, DietaryTag, Filters, RootStackParamList } from '../types';
import Input from '../components/common/Input';
import Chip from '../components/common/Chip';
import { colors, spacing, radius, typography, shadows } from '../styles/theme';

type Nav = StackNavigationProp<RootStackParamList, 'Ingredients'>;

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const TIME_OPTIONS: { value: number; label: string }[] = [
  { value: 15, label: '< 15 min' },
  { value: 30, label: '< 30 min' },
  { value: 60, label: '< 60 min' },
];

const DIETARY_OPTIONS: { value: DietaryTag; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'dairy-free', label: 'Dairy-Free' },
];

export default function IngredientsScreen() {
  const navigation = useNavigation<Nav>();
  const { state, addIngredient, removeIngredient, setFilters } = useApp();
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed.length > 0) {
      addIngredient(trimmed);
      setInputValue('');
    }
  };

  const toggleDietary = (tag: DietaryTag) => {
    const current = state.filters.dietary;
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    setFilters({ dietary: next });
  };

  const toggleDifficulty = (d: Difficulty) => {
    setFilters({ difficulty: state.filters.difficulty === d ? null : d });
  };

  const toggleTime = (t: number) => {
    setFilters({ maxTime: state.filters.maxTime === t ? null : t });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Your Ingredients</Text>
          <Text style={styles.subtitle}>What's in your fridge?</Text>
        </View>

        <View style={styles.inputRow}>
          <Input
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="e.g. chicken, eggs, tomatoes..."
            onSubmit={handleAdd}
            submitLabel="Add"
            style={styles.input}
          />
        </View>

        {state.sessionIngredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Added ({state.sessionIngredients.length})</Text>
            <View style={styles.chips}>
              {state.sessionIngredients.map((ing) => (
                <Chip
                  key={ing}
                  label={ing}
                  variant="ingredient"
                  onRemove={() => removeIngredient(ing)}
                />
              ))}
            </View>
          </View>
        )}

        {state.pantryIngredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Previously used</Text>
            <View style={styles.chips}>
              {state.pantryIngredients
                .filter((p) => !state.sessionIngredients.includes(p))
                .map((ing) => (
                  <Chip
                    key={ing}
                    label={`+ ${ing}`}
                    variant="filter"
                    onPress={() => addIngredient(ing)}
                  />
                ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty</Text>
          <View style={styles.chips}>
            {DIFFICULTIES.map((d) => (
              <Chip
                key={d.value}
                label={d.label}
                selected={state.filters.difficulty === d.value}
                onPress={() => toggleDifficulty(d.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooking Time</Text>
          <View style={styles.chips}>
            {TIME_OPTIONS.map((t) => (
              <Chip
                key={t.value}
                label={t.label}
                selected={state.filters.maxTime === t.value}
                onPress={() => toggleTime(t.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary</Text>
          <View style={styles.chips}>
            {DIETARY_OPTIONS.map((d) => (
              <Chip
                key={d.value}
                label={d.label}
                selected={state.filters.dietary.includes(d.value)}
                onPress={() => toggleDietary(d.value)}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('RecipeList')}
          activeOpacity={0.85}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>Find Recipes →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  backBtn: { marginBottom: spacing.sm },
  backText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  title: { ...typography.h2, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary },
  inputRow: { marginBottom: spacing.lg },
  input: { flex: 1 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.label, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cta: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: spacing.md, alignItems: 'center', ...shadows.md,
    marginTop: spacing.sm,
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

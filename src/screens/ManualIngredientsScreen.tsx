import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { useHideTabBar } from '../hooks/useHideTabBar';
import { RootStackParamList } from '../types';

type Nav = StackNavigationProp<RootStackParamList, 'ManualIngredients'>;

const SUGGESTIONS_ES = [
  { display: 'Huevos', value: 'huevos' },
  { display: 'Leche', value: 'leche' },
  { display: 'Mantequilla', value: 'mantequilla' },
  { display: 'Queso', value: 'queso' },
  { display: 'Pan', value: 'pan' },
  { display: 'Pasta', value: 'pasta' },
  { display: 'Arroz', value: 'arroz' },
  { display: 'Cebolla', value: 'cebolla' },
  { display: 'Ajo', value: 'ajo' },
  { display: 'Tomate', value: 'tomate' },
  { display: 'Pollo', value: 'pollo' },
  { display: 'Carne', value: 'carne' },
];

const SUGGESTIONS_EN = [
  { display: 'Eggs', value: 'eggs' },
  { display: 'Milk', value: 'milk' },
  { display: 'Butter', value: 'butter' },
  { display: 'Cheese', value: 'cheese' },
  { display: 'Bread', value: 'bread' },
  { display: 'Pasta', value: 'pasta' },
  { display: 'Rice', value: 'rice' },
  { display: 'Onion', value: 'onion' },
  { display: 'Garlic', value: 'garlic' },
  { display: 'Tomato', value: 'tomato' },
  { display: 'Chicken', value: 'chicken' },
  { display: 'Beef', value: 'beef' },
];

export default function ManualIngredientsScreen() {
  const navigation = useNavigation<Nav>();
  const { state, addIngredient, removeIngredient } = useApp();
  const { t, language } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<TextInput>(null);
  useHideTabBar();

  const SUGGESTIONS = language === 'es' ? SUGGESTIONS_ES : SUGGESTIONS_EN;

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed.length > 0) {
      addIngredient(trimmed);
      setInputValue('');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{t('ingredients.manualDone')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('ingredients.manualTitle')}</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>{t('ingredients.manualSubtitle')}</Text>

        {/* Input row */}
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={t('ingredients.placeholder')}
            placeholderTextColor="#999"
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            autoFocus
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Added chips */}
        {state.sessionIngredients.length > 0 && (
          <View style={styles.addedSection}>
            <Text style={styles.sectionLabel}>{t('ingredients.added')}</Text>
            <View style={styles.chipsWrap}>
              {state.sessionIngredients.map((ing) => (
                <View key={ing} style={styles.chip}>
                  <Text style={styles.chipText}>{ing}</Text>
                  <TouchableOpacity onPress={() => removeIngredient(ing)}>
                    <Text style={styles.chipRemove}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Suggestions */}
        <Text style={styles.sectionLabel}>{t('ingredients.suggestions')}</Text>
        <View style={styles.suggestionsWrap}>
          {SUGGESTIONS.filter((s) => !state.sessionIngredients.includes(s.value)).map((s) => (
            <TouchableOpacity
              key={s.value}
              style={styles.suggestionChip}
              onPress={() => addIngredient(s.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.suggestionChipText}>{s.display}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Previously used */}
        {state.pantryIngredients.filter((p) => !state.sessionIngredients.includes(p)).length > 0 && (
          <View style={styles.addedSection}>
            <Text style={styles.sectionLabel}>{t('ingredients.previouslyUsed')}</Text>
            <View style={styles.suggestionsWrap}>
              {state.pantryIngredients
                .filter((p) => !state.sessionIngredients.includes(p))
                .map((ing) => (
                  <TouchableOpacity
                    key={ing}
                    style={styles.suggestionChip}
                    onPress={() => addIngredient(ing)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.suggestionChipText}>+ {ing}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Done button */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          style={styles.doneBtn}
        >
          <Text style={styles.doneBtnText}>{t('ingredients.done')} ✓</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFF',
  },
  backBtn: { width: 80 },
  backText: { fontSize: 15, color: '#FF6B35', fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },

  scroll: { padding: 24, paddingBottom: 110 },
  subtitle: { fontSize: 14, color: '#999', marginBottom: 20 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 14, height: 52,
    paddingHorizontal: 14, marginBottom: 24, gap: 10,
  },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: 16, color: '#1A1A1A' },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '700', lineHeight: 28 },

  addedSection: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#999',
    letterSpacing: 1, marginBottom: 10,
  },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FF6B35', borderRadius: 20,
    paddingHorizontal: 14, height: 36,
  },
  chipText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  chipRemove: { color: '#fff', fontSize: 18, fontWeight: '700', lineHeight: 20 },

  suggestionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  suggestionChip: {
    borderWidth: 1.5, borderColor: '#DDD', backgroundColor: '#FFF',
    borderRadius: 20, paddingHorizontal: 14, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  suggestionChipText: { fontSize: 14, color: '#1A1A1A' },

  ctaContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FAFAFA', padding: 20,
    borderTopWidth: 1, borderTopColor: '#EEEEEE',
  },
  doneBtn: {
    backgroundColor: '#1A1A1A', borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center',
  },
  doneBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});

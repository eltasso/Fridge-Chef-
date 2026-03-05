import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
  TextInput, Modal, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import { Difficulty, DietaryTag, RootStackParamList } from '../types';
import { scanIngredients } from '../services/openai';

type Nav = StackNavigationProp<RootStackParamList, 'Ingredients'>;

// Spanish suggestions mapping: display → internal value (used for matching)
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
];

export default function IngredientsScreen() {
  const navigation = useNavigation<Nav>();
  const { state, addIngredient, removeIngredient, setFilters } = useApp();
  const { t, language } = useTranslation();
  const { isPremium } = useSubscription();
  const [inputValue, setInputValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const SUGGESTIONS = language === 'es' ? SUGGESTIONS_ES : SUGGESTIONS_EN;

  const DIFFICULTIES: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: t('filters.easy') },
    { value: 'medium', label: t('filters.medium') },
    { value: 'hard', label: t('filters.hard') },
  ];

  const TIME_OPTIONS: { value: number; label: string }[] = [
    { value: 15, label: `<15 ${t('common.min')}` },
    { value: 30, label: `<30 ${t('common.min')}` },
    { value: 45, label: `<45 ${t('common.min')}` },
    { value: 60, label: `<60 ${t('common.min')}` },
  ];

  const DIETARY_OPTIONS: { value: DietaryTag; label: string }[] = [
    { value: 'vegetarian', label: t('filters.vegetarian') },
    { value: 'vegan', label: t('filters.vegan') },
    { value: 'gluten-free', label: t('filters.glutenFree') },
    { value: 'dairy-free', label: t('filters.dairyFree') },
  ];

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed.length > 0) {
      addIngredient(trimmed);
      setInputValue('');
    }
  };

  const handleScan = async () => {
    if (!isPremium) {
      (navigation as any).navigate('Paywall');
      return;
    }
    if (Platform.OS === 'web') {
      Alert.alert(t('ingredients.scan'), t('camera.mobileOnly'));
      return;
    }

    try {
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('camera.permissionRequired'), t('camera.permissionMsg'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.[0]?.base64) return;

      setScanning(true);
      const found = await scanIngredients(result.assets[0].base64);
      if (found.length > 0) {
        found.forEach((ing) => addIngredient(ing));
        Alert.alert(t('camera.found'), `${t('camera.foundMsg')} ${found.join(', ')}`);
      } else {
        Alert.alert(t('camera.notFound'), t('camera.notFoundMsg'));
      }
    } catch {
      Alert.alert(t('common.error'), t('camera.error'));
    } finally {
      setScanning(false);
    }
  };

  const toggleDietary = (tag: DietaryTag) => {
    const current = state.filters.dietary;
    const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    setFilters({ dietary: next });
  };

  const toggleDifficulty = (d: Difficulty) => {
    setFilters({ difficulty: state.filters.difficulty === d ? null : d });
  };

  const toggleTime = (t: number) => {
    setFilters({ maxTime: state.filters.maxTime === t ? null : t });
  };

  const activeFilterCount = [
    state.filters.difficulty !== null,
    state.filters.maxTime !== null,
    state.filters.dietary.length > 0,
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterBtn}>
            <Text style={styles.filterIcon}>⚙</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{t('ingredients.title')}</Text>

        {/* Scan / Manual cards */}
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={styles.scanCard}
            onPress={handleScan}
            disabled={scanning}
            activeOpacity={0.8}
          >
            {scanning ? (
              <ActivityIndicator color="#FF6B35" size="small" />
            ) : (
              <Text style={styles.scanEmoji}>📷</Text>
            )}
            <Text style={styles.scanLabel}>
              {scanning ? t('ingredients.scanning') : t('ingredients.scan')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manualCard}
            onPress={() => inputRef.current?.focus()}
            activeOpacity={0.8}
          >
            <Text style={styles.manualEmoji}>✏️</Text>
            <Text style={styles.manualLabel}>{t('ingredients.typeManually')}</Text>
          </TouchableOpacity>
        </View>

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
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Added chips */}
        {state.sessionIngredients.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {state.sessionIngredients.map((ing) => (
              <View key={ing} style={styles.ingChip}>
                <Text style={styles.ingChipText}>{ing}</Text>
                <TouchableOpacity onPress={() => removeIngredient(ing)}>
                  <Text style={styles.ingChipRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Suggestions */}
        <Text style={styles.suggestionsLabel}>{t('ingredients.suggestions')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsRow}>
          {SUGGESTIONS.filter(
            (s) => !state.sessionIngredients.includes(s.value)
          ).map((s) => (
            <TouchableOpacity
              key={s.value}
              style={styles.suggestionChip}
              onPress={() => addIngredient(s.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.suggestionChipText}>{s.display}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Previously used */}
        {state.pantryIngredients.filter((p) => !state.sessionIngredients.includes(p)).length > 0 && (
          <View style={styles.pantrySection}>
            <Text style={styles.suggestionsLabel}>{t('ingredients.previouslyUsed')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* CTA Button */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('RecipeList')}
          activeOpacity={0.85}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>{t('ingredients.cta')}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('filters.title')}</Text>

            <Text style={styles.filterSectionLabel}>{t('filters.difficulty')}</Text>
            <View style={styles.filterRow}>
              {DIFFICULTIES.map((d) => {
                const sel = state.filters.difficulty === d.value;
                return (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.filterPill, sel && styles.filterPillSelected]}
                    onPress={() => toggleDifficulty(d.value)}
                  >
                    <Text style={[styles.filterPillText, sel && styles.filterPillTextSelected]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.filterSectionLabel}>{t('filters.maxTime')}</Text>
            <View style={styles.filterRow}>
              {TIME_OPTIONS.map((opt) => {
                const sel = state.filters.maxTime === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.filterPill, sel && styles.filterPillSelected]}
                    onPress={() => toggleTime(opt.value)}
                  >
                    <Text style={[styles.filterPillText, sel && styles.filterPillTextSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.filterSectionLabel}>{t('filters.dietary')}</Text>
            <View style={styles.filterRow}>
              {DIETARY_OPTIONS.map((d) => {
                const sel = state.filters.dietary.includes(d.value);
                return (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.filterPill, sel && styles.filterPillSelected]}
                    onPress={() => toggleDietary(d.value)}
                  >
                    <Text style={[styles.filterPillText, sel && styles.filterPillTextSelected]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.modalDone} onPress={() => setShowFilters(false)}>
              <Text style={styles.modalDoneText}>{t('filters.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 24, paddingBottom: 100 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: '#1A1A1A', fontWeight: '400' },
  filterBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  filterIcon: { fontSize: 22, color: '#666' },
  filterBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 20 },

  optionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  scanCard: {
    flex: 1, height: 130, borderRadius: 16,
    borderWidth: 2, borderColor: '#FF6B35',
    backgroundColor: 'rgba(255,107,53,0.05)',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  scanEmoji: { fontSize: 32 },
  scanLabel: { fontSize: 14, fontWeight: '600', color: '#FF6B35' },
  manualCard: {
    flex: 1, height: 130, borderRadius: 16,
    borderWidth: 2, borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  manualEmoji: { fontSize: 32 },
  manualLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 12, height: 48,
    paddingHorizontal: 12, marginBottom: 16, gap: 8,
  },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A' },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 26 },

  chipsRow: { marginBottom: 20, flexDirection: 'row' },
  ingChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FF6B35', borderRadius: 20,
    paddingHorizontal: 14, height: 36, marginRight: 8,
  },
  ingChipText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  ingChipRemove: { color: '#fff', fontSize: 16, fontWeight: '700' },

  suggestionsLabel: {
    fontSize: 12, fontWeight: '600', color: '#999', letterSpacing: 1, marginBottom: 10,
  },
  suggestionsRow: { marginBottom: 20, flexDirection: 'row' },
  suggestionChip: {
    borderWidth: 1.5, borderColor: '#DDD', backgroundColor: '#FFF',
    borderRadius: 20, paddingHorizontal: 14, height: 36, marginRight: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  suggestionChipText: { fontSize: 14, color: '#1A1A1A' },

  pantrySection: { marginBottom: 20 },

  ctaContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FAFAFA', padding: 24,
    borderTopWidth: 1, borderTopColor: '#EEEEEE',
  },
  cta: {
    backgroundColor: '#FF6B35', borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#DDD',
    alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 20 },
  filterSectionLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 10 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  filterPill: {
    borderRadius: 20, borderWidth: 1.5, borderColor: '#DDD',
    paddingHorizontal: 16, height: 36, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  filterPillSelected: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  filterPillText: { fontSize: 14, color: '#666', fontWeight: '500' },
  filterPillTextSelected: { color: '#FFF', fontWeight: '600' },
  modalDone: {
    backgroundColor: '#FF6B35', borderRadius: 16, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  modalDoneText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

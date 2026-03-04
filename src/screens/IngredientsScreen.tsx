import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
  TextInput, Modal, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { Difficulty, DietaryTag, RootStackParamList } from '../types';
import { scanIngredients } from '../services/openai';

type Nav = StackNavigationProp<RootStackParamList, 'Ingredients'>;

const SUGGESTIONS = ['Eggs', 'Milk', 'Butter', 'Cheese', 'Bread', 'Pasta', 'Rice', 'Onion', 'Garlic', 'Tomato'];

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const TIME_OPTIONS: { value: number; label: string }[] = [
  { value: 15, label: '<15 min' },
  { value: 30, label: '<30 min' },
  { value: 45, label: '<45 min' },
  { value: 60, label: '<60 min' },
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
  const [showFilters, setShowFilters] = useState(false);
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed.length > 0) {
      addIngredient(trimmed);
      setInputValue('');
    }
  };

  const handleScan = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Camera Scan', 'Camera scan is available on mobile only.');
      return;
    }

    try {
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to scan ingredients.');
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
        Alert.alert('Ingredients Found!', `Added: ${found.join(', ')}`);
      } else {
        Alert.alert('No Ingredients Found', 'Could not identify ingredients. Try a clearer photo.');
      }
    } catch {
      Alert.alert('Error', 'Failed to scan ingredients.');
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

        <Text style={styles.title}>What's in your fridge?</Text>

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
            <Text style={styles.scanLabel}>{scanning ? 'Scanning…' : 'Scan Ingredients'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manualCard}
            onPress={() => inputRef.current?.focus()}
            activeOpacity={0.8}
          >
            <Text style={styles.manualEmoji}>✏️</Text>
            <Text style={styles.manualLabel}>Type Manually</Text>
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
            placeholder="Type an ingredient..."
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
        <Text style={styles.suggestionsLabel}>SUGGESTIONS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsRow}>
          {SUGGESTIONS.filter((s) => !state.sessionIngredients.includes(s.toLowerCase()) && !state.sessionIngredients.map(i => i.toLowerCase()).includes(s.toLowerCase())).map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.suggestionChip}
              onPress={() => addIngredient(s.toLowerCase())}
              activeOpacity={0.8}
            >
              <Text style={styles.suggestionChipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Previously used */}
        {state.pantryIngredients.filter((p) => !state.sessionIngredients.includes(p)).length > 0 && (
          <View style={styles.pantrySection}>
            <Text style={styles.suggestionsLabel}>PREVIOUSLY USED</Text>
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
          <Text style={styles.ctaText}>Search Recipes →</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Filters</Text>

            <Text style={styles.filterSectionLabel}>Difficulty</Text>
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

            <Text style={styles.filterSectionLabel}>Max Time</Text>
            <View style={styles.filterRow}>
              {TIME_OPTIONS.map((t) => {
                const sel = state.filters.maxTime === t.value;
                return (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.filterPill, sel && styles.filterPillSelected]}
                    onPress={() => toggleTime(t.value)}
                  >
                    <Text style={[styles.filterPillText, sel && styles.filterPillTextSelected]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.filterSectionLabel}>Dietary</Text>
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
              <Text style={styles.modalDoneText}>Done</Text>
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

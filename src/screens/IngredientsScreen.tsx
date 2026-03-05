import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
  Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useHideTabBar } from '../hooks/useHideTabBar';
import { RootStackParamList } from '../types';
import { scanIngredients } from '../services/openai';

type Nav = StackNavigationProp<RootStackParamList, 'Ingredients'>;

export default function IngredientsScreen() {
  const navigation = useNavigation<Nav>();
  const { state, addIngredient, removeIngredient } = useApp();
  const { t } = useTranslation();
  const { isPremium } = useSubscription();
  const [scanning, setScanning] = useState(false);

  // Hide tab bar until onboarding is completed
  const onboardingDone = state.onboardingCompleted;
  useHideTabBar();

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
      const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 });
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

  const hasIngredients = state.sessionIngredients.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('ingredients.title')}</Text>
          <Text style={styles.subtitle}>{t('ingredients.subtitle')}</Text>
        </View>

        {/* Camera — hero card */}
        <TouchableOpacity
          style={styles.cameraCard}
          onPress={handleScan}
          disabled={scanning}
          activeOpacity={0.85}
        >
          <View style={styles.cameraInner}>
            {scanning ? (
              <ActivityIndicator color="#FF6B35" size="large" />
            ) : (
              <Text style={styles.cameraEmoji}>📷</Text>
            )}
            <Text style={styles.cameraTitle}>
              {scanning ? t('ingredients.scanning') : t('ingredients.scan')}
            </Text>
            <Text style={styles.cameraSub}>{t('ingredients.scanSub')}</Text>
          </View>
        </TouchableOpacity>

        {/* Added ingredients chips */}
        {hasIngredients && (
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

        {/* Write manually — secondary */}
        <TouchableOpacity
          style={styles.manualBtn}
          onPress={() => navigation.navigate('ManualIngredients')}
          activeOpacity={0.8}
        >
          <Text style={styles.manualEmoji}>✏️</Text>
          <View style={styles.manualTextWrap}>
            <Text style={styles.manualTitle}>{t('ingredients.typeManually')}</Text>
            <Text style={styles.manualDesc}>{t('ingredients.typeManuallyDesc')}</Text>
          </View>
          <Text style={styles.manualArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          onPress={() => {
            if (onboardingDone) {
              navigation.navigate('RecipeList');
            } else {
              navigation.navigate('MealStep');
            }
          }}
          activeOpacity={0.85}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>
            {onboardingDone ? t('ingredients.ctaDirect') : t('ingredients.cta')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 24, paddingBottom: 110 },

  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#999' },

  cameraCard: {
    borderRadius: 24, borderWidth: 2.5, borderColor: '#FF6B35',
    backgroundColor: 'rgba(255,107,53,0.04)',
    marginBottom: 20, overflow: 'hidden',
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  cameraInner: {
    paddingVertical: 48, alignItems: 'center', gap: 10,
  },
  cameraEmoji: { fontSize: 56 },
  cameraTitle: { fontSize: 20, fontWeight: '800', color: '#FF6B35' },
  cameraSub: { fontSize: 14, color: '#FF6B35', opacity: 0.7 },

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

  manualBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 18,
    borderWidth: 1.5, borderColor: '#EEEEEE',
    padding: 18, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  manualEmoji: { fontSize: 26 },
  manualTextWrap: { flex: 1 },
  manualTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  manualDesc: { fontSize: 13, color: '#999', marginTop: 2 },
  manualArrow: { fontSize: 24, color: '#CCC', fontWeight: '300' },

  ctaContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FAFAFA', padding: 20,
    borderTopWidth: 1, borderTopColor: '#EEEEEE',
  },
  cta: {
    backgroundColor: '#FF6B35', borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});

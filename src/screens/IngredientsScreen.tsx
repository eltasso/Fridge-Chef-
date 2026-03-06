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

        {/* Action cards — side by side */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionCard, styles.actionCardPrimary]}
            onPress={handleScan}
            disabled={scanning}
            activeOpacity={0.85}
          >
            {scanning ? (
              <ActivityIndicator color="#FF6B35" size="small" />
            ) : (
              <Text style={styles.actionEmoji}>📷</Text>
            )}
            <Text style={styles.actionTitlePrimary}>
              {scanning ? t('ingredients.scanning') : t('ingredients.scan')}
            </Text>
            <Text style={styles.actionSubPrimary}>{t('ingredients.scanSub')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.actionCardSecondary]}
            onPress={() => navigation.navigate('ManualIngredients')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionEmoji}>✏️</Text>
            <Text style={styles.actionTitleSecondary}>{t('ingredients.typeManually')}</Text>
            <Text style={styles.actionSubSecondary}>{t('ingredients.typeManuallyDesc')}</Text>
          </TouchableOpacity>
        </View>

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

  actionRow: {
    flexDirection: 'row', gap: 12, marginBottom: 20,
  },
  actionCard: {
    flex: 1, borderRadius: 20, padding: 18,
    alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  actionCardPrimary: {
    borderWidth: 2, borderColor: '#FF6B35',
    backgroundColor: 'rgba(255,107,53,0.05)',
  },
  actionCardSecondary: {
    backgroundColor: '#FFF',
    borderWidth: 1.5, borderColor: '#EEEEEE',
  },
  actionEmoji: { fontSize: 32 },
  actionTitlePrimary: { fontSize: 14, fontWeight: '800', color: '#FF6B35', textAlign: 'center' },
  actionSubPrimary: { fontSize: 11, color: '#FF6B35', opacity: 0.7, textAlign: 'center' },
  actionTitleSecondary: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  actionSubSecondary: { fontSize: 11, color: '#999', textAlign: 'center' },

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

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useHideTabBar } from '../hooks/useHideTabBar';
import { PackageId } from '../services/subscriptions';
import { RootStackParamList } from '../types';

type Nav = StackNavigationProp<RootStackParamList, 'Paywall'>;
type RouteType = RouteProp<RootStackParamList, 'Paywall'>;

export default function PaywallScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const fromOnboarding = route.params?.fromOnboarding ?? false;
  const { t } = useTranslation();
  const { purchase, restore } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  useHideTabBar();

  const freeFeatures = [t('paywall.free1'), t('paywall.free2'), t('paywall.free3')];
  const premiumFeatures = [
    t('paywall.premium1'), t('paywall.premium2'), t('paywall.premium3'),
    t('paywall.premium4'), t('paywall.premium5'),
  ];

  const navigateAfter = () => {
    if (fromOnboarding) {
      navigation.navigate('RecipeList');
    } else {
      navigation.goBack();
    }
  };

  const handlePurchaseAnnual = async () => {
    setLoading(true);
    const success = await purchase('annual' as PackageId);
    setLoading(false);
    if (success) navigateAfter();
  };

  const handlePurchaseWeekly = async () => {
    setLoading(true);
    const success = await purchase('monthly' as PackageId);
    setLoading(false);
    if (success) navigateAfter();
  };

  const handleRestore = async () => {
    setRestoring(true);
    const success = await restore();
    setRestoring(false);
    if (success) navigateAfter();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.closeBtn} onPress={navigateAfter} activeOpacity={0.7}>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>👨‍🍳</Text>
          <Text style={styles.heroTitle}>{t('paywall.title')}</Text>
          <Text style={styles.heroSubtitle}>{t('paywall.subtitle')}</Text>
        </View>

        {/* Feature table */}
        <View style={styles.featureCard}>
          <View style={styles.featureHeaderRow}>
            <Text style={[styles.featureColHeader, { flex: 1 }]}>{t('paywall.colFeature')}</Text>
            <Text style={[styles.featureColHeader, styles.featureColCenter]}>{t('paywall.colFree')}</Text>
            <Text style={[styles.featureColHeader, styles.featureColCenter, styles.featureColPremiumHeader]}>
              {t('paywall.colPremium')}
            </Text>
          </View>
          {freeFeatures.map((label, i) => (
            <View key={`free-${i}`} style={[styles.featureRow, i % 2 === 1 && styles.featureRowAlt]}>
              <Text style={styles.featureName}>{label}</Text>
              <Text style={styles.featureCheck}>✅</Text>
              <Text style={styles.featureCheck}>✅</Text>
            </View>
          ))}
          {premiumFeatures.map((label, i) => (
            <View
              key={`premium-${i}`}
              style={[styles.featureRow, (i + freeFeatures.length) % 2 === 1 && styles.featureRowAlt]}
            >
              <Text style={styles.featureName}>{label}</Text>
              <Text style={styles.featureCheck}>🔒</Text>
              <Text style={styles.featureCheck}>✅</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        <Text style={styles.pricingTitle}>{t('paywall.choosePlan')}</Text>
        <View style={styles.pricingRow}>
          <View style={styles.weeklyCard}>
            <Text style={styles.planLabel}>{t('paywall.weekly')}</Text>
            <Text style={styles.planPrice}>{t('paywall.priceWeekly')}</Text>
            <Text style={styles.planSub}>{t('paywall.weeklyBilled')}</Text>
          </View>
          <View style={styles.annualCard}>
            <View style={styles.badgeRow}>
              <View style={styles.freeBadge}>
                <Text style={styles.badgeText}>{t('paywall.annualFree')}</Text>
              </View>
              <View style={styles.savingsBadge}>
                <Text style={styles.badgeText}>{t('paywall.savings')}</Text>
              </View>
            </View>
            <Text style={[styles.planLabel, { color: '#FF6B35' }]}>{t('paywall.annual')}</Text>
            <Text style={[styles.planPrice, { fontSize: 22 }]}>{t('paywall.priceAnnual')}</Text>
            <Text style={styles.planSub}>{t('paywall.perMonth')}</Text>
          </View>
        </View>

        {/* CTA annual */}
        <TouchableOpacity
          style={styles.ctaPrimary}
          onPress={handlePurchaseAnnual}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.ctaPrimaryText}>{t('paywall.ctaAnnual')}</Text>
          )}
        </TouchableOpacity>

        {/* CTA weekly */}
        <TouchableOpacity
          style={styles.ctaSecondary}
          onPress={handlePurchaseWeekly}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaSecondaryText}>{t('paywall.ctaWeekly')}</Text>
        </TouchableOpacity>

        <Text style={styles.renewalNote}>{t('paywall.renewalNote')}</Text>

        <TouchableOpacity onPress={handleRestore} disabled={restoring} style={styles.restoreBtn} activeOpacity={0.7}>
          {restoring ? (
            <ActivityIndicator color="#888" size="small" />
          ) : (
            <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={navigateAfter} style={styles.freeBtn} activeOpacity={0.7}>
          <Text style={styles.freeText}>{t('paywall.ctaFree')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0D' },

  closeBtn: {
    position: 'absolute', top: 16, right: 16, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: { fontSize: 15, color: '#FFF', fontWeight: '600' },

  scroll: { padding: 24, paddingTop: 48, paddingBottom: 48 },

  hero: { alignItems: 'center', marginBottom: 32 },
  heroEmoji: { fontSize: 64, marginBottom: 16 },
  heroTitle: {
    fontSize: 26, fontWeight: '800', color: '#FFFFFF',
    textAlign: 'center', marginBottom: 8, letterSpacing: -0.5,
  },
  heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },

  featureCard: {
    backgroundColor: '#1C1C1E', borderRadius: 20,
    overflow: 'hidden', marginBottom: 28,
  },
  featureHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#2C2C2E',
    borderBottomWidth: 1, borderBottomColor: '#3A3A3C',
  },
  featureColHeader: { fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5 },
  featureColCenter: { width: 60, textAlign: 'center' },
  featureColPremiumHeader: { color: '#FF6B35' },
  featureRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#2C2C2E',
  },
  featureRowAlt: { backgroundColor: '#1A1A1C' },
  featureName: { flex: 1, fontSize: 14, color: '#EBEBF5', fontWeight: '500' },
  featureCheck: { width: 60, textAlign: 'center', fontSize: 16 },

  pricingTitle: { fontSize: 17, fontWeight: '700', color: '#FFF', marginBottom: 14 },
  pricingRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },

  weeklyCard: {
    flex: 1, borderRadius: 18, borderWidth: 1.5, borderColor: '#3A3A3C',
    padding: 16, alignItems: 'center', backgroundColor: '#1C1C1E',
    justifyContent: 'center', minHeight: 110,
  },
  annualCard: {
    flex: 1.3, borderRadius: 18, borderWidth: 2, borderColor: '#FF6B35',
    padding: 16, alignItems: 'center',
    backgroundColor: 'rgba(255,107,53,0.08)',
    justifyContent: 'center', minHeight: 110,
  },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  freeBadge: {
    backgroundColor: '#4ECDC4', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  savingsBadge: {
    backgroundColor: '#FF6B35', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  planLabel: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 4 },
  planPrice: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  planSub: { fontSize: 11, color: '#666', marginTop: 3 },

  ctaPrimary: {
    backgroundColor: '#FF6B35', borderRadius: 18, height: 58,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  ctaPrimaryText: { color: '#FFF', fontSize: 17, fontWeight: '800' },

  ctaSecondary: {
    borderWidth: 2, borderColor: '#4ECDC4', borderRadius: 18, height: 52,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  ctaSecondaryText: { color: '#4ECDC4', fontSize: 16, fontWeight: '700' },

  renewalNote: { fontSize: 12, color: '#555', textAlign: 'center', marginBottom: 16 },

  restoreBtn: { alignItems: 'center', paddingVertical: 10 },
  restoreText: {
    fontSize: 14, color: '#555',
    textDecorationLine: 'underline', textDecorationColor: '#444',
  },

  freeBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  freeText: { fontSize: 13, color: '#444' },
});

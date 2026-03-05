import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
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

  const freeFeatures = [
    t('paywall.free1'),
    t('paywall.free2'),
    t('paywall.free3'),
  ];

  const premiumFeatures = [
    t('paywall.premium1'),
    t('paywall.premium2'),
    t('paywall.premium3'),
    t('paywall.premium4'),
    t('paywall.premium5'),
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

  const handleContinueFree = () => {
    navigateAfter();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Close button */}
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

        {/* Feature comparison table */}
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

        {/* Plan cards */}
        <Text style={styles.pricingTitle}>{t('paywall.choosePlan')}</Text>
        <View style={styles.pricingRow}>
          {/* Weekly */}
          <View style={styles.weeklyCard}>
            <Text style={styles.priceLabel}>{t('paywall.weekly')}</Text>
            <Text style={styles.priceAmount}>{t('paywall.priceWeekly')}</Text>
            <Text style={styles.priceBilled}>{t('paywall.weeklyBilled')}</Text>
          </View>

          {/* Annual — highlighted */}
          <View style={styles.annualCard}>
            <View style={styles.badgeRow}>
              <View style={styles.freeBadge}>
                <Text style={styles.badgeText}>{t('paywall.annualFree')}</Text>
              </View>
              <View style={styles.savingsBadge}>
                <Text style={styles.badgeText}>{t('paywall.savings')}</Text>
              </View>
            </View>
            <Text style={[styles.priceLabel, { color: '#FF6B35' }]}>{t('paywall.annual')}</Text>
            <Text style={[styles.priceAmount, { fontSize: 22 }]}>{t('paywall.priceAnnual')}</Text>
            <Text style={styles.priceBilled}>{t('paywall.perMonth')}</Text>
          </View>
        </View>

        {/* CTA — Annual (primary) */}
        <TouchableOpacity
          style={styles.ctaBtnPrimary}
          onPress={handlePurchaseAnnual}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.ctaTextPrimary}>{t('paywall.ctaAnnual')}</Text>
          )}
        </TouchableOpacity>

        {/* CTA — Weekly (secondary) */}
        <TouchableOpacity
          style={styles.ctaBtnSecondary}
          onPress={handlePurchaseWeekly}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaTextSecondary}>{t('paywall.ctaWeekly')}</Text>
        </TouchableOpacity>

        <Text style={styles.renewalNote}>{t('paywall.renewalNote')}</Text>

        {/* Restore */}
        <TouchableOpacity onPress={handleRestore} disabled={restoring} style={styles.restoreBtn} activeOpacity={0.7}>
          {restoring ? (
            <ActivityIndicator color="#999" size="small" />
          ) : (
            <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
          )}
        </TouchableOpacity>

        {/* Free option */}
        <TouchableOpacity onPress={handleContinueFree} style={styles.freeBtn} activeOpacity={0.7}>
          <Text style={styles.freeText}>{t('paywall.ctaFree')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },

  closeBtn: {
    position: 'absolute', top: 16, right: 16, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: { fontSize: 15, color: '#666', fontWeight: '600' },

  scroll: { padding: 24, paddingTop: 48, paddingBottom: 40 },

  hero: { alignItems: 'center', marginBottom: 32 },
  heroEmoji: { fontSize: 64, marginBottom: 16 },
  heroTitle: {
    fontSize: 26, fontWeight: '800', color: '#1A1A1A',
    textAlign: 'center', marginBottom: 8, letterSpacing: -0.5,
  },
  heroSubtitle: { fontSize: 15, color: '#999', textAlign: 'center' },

  featureCard: {
    backgroundColor: '#FFF', borderRadius: 20,
    overflow: 'hidden', marginBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  featureHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1, borderBottomColor: '#EEEEEE',
  },
  featureColHeader: { fontSize: 10, fontWeight: '700', color: '#999', letterSpacing: 0.5 },
  featureColCenter: { width: 60, textAlign: 'center' },
  featureColPremiumHeader: { color: '#FF6B35' },
  featureRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  featureRowAlt: { backgroundColor: '#FAFAFA' },
  featureName: { flex: 1, fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  featureCheck: { width: 60, textAlign: 'center', fontSize: 16 },

  pricingTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 14 },
  pricingRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },

  weeklyCard: {
    flex: 1, borderRadius: 18, borderWidth: 2, borderColor: '#E0E0E0',
    padding: 16, alignItems: 'center', backgroundColor: '#FFF', minHeight: 110,
    justifyContent: 'center',
  },
  annualCard: {
    flex: 1.3, borderRadius: 18, borderWidth: 2.5, borderColor: '#FF6B35',
    padding: 16, alignItems: 'center', backgroundColor: 'rgba(255,107,53,0.04)',
    minHeight: 110, justifyContent: 'center',
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
  priceLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 4 },
  priceAmount: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  priceBilled: { fontSize: 11, color: '#999', marginTop: 3 },

  ctaBtnPrimary: {
    backgroundColor: '#FF6B35', borderRadius: 18, height: 58,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  ctaTextPrimary: { color: '#FFF', fontSize: 17, fontWeight: '800' },

  ctaBtnSecondary: {
    borderWidth: 2, borderColor: '#4ECDC4', borderRadius: 18, height: 52,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    backgroundColor: '#FFF',
  },
  ctaTextSecondary: { color: '#4ECDC4', fontSize: 16, fontWeight: '700' },

  renewalNote: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 16 },

  restoreBtn: { alignItems: 'center', paddingVertical: 10 },
  restoreText: {
    fontSize: 14, color: '#999',
    textDecorationLine: 'underline', textDecorationColor: '#CCC',
  },

  freeBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  freeText: { fontSize: 13, color: '#BBBBBB' },
});

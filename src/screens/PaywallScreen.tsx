import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import { PackageId } from '../services/subscriptions';

export default function PaywallScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { purchase, restore } = useSubscription();
  const [selectedPkgId, setSelectedPkgId] = useState<PackageId>('annual');
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

  const handlePurchase = async () => {
    setLoading(true);
    const success = await purchase(selectedPkgId);
    setLoading(false);
    if (success) navigation.goBack();
  };

  const handleRestore = async () => {
    setRestoring(true);
    const success = await restore();
    setRestoring(false);
    if (success) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
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
          {/* Header row */}
          <View style={styles.featureHeaderRow}>
            <Text style={[styles.featureColHeader, { flex: 1 }]}>{t('paywall.colFeature')}</Text>
            <Text style={[styles.featureColHeader, styles.featureColCenter]}>{t('paywall.colFree')}</Text>
            <Text style={[styles.featureColHeader, styles.featureColCenter, styles.featureColPremiumHeader]}>
              {t('paywall.colPremium')}
            </Text>
          </View>

          {/* Free features — both columns ✅ */}
          {freeFeatures.map((label, i) => (
            <View key={`free-${i}`} style={[styles.featureRow, i % 2 === 1 && styles.featureRowAlt]}>
              <Text style={styles.featureName}>{label}</Text>
              <Text style={styles.featureCheck}>✅</Text>
              <Text style={styles.featureCheck}>✅</Text>
            </View>
          ))}

          {/* Premium features — free column 🔒, premium ✅ */}
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

        {/* Plan picker */}
        <Text style={styles.pricingTitle}>{t('paywall.choosePlan')}</Text>
        <View style={styles.pricingRow}>
          {/* Monthly */}
          <TouchableOpacity
            style={[styles.priceCard, selectedPkgId === 'monthly' && styles.priceCardSelected]}
            onPress={() => setSelectedPkgId('monthly')}
            activeOpacity={0.8}
          >
            <Text style={styles.priceLabel}>{t('paywall.monthly')}</Text>
            <Text style={styles.priceAmount}>{t('paywall.priceMonthly')}</Text>
          </TouchableOpacity>

          {/* Annual (recommended) */}
          <TouchableOpacity
            style={[styles.priceCard, styles.priceCardAnnual, selectedPkgId === 'annual' && styles.priceCardSelected]}
            onPress={() => setSelectedPkgId('annual')}
            activeOpacity={0.8}
          >
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>{t('paywall.savings')}</Text>
            </View>
            <Text style={styles.priceLabel}>{t('paywall.annual')}</Text>
            <Text style={styles.priceAmount}>{t('paywall.priceAnnual')}</Text>
            <Text style={styles.perMonth}>{t('paywall.perMonth')}</Text>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={handlePurchase}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.ctaText}>{t('paywall.cta')}</Text>
          )}
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

  // Hero
  hero: { alignItems: 'center', marginBottom: 32 },
  heroEmoji: { fontSize: 64, marginBottom: 16 },
  heroTitle: {
    fontSize: 26, fontWeight: '800', color: '#1A1A1A',
    textAlign: 'center', marginBottom: 8, letterSpacing: -0.5,
  },
  heroSubtitle: { fontSize: 15, color: '#999', textAlign: 'center' },

  // Feature table
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
  featureColHeader: {
    fontSize: 10, fontWeight: '700', color: '#999', letterSpacing: 0.5,
  },
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

  // Pricing
  pricingTitle: {
    fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 14,
  },
  pricingRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },

  priceCard: {
    flex: 1, borderRadius: 18, borderWidth: 2, borderColor: '#E0E0E0',
    padding: 16, alignItems: 'center', backgroundColor: '#FFF',
    minHeight: 110,
  },
  priceCardSelected: { borderColor: '#FF6B35', backgroundColor: 'rgba(255,107,53,0.04)' },
  priceCardAnnual: { position: 'relative' },

  savingsBadge: {
    backgroundColor: '#4ECDC4', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8,
  },
  savingsText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },

  priceLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 6 },
  priceAmount: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  perMonth: { fontSize: 12, color: '#999', marginTop: 4 },

  // CTA
  ctaBtn: {
    backgroundColor: '#FF6B35', borderRadius: 18, height: 58,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  ctaText: { color: '#FFF', fontSize: 17, fontWeight: '800' },

  renewalNote: {
    fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20,
  },

  restoreBtn: { alignItems: 'center', paddingVertical: 12 },
  restoreText: {
    fontSize: 14, color: '#999',
    textDecorationLine: 'underline', textDecorationColor: '#CCC',
  },
});

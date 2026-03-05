import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTranslation, useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { useSubscription } from '../context/SubscriptionContext';

const APP_VERSION = '1.0.0';

export default function ProfileScreen() {
  const { user, signOut, deleteAccount } = useAuth();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { state } = useApp();
  const { isPremium } = useSubscription();
  const navigation = useNavigation<any>();

  const favCount = state.favorites.length;
  const shopCount = state.shoppingList.filter((i) => !i.checked).length;

  const displayName = user?.displayName ?? t('profile.guest');
  const displayEmail = user?.email ?? t('profile.guestEmail');
  const isGuest = user?.isGuest ?? true;

  const handleSignOut = () => {
    Alert.alert(
      t('profile.signOutTitle'),
      t('profile.signOutMsg'),
      [
        { text: t('shopping.cancel'), style: 'cancel' },
        {
          text: t('profile.signOutConfirm'),
          style: 'destructive',
          onPress: () => signOut(),
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.deleteTitle'),
      t('profile.deleteMsg'),
      [
        { text: t('shopping.cancel'), style: 'cancel' },
        {
          text: t('profile.deleteConfirm'),
          style: 'destructive',
          onPress: () => deleteAccount(),
        },
      ],
    );
  };

  const handlePrivacy = () => navigation.navigate('PrivacyPolicy');
  const handleTerms = () => navigation.navigate('Terms');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.screenTitle}>{t('profile.title')}</Text>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>{isGuest ? '👤' : '👨‍🍳'}</Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
            {isGuest && (
              <View style={styles.guestBadge}>
                <Text style={styles.guestBadgeText}>{t('profile.guest')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Premium section */}
        {isPremium ? (
          <View style={styles.premiumBadgeCard}>
            <Text style={styles.premiumBadgeIcon}>✨</Text>
            <View>
              <Text style={styles.premiumBadgeTitle}>{t('subscription.premium')}</Text>
              <Text style={styles.premiumBadgeStatus}>{t('subscription.premiumActive')}</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.upgradeCard}
            onPress={() => navigation.navigate('Paywall')}
            activeOpacity={0.85}
          >
            <View style={styles.upgradeLeft}>
              <Text style={styles.upgradeTitle}>{t('subscription.upgrade')}</Text>
              <Text style={styles.upgradeSubtitle}>{t('subscription.upgradeSubtitle')}</Text>
            </View>
            <Text style={styles.upgradeArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.preferences')}</Text>
          <View style={styles.card}>
            <Text style={styles.rowLabel}>{t('profile.language')}</Text>
            <View style={styles.langToggle}>
              <TouchableOpacity
                onPress={() => setLanguage('es')}
                style={[styles.langPill, language === 'es' && styles.langPillActive]}
              >
                <Text style={[styles.langPillText, language === 'es' && styles.langPillTextActive]}>
                  Español
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLanguage('en')}
                style={[styles.langPill, language === 'en' && styles.langPillActive]}
              >
                <Text style={[styles.langPillText, language === 'en' && styles.langPillTextActive]}>
                  English
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats shortcuts */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardOrange]}>
              <Text style={styles.statEmoji}>♥</Text>
              <Text style={styles.statCount}>{favCount}</Text>
              <Text style={styles.statLabel}>{t('profile.favorites')}</Text>
            </View>
            <View style={[styles.statCard, styles.statCardTeal]}>
              <Text style={styles.statEmoji}>🛒</Text>
              <Text style={styles.statCount}>{shopCount}</Text>
              <Text style={styles.statLabel}>{t('profile.shopping')}</Text>
            </View>
          </View>
        </View>

        {/* Account links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.account')}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow} onPress={handlePrivacy} activeOpacity={0.7}>
              <Text style={styles.linkIcon}>🔒</Text>
              <Text style={styles.linkLabel}>{t('profile.privacy')}</Text>
              <Text style={styles.linkChevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity style={styles.linkRow} onPress={handleTerms} activeOpacity={0.7}>
              <Text style={styles.linkIcon}>📄</Text>
              <Text style={styles.linkLabel}>{t('profile.terms')}</Text>
              <Text style={styles.linkChevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
          </TouchableOpacity>

          {!isGuest && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteBtnText}>{t('profile.deleteAccount')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Version */}
        <Text style={styles.version}>{t('profile.version')} {APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 24, paddingBottom: 48 },

  screenTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 24,
  },

  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF0EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 64, height: 64, borderRadius: 32 },
  avatarEmoji: { fontSize: 32 },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  userEmail: { fontSize: 14, color: '#999', marginBottom: 6 },
  guestBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  guestBadgeText: { fontSize: 11, color: '#999', fontWeight: '600' },

  // Sections
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  // Generic card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 12, paddingTop: 16 },
  rowDivider: { height: 1, backgroundColor: '#F5F5F5' },

  // Language toggle inside card
  langToggle: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  langPill: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DDD',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#FFF',
  },
  langPillActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  langPillText: { fontSize: 14, color: '#666', fontWeight: '500' },
  langPillTextActive: { color: '#FFF', fontWeight: '700' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  statCardOrange: { backgroundColor: '#FFF0EB' },
  statCardTeal: { backgroundColor: '#E8F8F7' },
  statEmoji: { fontSize: 28, marginBottom: 4 },
  statCount: { fontSize: 28, fontWeight: '800', color: '#1A1A1A' },
  statLabel: { fontSize: 12, color: '#666', fontWeight: '600', textAlign: 'center' },

  // Link rows
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  linkIcon: { fontSize: 18 },
  linkLabel: { flex: 1, fontSize: 15, color: '#1A1A1A', fontWeight: '500' },
  linkChevron: { fontSize: 20, color: '#CCC', fontWeight: '300' },

  // Buttons
  signOutBtn: {
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  signOutText: { color: '#FF6B35', fontSize: 16, fontWeight: '700' },

  deleteBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { color: '#E85D4C', fontSize: 15, fontWeight: '600' },

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#CCC',
    marginTop: 8,
  },

  // Premium section
  upgradeCard: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeLeft: { flex: 1 },
  upgradeTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 2 },
  upgradeSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  upgradeArrow: { fontSize: 28, color: '#FFF', fontWeight: '300' },

  premiumBadgeCard: {
    backgroundColor: '#FFF0EB',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  premiumBadgeIcon: { fontSize: 32 },
  premiumBadgeTitle: { fontSize: 18, fontWeight: '800', color: '#FF6B35' },
  premiumBadgeStatus: { fontSize: 13, color: '#FF9066', marginTop: 2 },
});

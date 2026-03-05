import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, StatusBar as RNStatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTranslation, useLanguage } from '../context/LanguageContext';

const FOOD_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80';

export default function WelcomeScreen() {
  const { signInWithAppleFn, signInWithGoogleFn, continueAsGuest } = useAuth();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const navigation = useNavigation<any>();

  // Slow Ken-Burns zoom animation
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.08, duration: 14000, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 14000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleApple = () =>
    signInWithAppleFn(t('welcome.comingSoon'), t('welcome.comingSoonMsg'));
  const handleGoogle = () =>
    signInWithGoogleFn(t('welcome.comingSoon'), t('welcome.comingSoonMsg'));

  return (
    <View style={styles.root}>
      <RNStatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Animated food background */}
      <View style={StyleSheet.absoluteFill}>
        <Animated.Image
          source={{ uri: FOOD_IMAGE }}
          style={[StyleSheet.absoluteFill, { transform: [{ scale: scaleAnim }] }]}
          resizeMode="cover"
        />
        {/* Dark overlay */}
        <View style={styles.overlay} />
      </View>

      {/* Language selector */}
      <View style={styles.langRow}>
        <Text style={styles.langLabel}>{t('welcome.language')}</Text>
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

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>👨‍🍳</Text>
        <Text style={styles.appName}>FridgeChef</Text>
        <Text style={styles.tagline}>{t('welcome.tagline')}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsArea}>
        <TouchableOpacity style={styles.appleBtn} onPress={handleApple} activeOpacity={0.85}>
          <Text style={styles.appleBtnText}>{t('welcome.continueApple')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.85}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleBtnText}>{t('welcome.continueGoogle')}</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity onPress={continueAsGuest} activeOpacity={0.7} style={styles.guestBtn}>
          <Text style={styles.guestText}>{t('welcome.continueGuest')}</Text>
        </TouchableOpacity>

        <Text style={styles.acceptText}>
          {t('legal.acceptPrefix')}
          <Text style={styles.acceptLink} onPress={() => navigation.navigate('PrivacyPolicy')}>
            {t('legal.acceptPrivacy')}
          </Text>
          {t('legal.acceptMid')}
          <Text style={styles.acceptLink} onPress={() => navigation.navigate('Terms')}>
            {t('legal.acceptTerms')}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },

  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: Platform.OS === 'android' ? 44 : 56,
    paddingHorizontal: 24,
    gap: 6,
    zIndex: 10,
  },
  langLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  langPill: {
    borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 12, paddingVertical: 5,
  },
  langPillActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  langPillText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  langPillTextActive: { color: '#FFF', fontWeight: '700' },

  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
    zIndex: 10,
  },
  heroEmoji: { fontSize: 90, marginBottom: 20 },
  appName: {
    fontSize: 48, fontWeight: '900', color: '#FFFFFF',
    letterSpacing: -1, marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 18, color: 'rgba(255,255,255,0.75)',
    fontWeight: '400', letterSpacing: 0.3,
  },

  buttonsArea: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
    zIndex: 10,
  },

  appleBtn: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 16, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  appleBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },

  googleBtn: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  googleIcon: { fontSize: 20, fontWeight: '900', color: '#4285F4' },
  googleBtnText: { color: '#1A1A1A', fontSize: 17, fontWeight: '600' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 2 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  dividerText: { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },

  guestBtn: { height: 44, alignItems: 'center', justifyContent: 'center' },
  guestText: {
    fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '500',
    textDecorationLine: 'underline', textDecorationColor: 'rgba(255,255,255,0.3)',
  },

  acceptText: {
    fontSize: 12, color: 'rgba(255,255,255,0.4)',
    textAlign: 'center', lineHeight: 18, paddingHorizontal: 8,
  },
  acceptLink: { color: 'rgba(255,255,255,0.6)', textDecorationLine: 'underline' },
});

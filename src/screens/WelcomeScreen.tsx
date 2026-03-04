import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTranslation, useLanguage } from '../context/LanguageContext';

export default function WelcomeScreen() {
  const { signInWithAppleFn, signInWithGoogleFn, continueAsGuest } = useAuth();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const handleApple = () =>
    signInWithAppleFn(t('welcome.comingSoon'), t('welcome.comingSoonMsg'));

  const handleGoogle = () =>
    signInWithGoogleFn(t('welcome.comingSoon'), t('welcome.comingSoonMsg'));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Language selector — top right */}
      <View style={styles.langRow}>
        <Text style={styles.langLabel}>{t('welcome.language')}  </Text>
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

      {/* Decorative ingredient pills */}
      <View style={styles.pillsDecor}>
        {['🥚', '🧀', '🥕', '🍅', '🧄', '🥦'].map((emoji, i) => (
          <View key={i} style={styles.decorPill}>
            <Text style={styles.decorEmoji}>{emoji}</Text>
          </View>
        ))}
      </View>

      {/* Auth buttons */}
      <View style={styles.buttonsArea}>
        {/* Apple */}
        <TouchableOpacity
          style={styles.appleBtn}
          onPress={handleApple}
          activeOpacity={0.85}
        >
          <Text style={styles.appleBtnIcon}>  </Text>
          <Text style={styles.appleBtnText}>{t('welcome.continueApple')}</Text>
        </TouchableOpacity>

        {/* Google */}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogle}
          activeOpacity={0.85}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleBtnText}>{t('welcome.continueGoogle')}</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Guest */}
        <TouchableOpacity
          onPress={continueAsGuest}
          activeOpacity={0.7}
          style={styles.guestBtn}
        >
          <Text style={styles.guestText}>{t('welcome.continueGuest')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 24,
  },

  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 8,
    gap: 6,
  },
  langLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  langPill: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DDD',
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#FFF',
  },
  langPillActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  langPillText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  langPillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },

  hero: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 36,
  },
  heroEmoji: {
    fontSize: 88,
    marginBottom: 16,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -1,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: '#999',
    fontWeight: '400',
    letterSpacing: 0.2,
  },

  pillsDecor: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 48,
  },
  decorPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  decorEmoji: {
    fontSize: 22,
  },

  buttonsArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
    gap: 12,
  },

  appleBtn: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  appleBtnIcon: {
    fontSize: 22,
    color: '#FFF',
  },
  appleBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },

  googleBtn: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleBtnText: {
    color: '#1A1A1A',
    fontSize: 17,
    fontWeight: '600',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  dividerText: {
    fontSize: 14,
    color: '#BBB',
    fontWeight: '500',
  },

  guestBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
    textDecorationLine: 'underline',
    textDecorationColor: '#CCC',
  },
});

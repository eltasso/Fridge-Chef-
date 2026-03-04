/**
 * Authentication Service
 *
 * Current state: STUB implementation.
 * Apple and Google sign-in show "Coming soon" until Firebase native build is configured.
 * Guest mode is fully functional.
 *
 * When @react-native-firebase is properly configured with a native build:
 *   import auth from '@react-native-firebase/auth';
 *   import { GoogleSignin } from '@react-native-google-signin/google-signin';
 *   import appleAuth from '@invertase/react-native-apple-authentication';
 */

import { Alert } from 'react-native';

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isGuest: boolean;
}

/**
 * Sign in with Apple.
 * TODO: Implement with @react-native-firebase/auth + expo-apple-authentication
 *       once a native development build is set up.
 */
export async function signInWithApple(
  comingSoonTitle: string,
  comingSoonMsg: string,
): Promise<AuthUser | null> {
  Alert.alert(comingSoonTitle, comingSoonMsg);
  return null;
}

/**
 * Sign in with Google.
 * TODO: Implement with @react-native-firebase/auth + @react-native-google-signin/google-signin
 *       once a native development build is set up.
 */
export async function signInWithGoogle(
  comingSoonTitle: string,
  comingSoonMsg: string,
): Promise<AuthUser | null> {
  Alert.alert(comingSoonTitle, comingSoonMsg);
  return null;
}

/** Returns a guest AuthUser object. */
export function createGuestUser(): AuthUser {
  return {
    uid: 'guest',
    displayName: null,
    email: null,
    photoURL: null,
    isGuest: true,
  };
}

/**
 * Sign out: clears the current user session.
 * When Firebase is active: auth().signOut()
 */
export async function signOut(): Promise<void> {
  // Firebase sign-out will go here
}

/** Returns null — real implementation reads from auth().currentUser */
export function getCurrentUser(): AuthUser | null {
  return null;
}

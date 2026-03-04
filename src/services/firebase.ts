/**
 * Firebase Configuration
 *
 * To enable Firebase Authentication:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Add your iOS and Android apps
 * 3. Download google-services.json (Android) and GoogleService-Info.plist (iOS)
 * 4. Add @react-native-firebase plugins to app.json
 * 5. Build with: npx expo prebuild && npx expo run:ios / run:android
 * 6. Replace placeholder values below with your real config
 */

export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

/**
 * Firebase is NOT initialized here because:
 * - @react-native-firebase requires a native development build
 * - google-services.json / GoogleService-Info.plist must be present
 * - This is an Expo managed workflow project
 *
 * When ready to enable:
 *   import { initializeApp } from '@react-native-firebase/app';
 *   const app = initializeApp(firebaseConfig);
 *   export const firebaseAuth = getAuth(app);
 */
export const FIREBASE_READY = false;

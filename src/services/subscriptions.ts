// RevenueCat subscription service — STUB MODE
// All functions return mock data. Connect RevenueCat when native build is ready:
//   1. Add your API key below
//   2. Uncomment the Purchases imports and calls
//   3. Run: expo prebuild && expo run:ios / expo run:android

export type PackageId = 'monthly' | 'annual';

// const RC_API_KEY_IOS = 'appl_YOUR_KEY_HERE';
// const RC_API_KEY_ANDROID = 'goog_YOUR_KEY_HERE';

export async function initializeRevenueCat(): Promise<void> {
  // Real implementation:
  // import Purchases from 'react-native-purchases';
  // import { Platform } from 'react-native';
  // const key = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
  // await Purchases.configure({ apiKey: key });
}

export async function purchasePackage(packageId: PackageId): Promise<boolean> {
  // Real implementation:
  // const offerings = await Purchases.getOfferings();
  // const pkg = offerings.current?.availablePackages.find(p => p.identifier === packageId);
  // if (!pkg) return false;
  // const { customerInfo } = await Purchases.purchasePackage(pkg);
  // return Object.keys(customerInfo.activeSubscriptions).length > 0;
  return false; // stub — returns false so purchase never succeeds in mock mode
}

export async function restorePurchases(): Promise<boolean> {
  // Real implementation:
  // const customerInfo = await Purchases.restoreTransactions();
  // return Object.keys(customerInfo.activeSubscriptions).length > 0;
  return false; // stub
}

export async function checkSubscriptionStatus(): Promise<boolean> {
  // Real implementation:
  // const customerInfo = await Purchases.getCustomerInfo();
  // return Object.keys(customerInfo.activeSubscriptions).length > 0;
  return false; // stub
}

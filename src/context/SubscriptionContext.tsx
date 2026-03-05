import React, {
  createContext, useContext, useState, useEffect, useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PackageId,
  initializeRevenueCat, purchasePackage, restorePurchases,
} from '../services/subscriptions';

const PREMIUM_KEY = 'sub_premium';
const AI_COUNT_KEY = 'sub_ai_count';
export const FREE_AI_LIMIT = 3;

interface SubscriptionContextValue {
  isPremium: boolean;
  aiGenerationsLeft: number;
  purchase: (packageId: PackageId) => Promise<boolean>;
  restore: () => Promise<boolean>;
  decrementAICount: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [aiGenerationsLeft, setAiGenerationsLeft] = useState(FREE_AI_LIMIT);

  useEffect(() => {
    async function init() {
      await initializeRevenueCat();
      const [storedPremium, storedCount] = await Promise.all([
        AsyncStorage.getItem(PREMIUM_KEY),
        AsyncStorage.getItem(AI_COUNT_KEY),
      ]);
      if (storedPremium === 'true') setIsPremium(true);
      if (storedCount !== null) setAiGenerationsLeft(parseInt(storedCount, 10));
    }
    init();
  }, []);

  const purchase = useCallback(async (packageId: PackageId): Promise<boolean> => {
    const success = await purchasePackage(packageId);
    if (success) {
      setIsPremium(true);
      await AsyncStorage.setItem(PREMIUM_KEY, 'true');
    }
    return success;
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    const success = await restorePurchases();
    if (success) {
      setIsPremium(true);
      await AsyncStorage.setItem(PREMIUM_KEY, 'true');
    }
    return success;
  }, []);

  const decrementAICount = useCallback(() => {
    setAiGenerationsLeft((prev) => {
      const next = Math.max(0, prev - 1);
      AsyncStorage.setItem(AI_COUNT_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <SubscriptionContext.Provider value={{
      isPremium,
      aiGenerationsLeft,
      purchase,
      restore,
      decrementAICount,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}

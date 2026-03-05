import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';

import { AppProvider, useApp } from './src/context/AppContext';
import { LanguageProvider, useTranslation } from './src/context/LanguageContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { AppStackParamList, RootStackParamList, TabParamList } from './src/types';
import { colors } from './src/styles/theme';

import WelcomeScreen from './src/screens/WelcomeScreen';
import IngredientsScreen from './src/screens/IngredientsScreen';
import ManualIngredientsScreen from './src/screens/ManualIngredientsScreen';
import MealStepScreen from './src/screens/MealStepScreen';
import PeopleStepScreen from './src/screens/PeopleStepScreen';
import CuisineStepScreen from './src/screens/CuisineStepScreen';
import TimeStepScreen from './src/screens/TimeStepScreen';
import RecipeListScreen from './src/screens/RecipeListScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ShoppingListScreen from './src/screens/ShoppingListScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsScreen from './src/screens/TermsScreen';
import PaywallScreen from './src/screens/PaywallScreen';

const AppStack = createStackNavigator<AppStackParamList>();
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Ingredients" component={IngredientsScreen} />
      <Stack.Screen name="ManualIngredients" component={ManualIngredientsScreen} />
      <Stack.Screen name="MealStep" component={MealStepScreen} />
      <Stack.Screen name="PeopleStep" component={PeopleStepScreen} />
      <Stack.Screen name="CuisineStep" component={CuisineStepScreen} />
      <Stack.Screen name="TimeStep" component={TimeStepScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="RecipeList" component={RecipeListScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
}

function ShoppingBadge() {
  const { state } = useApp();
  const count = state.shoppingList.filter((i) => !i.checked).length;
  if (count === 0) return null;
  return (
    <View style={badgeStyles.badge}>
      <Text style={badgeStyles.badgeText}>{count}</Text>
    </View>
  );
}

function FavoritesBadge() {
  const { state } = useApp();
  const count = state.favorites.length;
  if (count === 0) return null;
  return (
    <View style={[badgeStyles.badge, { backgroundColor: colors.primary }]}>
      <Text style={badgeStyles.badgeText}>{count}</Text>
    </View>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  const { state } = useApp();

  // Hide tab bar until onboarding is completed
  const tabBarStyle = state.onboardingCompleted
    ? {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
        height: 60,
        paddingBottom: 8,
      }
    : { display: 'none' as const };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          tabBarLabel: t('tab.home'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: t('tab.favorites'),
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Text style={{ fontSize: 22, color }}>{focused ? '♥' : '♡'}</Text>
              <FavoritesBadge />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{
          tabBarLabel: t('tab.shopping'),
          tabBarIcon: ({ color }) => (
            <View>
              <Text style={{ fontSize: 22, color }}>🛒</Text>
              <ShoppingBadge />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tab.profile'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AppStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <AppStack.Screen name="Main" component={MainTabs} />
            <AppStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <AppStack.Screen name="Terms" component={TermsScreen} />
          </>
        ) : (
          <>
            <AppStack.Screen name="Welcome" component={WelcomeScreen} />
            <AppStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <AppStack.Screen name="Terms" component={TermsScreen} />
          </>
        )}
      </AppStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <AppProvider>
                <RootNavigator />
              </AppProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: colors.danger, borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

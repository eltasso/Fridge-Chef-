import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, View } from 'react-native';

import { AppProvider, useApp } from './src/context/AppContext';
import { RootStackParamList, TabParamList } from './src/types';
import { colors } from './src/styles/theme';

import OnboardingScreen from './src/screens/OnboardingScreen';
import IngredientsScreen from './src/screens/IngredientsScreen';
import RecipeListScreen from './src/screens/RecipeListScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ShoppingListScreen from './src/screens/ShoppingListScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Ingredients" component={IngredientsScreen} />
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
    <View style={{
      position: 'absolute', top: -4, right: -8,
      backgroundColor: colors.danger, borderRadius: 10,
      minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 4,
    }}>
      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{count}</Text>
    </View>
  );
}

function FavoritesBadge() {
  const { state } = useApp();
  const count = state.favorites.length;
  if (count === 0) return null;
  return (
    <View style={{
      position: 'absolute', top: -4, right: -8,
      backgroundColor: colors.primary, borderRadius: 10,
      minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 4,
    }}>
      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{count}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favorites',
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
          tabBarLabel: 'Shopping',
          tabBarIcon: ({ color }) => (
            <View>
              <Text style={{ fontSize: 22, color }}>🛒</Text>
              <ShoppingBadge />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <MainTabs />
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

import React from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Recipe } from '../types';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48 - 12) / 2;

function FavCard({
  recipe,
  onPress,
  onUnfavorite,
}: {
  recipe: Recipe;
  onPress: () => void;
  onUnfavorite: () => void;
}) {
  const totalTime = recipe.prepTime + recipe.cookTime;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardImage}>
        <Text style={styles.cardImageEmoji}>🍽️</Text>
        <TouchableOpacity onPress={onUnfavorite} style={styles.heartBadge}>
          <Text style={styles.heartBadgeIcon}>♥</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={2}>{recipe.name}</Text>
        <Text style={styles.cardMeta}>{totalTime} min • {recipe.difficulty}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const { state, toggleFavorite } = useApp();

  if (state.favorites.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>My Favorites <Text style={styles.titleHeart}>♥</Text></Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>Save recipes you love and they'll appear here</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('HomeStack', { screen: 'Onboarding' })}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyBtnText}>Browse Recipes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={state.favorites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>My Favorites <Text style={styles.titleHeart}>♥</Text></Text>
            <Text style={styles.subtitle}>{state.favorites.length} saved recipe{state.favorites.length !== 1 ? 's' : ''}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <FavCard
            recipe={item}
            onPress={() => navigation.navigate('HomeStack', { screen: 'RecipeDetail', params: { recipe: item } })}
            onUnfavorite={() => toggleFavorite(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('HomeStack', { screen: 'Onboarding' })}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { padding: 20, paddingBottom: 80 },
  row: { gap: 12 },

  header: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#1A1A1A' },
  titleHeart: { color: '#FF6B35' },
  subtitle: { fontSize: 14, color: '#999', marginTop: 4 },

  card: {
    width: CARD_SIZE,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: '100%', height: 150,
    backgroundColor: '#FFF0EB',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  cardImageEmoji: { fontSize: 48 },
  heartBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#FFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  heartBadgeIcon: { fontSize: 16, color: '#FF6B35' },
  cardInfo: { padding: 10 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  cardMeta: { fontSize: 12, color: '#999' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#999', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  emptyBtn: {
    backgroundColor: '#4ECDC4', borderRadius: 16, height: 52,
    paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center',
  },
  emptyBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  fabText: { color: '#FFF', fontSize: 28, fontWeight: '300', lineHeight: 34 },
});

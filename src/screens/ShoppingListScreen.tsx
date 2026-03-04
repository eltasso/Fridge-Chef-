import React from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  TouchableOpacity, Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { ShoppingItem } from '../types';
import { shareShoppingList } from '../utils/share';

export default function ShoppingListScreen() {
  const { state, toggleShoppingItem, removeShoppingItem, clearShoppingList } = useApp();

  const unchecked = state.shoppingList.filter((i) => !i.checked);
  const checked = state.shoppingList.filter((i) => i.checked);

  const handleClear = () => {
    if (state.shoppingList.length === 0) return;
    Alert.alert('Clear List', 'Remove all items from the shopping list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearShoppingList },
    ]);
  };

  const handleShare = async () => {
    const items = state.shoppingList.filter((i) => !i.checked);
    if (items.length === 0) {
      Alert.alert('Nothing to share', 'Add some items to your list first.');
      return;
    }
    await shareShoppingList(items.map((i) => ({ name: i.name, amount: i.amount })));
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <TouchableOpacity
      onPress={() => toggleShoppingItem(item.id)}
      onLongPress={() => {
        Alert.alert('Remove Item', `Remove "${item.name}" from the list?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => removeShoppingItem(item.id) },
        ]);
      }}
      activeOpacity={0.8}
      style={styles.itemCard}
    >
      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
        {item.checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
          {item.amount ? `${item.amount} ` : ''}{item.name}
        </Text>
        {item.recipeName && (
          <Text style={styles.itemRecipe}>From: {item.recipeName}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (state.shoppingList.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Shopping List 🛒</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your list is empty</Text>
          <Text style={styles.emptySubtitle}>Add missing ingredients from any recipe</Text>
        </View>
      </SafeAreaView>
    );
  }

  type ListRow =
    | { type: 'item'; key: string; item: ShoppingItem }
    | { type: 'divider'; key: string }
    | { type: 'section'; key: string; label: string };

  const allItems: ListRow[] = [
    ...unchecked.map((i): ListRow => ({ type: 'item', key: i.id, item: i })),
    ...(checked.length > 0 && unchecked.length > 0
      ? [{ type: 'divider' as const, key: 'div' }]
      : []),
    ...(checked.length > 0
      ? [{ type: 'section' as const, key: 'done-header', label: `Done (${checked.length})` }]
      : []),
    ...checked.map((i): ListRow => ({ type: 'item', key: i.id, item: i })),
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={allItems}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Shopping List 🛒</Text>
            <Text style={styles.subtitle}>
              {unchecked.length} item{unchecked.length !== 1 ? 's' : ''} remaining
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          if (item.type === 'divider') {
            return <View style={styles.divider} />;
          }
          if (item.type === 'section') {
            return <Text style={styles.sectionLabel}>{item.label}</Text>;
          }
          return renderItem({ item: item.item });
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.8}>
          <Text style={styles.shareBtnText}>📤 Share List</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClear} activeOpacity={0.8}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { padding: 20, paddingBottom: 100 },

  header: { marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '800', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#999', marginTop: 4 },

  itemCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: '#FF6B35',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  checkmark: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  itemContent: { flex: 1 },
  itemName: { fontSize: 17, fontWeight: '600', color: '#1A1A1A' },
  itemNameChecked: { textDecorationLine: 'line-through', color: '#BBB' },
  itemRecipe: { fontSize: 13, color: '#999', marginTop: 2 },

  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 12 },
  sectionLabel: {
    fontSize: 12, fontWeight: '600', color: '#999',
    letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase',
  },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#999', textAlign: 'center', lineHeight: 22 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center',
    padding: 20, paddingBottom: 28, gap: 16,
    borderTopWidth: 1, borderTopColor: '#EEEEEE',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 6,
  },
  shareBtn: {
    flex: 1, height: 52, borderRadius: 16,
    borderWidth: 2, borderColor: '#4ECDC4',
    alignItems: 'center', justifyContent: 'center',
  },
  shareBtnText: { color: '#4ECDC4', fontWeight: '700', fontSize: 15 },
  clearText: { color: '#E85D4C', fontWeight: '600', fontSize: 15, paddingHorizontal: 8 },
});

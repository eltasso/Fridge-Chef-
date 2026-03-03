import React from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  TouchableOpacity, Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { ShoppingItem } from '../types';
import { shareShoppingList } from '../utils/share';
import { colors, spacing, radius, typography, shadows } from '../styles/theme';

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
      activeOpacity={0.75}
      style={[styles.item, item.checked && styles.itemChecked]}
    >
      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
        {item.checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
          {item.name}
        </Text>
        <Text style={styles.itemAmount}>{item.amount}</Text>
      </View>
      {item.recipeName && (
        <Text style={styles.itemRecipe} numberOfLines={1}>{item.recipeName}</Text>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Shopping List</Text>
      {state.shoppingList.length > 0 && (
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>📤 Share</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClear} style={[styles.headerBtn, styles.headerBtnDanger]}>
            <Text style={[styles.headerBtnText, styles.headerBtnDangerText]}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
      {unchecked.length > 0 && (
        <Text style={styles.countText}>{unchecked.length} item{unchecked.length !== 1 ? 's' : ''} to buy</Text>
      )}
    </View>
  );

  if (state.shoppingList.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        {renderHeader()}
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>List is empty</Text>
          <Text style={styles.emptySubtitle}>
            Open a recipe and tap "Missing ingredients" to add them here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const allItems = [
    ...(unchecked.length > 0 ? [{ type: 'header', key: 'h1', label: `To buy (${unchecked.length})` }] : []),
    ...unchecked.map((i) => ({ type: 'item', key: i.id, item: i })),
    ...(checked.length > 0 ? [{ type: 'header', key: 'h2', label: `Done (${checked.length})` }] : []),
    ...checked.map((i) => ({ type: 'item', key: i.id, item: i })),
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={allItems}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }: any) => {
          if (item.type === 'header') {
            return <Text style={styles.sectionLabel}>{item.label}</Text>;
          }
          return renderItem({ item: item.item });
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  title: { ...typography.h2, marginBottom: spacing.sm },
  headerActions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  headerBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  headerBtnDanger: { borderColor: colors.danger },
  headerBtnText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  headerBtnDangerText: { color: colors.danger },
  countText: { ...typography.body, color: colors.textSecondary },
  sectionLabel: {
    ...typography.label, textTransform: 'uppercase', letterSpacing: 0.5,
    color: colors.textMuted, marginVertical: spacing.sm,
  },
  item: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
    gap: spacing.md, ...shadows.sm,
  },
  itemChecked: { opacity: 0.55 },
  checkbox: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  itemContent: { flex: 1 },
  itemName: { ...typography.body, fontWeight: '500' },
  itemNameChecked: { textDecorationLine: 'line-through', color: colors.textMuted },
  itemAmount: { ...typography.bodySmall, marginTop: 2 },
  itemRecipe: { ...typography.caption, maxWidth: 80, textAlign: 'right' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, marginBottom: spacing.sm },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});

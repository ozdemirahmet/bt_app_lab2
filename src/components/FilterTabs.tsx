import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeColors, spacing } from '../theme/tokens';
import { TodoCounts, TodoFilter } from '../types/todo';

interface FilterTabsProps {
  filter: TodoFilter;
  counts: TodoCounts;
  onChangeFilter: (filter: TodoFilter) => void;
  theme: ThemeColors;
}

const TABS: { key: TodoFilter; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'active', label: 'Aktif' },
  { key: 'completed', label: 'Tamamlanan' },
];

export function FilterTabs({
  filter,
  counts,
  onChangeFilter,
  theme,
}: FilterTabsProps) {
  const getCount = (key: TodoFilter): number => {
    if (key === 'active') return counts.active;
    if (key === 'completed') return counts.completed;
    return counts.total;
  };

  return (
    <View
      style={[styles.container, { borderBottomColor: theme.border }]}
      accessibilityRole="tablist"
    >
      {TABS.map((tab) => {
        const isActive = filter === tab.key;
        const count = getCount(tab.key);

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChangeFilter(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} (${count})`}
            style={({ pressed }) => [
              styles.tab,
              isActive && { borderBottomColor: theme.accent },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? theme.textPrimary : theme.textMuted },
                isActive && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
            <Text
              style={[
                styles.tabCount,
                { color: isActive ? theme.textPrimary : theme.textMuted },
              ]}
            >
              {count}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.xl,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '600',
  },
  tabCount: {
    fontSize: 12,
    opacity: 0.75,
  },
  pressed: {
    opacity: 0.6,
  },
});

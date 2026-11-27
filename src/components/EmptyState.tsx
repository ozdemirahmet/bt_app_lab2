import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeColors, spacing } from '../theme/tokens';
import { TodoFilter } from '../types/todo';

interface EmptyStateProps {
  filter: TodoFilter;
  isLoading: boolean;
  theme: ThemeColors;
}

const EMPTY_CONTENT: Record<
  TodoFilter,
  { icon: 'check-circle' | 'sun' | 'inbox'; title: string; subtitle: string }
> = {
  all: {
    icon: 'inbox',
    title: 'Henüz görev yok',
    subtitle: 'Aşağıdan ilk görevini ekleyerek başla.',
  },
  active: {
    icon: 'sun',
    title: 'Aktif görev kalmadı',
    subtitle: 'Tüm görevlerin tamamlandı.',
  },
  completed: {
    icon: 'check-circle',
    title: 'Tamamlanan görev yok',
    subtitle: 'Bir görevi tamamladığında burada görünür.',
  },
};

export function EmptyState({ filter, isLoading, theme }: EmptyStateProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Görevler yükleniyor...
        </Text>
      </View>
    );
  }

  const content = EMPTY_CONTENT[filter];

  return (
    <View style={styles.container}>
      <Feather
        name={content.icon}
        size={28}
        color={theme.textMuted}
        style={styles.icon}
      />
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        {content.title}
      </Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>
        {content.subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: 64,
  },
  icon: {
    marginBottom: spacing.md,
    opacity: 0.7,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

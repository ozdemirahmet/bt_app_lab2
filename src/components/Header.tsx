import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeColors, spacing } from '../theme/tokens';
import { TodoCounts } from '../types/todo';

interface HeaderProps {
  counts: TodoCounts;
  onClearCompleted: () => void;
  theme: ThemeColors;
}

const TURKISH_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

const TURKISH_DAYS = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
];

function formatTurkishDate(date: Date): string {
  const dayNum = date.getDate();
  const month = TURKISH_MONTHS[date.getMonth()];
  const weekday = TURKISH_DAYS[date.getDay()];
  return `${dayNum} ${month}, ${weekday}`;
}

export function Header({ counts, onClearCompleted, theme }: HeaderProps) {
  const dateLabel = useMemo(() => formatTurkishDate(new Date()), []);

  const statusLabel =
    counts.total === 0
      ? 'Liste boş'
      : counts.active === 0
        ? 'Tüm görevler tamamlandı'
        : `${counts.active} aktif görev`;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>{dateLabel}</Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Görevler</Text>
        </View>

        {counts.completed > 0 && (
          <Pressable
            onPress={onClearCompleted}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Tamamlanan görevleri temizle"
            style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
          >
            <Text style={[styles.clearText, { color: theme.textMuted }]}>
              Tamamlananları temizle
            </Text>
          </Pressable>
        )}
      </View>

      <Text style={[styles.statusText, { color: theme.textMuted }]}>{statusLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: -0.6,
  },
  statusText: {
    fontSize: 13,
    marginTop: spacing.xs,
  },
  clearButton: {
    paddingVertical: spacing.xs,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.55,
  },
});

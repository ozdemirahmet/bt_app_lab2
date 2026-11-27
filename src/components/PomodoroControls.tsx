import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeColors, radius, spacing } from '../theme/tokens';

interface PomodoroControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  theme: ThemeColors;
}

export function PomodoroControls({
  isRunning,
  onStart,
  onPause,
  onReset,
  onSkip,
  theme,
}: PomodoroControlsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onReset}
        accessibilityRole="button"
        accessibilityLabel="Zamanlayıcıyı sıfırla"
        style={({ pressed }) => [
          styles.secondaryButton,
          { borderColor: theme.border, backgroundColor: theme.surface },
          pressed && styles.pressed,
        ]}
      >
        <Feather name="rotate-ccw" size={18} color={theme.textPrimary} />
      </Pressable>

      <Pressable
        onPress={isRunning ? onPause : onStart}
        accessibilityRole="button"
        accessibilityLabel={isRunning ? 'Duraklat' : 'Başlat'}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: theme.accent },
          pressed && styles.pressed,
        ]}
      >
        <Feather
          name={isRunning ? 'pause' : 'play'}
          size={18}
          color={theme.accentText}
        />
        <Text style={[styles.primaryLabel, { color: theme.accentText }]}>
          {isRunning ? 'Duraklat' : 'Başlat'}
        </Text>
      </Pressable>

      <Pressable
        onPress={onSkip}
        accessibilityRole="button"
        accessibilityLabel="Sonraki aşamaya geç"
        style={({ pressed }) => [
          styles.secondaryButton,
          { borderColor: theme.border, backgroundColor: theme.surface },
          pressed && styles.pressed,
        ]}
      >
        <Feather name="skip-forward" size={18} color={theme.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minWidth: 144,
    height: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
  },
  primaryLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
});

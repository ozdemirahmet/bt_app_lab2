import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeColors, spacing } from '../theme/tokens';
import { POMODORO_LABELS, PomodoroPhase } from '../types/pomodoro';

interface PomodoroPhaseTabsProps {
  phase: PomodoroPhase;
  onSelectPhase: (phase: PomodoroPhase) => void;
  theme: ThemeColors;
}

const PHASES: PomodoroPhase[] = ['focus', 'shortBreak', 'longBreak'];

export function PomodoroPhaseTabs({
  phase,
  onSelectPhase,
  theme,
}: PomodoroPhaseTabsProps) {
  return (
    <View
      style={[styles.container, { borderBottomColor: theme.border }]}
      accessibilityRole="tablist"
    >
      {PHASES.map((item) => {
        const isActive = phase === item;
        const label = POMODORO_LABELS[item];

        return (
          <Pressable
            key={item}
            onPress={() => onSelectPhase(item)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
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
              {label}
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
  pressed: {
    opacity: 0.6,
  },
});

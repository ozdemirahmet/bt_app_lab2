import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeColors, radius, spacing } from '../theme/tokens';
import { POMODORO_LABELS, PomodoroPhase } from '../types/pomodoro';

interface PomodoroDisplayProps {
  phase: PomodoroPhase;
  formattedTime: string;
  progress: number;
  completedSessions: number;
  isRunning: boolean;
  theme: ThemeColors;
}

const CYCLE_SLOTS = [0, 1, 2, 3];

export function PomodoroDisplay({
  phase,
  formattedTime,
  progress,
  completedSessions,
  isRunning,
  theme,
}: PomodoroDisplayProps) {
  const cycleCount =
    completedSessions > 0 && completedSessions % 4 === 0
      ? 4
      : completedSessions % 4;

  const statusText = isRunning
    ? `${POMODORO_LABELS[phase]} devam ediyor`
    : `${POMODORO_LABELS[phase]} hazır`;

  return (
    <View style={styles.container}>
      <Text style={[styles.statusText, { color: theme.textMuted }]}>
        {statusText}
      </Text>

      <Text
        style={[styles.timerText, { color: theme.textPrimary }]}
        accessibilityLabel={`Kalan süre ${formattedTime}`}
      >
        {formattedTime}
      </Text>

      <View
        style={[styles.progressTrack, { backgroundColor: theme.surfaceSubtle }]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.accent,
              width: `${Math.round(progress * 100)}%`,
            },
          ]}
        />
      </View>

      <View style={styles.sessionRow}>
        <View style={styles.dotsRow}>
          {CYCLE_SLOTS.map((slot) => {
            const filled = slot < cycleCount;
            return (
              <View
                key={slot}
                style={[
                  styles.dot,
                  {
                    backgroundColor: filled ? theme.accent : 'transparent',
                    borderColor: filled ? theme.accent : theme.textMuted,
                  },
                ]}
              />
            );
          })}
        </View>
        <Text style={[styles.sessionText, { color: theme.textMuted }]}>
          Bugün {completedSessions} odak oturumu
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  timerText: {
    fontSize: 72,
    fontWeight: '300',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.xl,
  },
  progressTrack: {
    width: '100%',
    maxWidth: 260,
    height: 3,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  sessionRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  sessionText: {
    fontSize: 13,
  },
});

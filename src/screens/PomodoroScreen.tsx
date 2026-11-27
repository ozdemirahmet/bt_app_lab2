import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PomodoroControls } from '../components/PomodoroControls';
import { PomodoroDisplay } from '../components/PomodoroDisplay';
import { PomodoroPhaseTabs } from '../components/PomodoroPhaseTabs';
import { usePomodoro } from '../hooks/usePomodoro';
import { getTheme, spacing } from '../theme/tokens';

export function PomodoroScreen() {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);

  const {
    phase,
    formattedTime,
    isRunning,
    completedSessions,
    progress,
    start,
    pause,
    reset,
    selectPhase,
    skipPhase,
  } = usePomodoro();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Zamanlayıcı
          </Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Pomodoro
          </Text>
        </View>

        <PomodoroPhaseTabs
          phase={phase}
          onSelectPhase={selectPhase}
          theme={theme}
        />

        <View style={styles.centerSection}>
          <PomodoroDisplay
            phase={phase}
            formattedTime={formattedTime}
            progress={progress}
            completedSessions={completedSessions}
            isRunning={isRunning}
            theme={theme}
          />
        </View>

        <View style={styles.controlsSection}>
          <PomodoroControls
            isRunning={isRunning}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onSkip={skipPhase}
            theme={theme}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  subtitle: {
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
  centerSection: {
    flex: 1,
    justifyContent: 'center',
  },
  controlsSection: {
    paddingBottom: spacing.xxl,
  },
});

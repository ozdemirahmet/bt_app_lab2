import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOptionalAuth } from '../context/AuthContext';
import {
  loadTodayPomodoroCount,
  saveTodayPomodoroCount,
} from '../storage/pomodoroStorage';
import {
  fetchTodayRemotePomodoroCount,
  recordRemotePomodoroSession,
} from '../storage/remotePomodoroStorage';
import { POMODORO_DURATIONS, PomodoroPhase } from '../types/pomodoro';
import {
  triggerLightImpact,
  triggerSelectionHaptic,
  triggerSuccessHaptic,
} from '../utils/haptics';

export function formatTimer(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function usePomodoro() {
  const auth = useOptionalAuth();
  const userId = auth?.user?.id ?? null;

  const [phase, setPhase] = useState<PomodoroPhase>('focus');
  const [secondsLeft, setSecondsLeft] = useState<number>(POMODORO_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const targetEndTimeRef = useRef<number | null>(null);
  const loadedScopeRef = useRef<string | null>(null);
  const completedSessionsRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const scopeKey = userId ?? 'local';
    loadedScopeRef.current = null;

    const loadPromise = userId
      ? fetchTodayRemotePomodoroCount(userId)
      : loadTodayPomodoroCount();

    loadPromise
      .then((count) => {
        if (!isMounted) return;
        completedSessionsRef.current = count;
        setCompletedSessions(count);
        loadedScopeRef.current = scopeKey;
      })
      .catch(() => {
        if (!isMounted) return;
        loadedScopeRef.current = scopeKey;
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    completedSessionsRef.current = completedSessions;
    if (userId) return;
    if (loadedScopeRef.current !== 'local') return;
    saveTodayPomodoroCount(completedSessions).catch(() => {
      // Storage errors should not interrupt the timer UI
    });
  }, [completedSessions, userId]);

  const completeCurrentPhase = useCallback(
    (currentPhase: PomodoroPhase) => {
      targetEndTimeRef.current = null;
      setIsRunning(false);
      void triggerSuccessHaptic();

      if (currentPhase === 'focus') {
        const nextCount = completedSessionsRef.current + 1;
        completedSessionsRef.current = nextCount;
        setCompletedSessions(nextCount);
        if (userId) {
          recordRemotePomodoroSession(
            userId,
            'focus',
            POMODORO_DURATIONS.focus,
          ).catch(() => {});
        }
        const nextPhase: PomodoroPhase =
          nextCount % 4 === 0 ? 'longBreak' : 'shortBreak';
        setPhase(nextPhase);
        setSecondsLeft(POMODORO_DURATIONS[nextPhase]);
        return;
      }

      setPhase('focus');
      setSecondsLeft(POMODORO_DURATIONS.focus);
    },
    [userId],
  );

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      const target = targetEndTimeRef.current;
      if (target === null) return;

      const remainingMs = target - Date.now();
      const nextSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      if (nextSeconds <= 0) {
        completeCurrentPhase(phase);
      } else {
        setSecondsLeft((prev) => (prev === nextSeconds ? prev : nextSeconds));
      }
    }, 250);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning, phase, completeCurrentPhase]);

  const start = useCallback(() => {
    if (isRunning) return;
    const initialSeconds =
      secondsLeft > 0 ? secondsLeft : POMODORO_DURATIONS[phase];
    if (secondsLeft <= 0) {
      setSecondsLeft(initialSeconds);
    }
    targetEndTimeRef.current = Date.now() + initialSeconds * 1000;
    setIsRunning(true);
    void triggerLightImpact();
  }, [isRunning, phase, secondsLeft]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    if (targetEndTimeRef.current !== null) {
      const remaining = Math.max(
        0,
        Math.ceil((targetEndTimeRef.current - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);
    }
    targetEndTimeRef.current = null;
    setIsRunning(false);
    void triggerSelectionHaptic();
  }, [isRunning]);

  const reset = useCallback(() => {
    targetEndTimeRef.current = null;
    setIsRunning(false);
    setSecondsLeft(POMODORO_DURATIONS[phase]);
    void triggerSelectionHaptic();
  }, [phase]);

  const selectPhase = useCallback((nextPhase: PomodoroPhase) => {
    targetEndTimeRef.current = null;
    setIsRunning(false);
    setPhase(nextPhase);
    setSecondsLeft(POMODORO_DURATIONS[nextPhase]);
    void triggerSelectionHaptic();
  }, []);

  const skipPhase = useCallback(() => {
    targetEndTimeRef.current = null;
    setIsRunning(false);
    const nextPhase: PomodoroPhase = phase === 'focus' ? 'shortBreak' : 'focus';
    setPhase(nextPhase);
    setSecondsLeft(POMODORO_DURATIONS[nextPhase]);
    void triggerSelectionHaptic();
  }, [phase]);

  const totalDuration = POMODORO_DURATIONS[phase];
  const progress = useMemo(() => {
    if (totalDuration <= 0) return 0;
    return Math.min(1, Math.max(0, 1 - secondsLeft / totalDuration));
  }, [secondsLeft, totalDuration]);

  return {
    phase,
    secondsLeft,
    formattedTime: formatTimer(secondsLeft),
    isRunning,
    completedSessions,
    progress,
    start,
    pause,
    reset,
    selectPhase,
    skipPhase,
  };
}

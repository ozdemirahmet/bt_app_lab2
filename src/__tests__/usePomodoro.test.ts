import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';
import { formatTimer, usePomodoro } from '../hooks/usePomodoro';
import {
  POMODORO_STORAGE_KEY,
  getTodayDateKey,
  loadTodayPomodoroCount,
  saveTodayPomodoroCount,
} from '../storage/pomodoroStorage';

describe('pomodoroStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns 0 when storage is empty or from a previous day', async () => {
    expect(await loadTodayPomodoroCount('2026-11-20')).toBe(0);

    await saveTodayPomodoroCount(3, '2026-11-19');
    expect(await loadTodayPomodoroCount('2026-11-20')).toBe(0);
  });

  it('loads stored count for the same day and ignores corrupted data', async () => {
    const today = getTodayDateKey();
    await saveTodayPomodoroCount(2, today);
    expect(await loadTodayPomodoroCount(today)).toBe(2);

    await AsyncStorage.setItem(POMODORO_STORAGE_KEY, '{bad-json');
    expect(await loadTodayPomodoroCount(today)).toBe(0);
  });
});

describe('usePomodoro', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('counts down, pauses, resets, and formats timer accurately', async () => {
    expect(formatTimer(25 * 60)).toBe('25:00');
    expect(formatTimer(65)).toBe('01:05');

    const { result } = await renderHook(() => usePomodoro());
    expect(result.current.formattedTime).toBe('25:00');
    expect(result.current.isRunning).toBe(false);

    await act(async () => {
      result.current.start();
    });
    expect(result.current.isRunning).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.secondsLeft).toBe(25 * 60 - 5);
    expect(result.current.formattedTime).toBe('24:55');

    await act(async () => {
      result.current.pause();
    });
    expect(result.current.isRunning).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.secondsLeft).toBe(25 * 60 - 5);

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.secondsLeft).toBe(25 * 60);
    expect(result.current.formattedTime).toBe('25:00');
  });

  it('transitions from focus to shortBreak and to longBreak every 4 sessions', async () => {
    await saveTodayPomodoroCount(3);
    const { result } = await renderHook(() => usePomodoro());

    expect(result.current.completedSessions).toBe(3);

    await act(async () => {
      result.current.start();
    });

    await act(async () => {
      jest.advanceTimersByTime(25 * 60 * 1000 + 300);
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.completedSessions).toBe(4);
    expect(result.current.phase).toBe('longBreak');
    expect(result.current.formattedTime).toBe('15:00');

    // Skip break back to focus
    await act(async () => {
      result.current.skipPhase();
    });
    expect(result.current.phase).toBe('focus');
    expect(result.current.formattedTime).toBe('25:00');
  });
});

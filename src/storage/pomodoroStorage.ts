import AsyncStorage from '@react-native-async-storage/async-storage';

export const POMODORO_STORAGE_KEY = '@minimal_pomodoro_daily_v1';

interface StoredPomodoroStats {
  dateKey: string;
  completedSessions: number;
}

export function getTodayDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Loads today's completed focus session count.
 * Resets to 0 if the stored date differs from today or JSON is invalid.
 */
export async function loadTodayPomodoroCount(
  todayKey: string = getTodayDateKey(),
): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(POMODORO_STORAGE_KEY);
    if (!raw) return 0;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return 0;

    const candidate = parsed as Partial<StoredPomodoroStats>;
    if (
      candidate.dateKey === todayKey &&
      typeof candidate.completedSessions === 'number' &&
      Number.isInteger(candidate.completedSessions) &&
      candidate.completedSessions >= 0
    ) {
      return candidate.completedSessions;
    }

    return 0;
  } catch {
    return 0;
  }
}

export async function saveTodayPomodoroCount(
  completedSessions: number,
  todayKey: string = getTodayDateKey(),
): Promise<void> {
  const payload: StoredPomodoroStats = {
    dateKey: todayKey,
    completedSessions,
  };
  await AsyncStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(payload));
}

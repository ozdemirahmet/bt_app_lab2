import { supabase } from '../lib/supabase';
import { PomodoroPhase } from '../types/pomodoro';
import { getTodayDateKey } from './pomodoroStorage';

export interface RemotePomodoroTotals {
  todayFocusCount: number;
  totalFocusCount: number;
  totalFocusMinutes: number;
}

export async function recordRemotePomodoroSession(
  userId: string,
  phase: PomodoroPhase,
  durationSeconds: number,
): Promise<void> {
  const { error } = await supabase.from('pomodoro_sessions').insert({
    user_id: userId,
    phase,
    duration_seconds: durationSeconds,
    session_date: getTodayDateKey(),
  });
  if (error) throw error;
}

export async function fetchTodayRemotePomodoroCount(
  userId: string,
): Promise<number> {
  const today = getTodayDateKey();
  const { count, error } = await supabase
    .from('pomodoro_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('phase', 'focus')
    .eq('session_date', today);

  if (error || count === null) return 0;
  return count;
}

export async function fetchRemotePomodoroTotals(
  userId: string,
): Promise<RemotePomodoroTotals> {
  const today = getTodayDateKey();
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('duration_seconds, session_date')
    .eq('user_id', userId)
    .eq('phase', 'focus');

  if (error || !data) {
    return {
      todayFocusCount: 0,
      totalFocusCount: 0,
      totalFocusMinutes: 0,
    };
  }

  let todayFocusCount = 0;
  let totalSeconds = 0;

  for (const row of data) {
    if (row.session_date === today) {
      todayFocusCount += 1;
    }
    totalSeconds += row.duration_seconds;
  }

  return {
    todayFocusCount,
    totalFocusCount: data.length,
    totalFocusMinutes: Math.round(totalSeconds / 60),
  };
}

export async function fetchRemoteCompletedTodoCount(
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('todos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', true);

  if (error || count === null) return 0;
  return count;
}

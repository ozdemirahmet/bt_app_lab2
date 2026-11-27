export type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak';

export const POMODORO_DURATIONS: Record<PomodoroPhase, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const POMODORO_LABELS: Record<PomodoroPhase, string> = {
  focus: 'Odak',
  shortBreak: 'Kısa Mola',
  longBreak: 'Uzun Mola',
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PomodoroScreen } from '../screens/PomodoroScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

async function renderPomodoro() {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <PomodoroScreen />
    </SafeAreaProvider>,
  );
}

describe('PomodoroScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders default focus phase and switches between phase tabs', async () => {
    await renderPomodoro();

    expect(screen.getByText('Pomodoro')).toBeTruthy();
    expect(screen.getByText('25:00')).toBeTruthy();
    expect(screen.getByText('Bugün 0 odak oturumu')).toBeTruthy();

    await fireEvent.press(screen.getByRole('tab', { name: 'Kısa Mola' }));
    expect(screen.getByText('05:00')).toBeTruthy();

    await fireEvent.press(screen.getByRole('tab', { name: 'Uzun Mola' }));
    expect(screen.getByText('15:00')).toBeTruthy();

    await fireEvent.press(screen.getByRole('tab', { name: 'Odak' }));
    expect(screen.getByText('25:00')).toBeTruthy();
  });

  it('starts, pauses, and resets the timer via controls', async () => {
    await renderPomodoro();

    await fireEvent.press(screen.getByRole('button', { name: 'Başlat' }));
    expect(screen.getByRole('button', { name: 'Duraklat' })).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText('24:58')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Duraklat' }));
    expect(screen.getByRole('button', { name: 'Başlat' })).toBeTruthy();

    await fireEvent.press(
      screen.getByRole('button', { name: 'Zamanlayıcıyı sıfırla' }),
    );
    expect(screen.getByText('25:00')).toBeTruthy();
  });
});

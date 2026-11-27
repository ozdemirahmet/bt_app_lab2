import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { ProfileScreen } from '../screens/ProfileScreen';
import {
  fetchRemoteCompletedTodoCount,
  fetchRemotePomodoroTotals,
} from '../storage/remotePomodoroStorage';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(true),
  },
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../storage/remotePomodoroStorage', () => ({
  fetchRemotePomodoroTotals: jest.fn(),
  fetchRemoteCompletedTodoCount: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedFetchTotals = fetchRemotePomodoroTotals as jest.MockedFunction<
  typeof fetchRemotePomodoroTotals
>;
const mockedFetchCompleted = fetchRemoteCompletedTodoCount as jest.MockedFunction<
  typeof fetchRemoteCompletedTodoCount
>;

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

async function renderProfile() {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <ProfileScreen />
    </SafeAreaProvider>,
  );
}

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows sign-in and sign-up actions when user is logged out', async () => {
    mockedUseAuth.mockReturnValue({
      session: null,
      user: null,
      profile: null,
      isLoading: false,
      isConfigured: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      refreshProfile: jest.fn(),
      updateProfile: jest.fn(),
    });

    await renderProfile();

    expect(screen.getByText('Hesabına giriş yap')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Giriş Yap' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/auth',
      params: { mode: 'signIn' },
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Kayıt Ol' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/auth',
      params: { mode: 'signUp' },
    });
  });

  it('renders user profile, stats, saves updates, and signs out', async () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    const signOut = jest.fn().mockResolvedValue(undefined);

    mockedFetchTotals.mockResolvedValue({
      todayFocusCount: 3,
      totalFocusCount: 12,
      totalFocusMinutes: 300,
    });
    mockedFetchCompleted.mockResolvedValue(8);

    mockedUseAuth.mockReturnValue({
      session: { user: { id: 'user-1', email: 'ada@example.com' } } as never,
      user: { id: 'user-1', email: 'ada@example.com' } as never,
      profile: {
        id: 'user-1',
        full_name: 'Ada Yılmaz',
        username: 'adayilmaz',
        daily_pomodoro_goal: 4,
        created_at: '2026-11-27T00:00:00Z',
        updated_at: '2026-11-27T00:00:00Z',
      },
      isLoading: false,
      isConfigured: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut,
      refreshProfile: jest.fn(),
      updateProfile,
    });

    await renderProfile();

    expect(await screen.findByText('300 dk')).toBeTruthy();
    expect(screen.getByText('Ada Yılmaz')).toBeTruthy();
    expect(screen.getByText('ada@example.com')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Ad Soyad'), 'Ada Demir');
    await fireEvent.press(screen.getByRole('button', { name: 'Hedefi artır' }));
    await fireEvent.press(
      screen.getByRole('button', { name: 'Değişiklikleri Kaydet' }),
    );

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({
        fullName: 'Ada Demir',
        username: 'adayilmaz',
        dailyPomodoroGoal: 5,
      });
    });
    expect(await screen.findByText('Profil güncellendi.')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Çıkış Yap' }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

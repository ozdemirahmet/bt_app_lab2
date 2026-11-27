import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { lightTheme } from '../theme/tokens';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function createMockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  return {
    session: null,
    user: null,
    profile: null,
    isLoading: false,
    isConfigured: true,
    signIn: jest.fn().mockResolvedValue({ error: null }),
    signUp: jest.fn().mockResolvedValue({ error: null, needsEmailConfirmation: false }),
    signOut: jest.fn().mockResolvedValue(undefined),
    refreshProfile: jest.fn().mockResolvedValue(undefined),
    updateProfile: jest.fn().mockResolvedValue({ error: null }),
    ...overrides,
  };
}

describe('AuthForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates email, password length, and password confirmation', async () => {
    mockedUseAuth.mockReturnValue(createMockAuth());
    await render(<AuthForm theme={lightTheme} />);

    // Invalid email
    await fireEvent.press(screen.getByRole('button', { name: 'Giriş Yap' }));
    expect(screen.getByText('Lütfen geçerli bir e-posta adresi girin.')).toBeTruthy();

    // Short password
    await fireEvent.changeText(screen.getByLabelText('E-posta'), 'ada@example.com');
    await fireEvent.changeText(screen.getByLabelText('Şifre'), '123');
    await fireEvent.press(screen.getByRole('button', { name: 'Giriş Yap' }));
    expect(screen.getByText('Şifre en az 6 karakter olmalıdır.')).toBeTruthy();

    // Switch to Kayıt Ol and test mismatched passwords
    await fireEvent.press(screen.getByRole('tab', { name: 'Kayıt Ol' }));
    await fireEvent.changeText(screen.getByLabelText('Şifre'), 'secret123');
    await fireEvent.changeText(screen.getByLabelText('Şifre Tekrarı'), 'different123');
    await fireEvent.press(screen.getByRole('button', { name: 'Kayıt Ol' }));
    expect(screen.getByText('Şifreler birbiriyle eşleşmiyor.')).toBeTruthy();
  });

  it('signs in successfully and calls onSuccess', async () => {
    const signIn = jest.fn().mockResolvedValue({ error: null });
    const onSuccess = jest.fn();
    mockedUseAuth.mockReturnValue(createMockAuth({ signIn }));

    await render(<AuthForm onSuccess={onSuccess} theme={lightTheme} />);

    await fireEvent.changeText(screen.getByLabelText('E-posta'), 'ada@example.com');
    await fireEvent.changeText(screen.getByLabelText('Şifre'), 'secret123');
    await fireEvent.press(screen.getByRole('button', { name: 'Giriş Yap' }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('ada@example.com', 'secret123');
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('shows email confirmation banner after sign up when required', async () => {
    const signUp = jest
      .fn()
      .mockResolvedValue({ error: null, needsEmailConfirmation: true });
    mockedUseAuth.mockReturnValue(createMockAuth({ signUp }));

    await render(<AuthForm initialMode="signUp" theme={lightTheme} />);

    await fireEvent.changeText(screen.getByLabelText('Ad Soyad'), 'Ada Yılmaz');
    await fireEvent.changeText(screen.getByLabelText('E-posta'), 'ada@example.com');
    await fireEvent.changeText(screen.getByLabelText('Şifre'), 'secret123');
    await fireEvent.changeText(screen.getByLabelText('Şifre Tekrarı'), 'secret123');
    await fireEvent.press(screen.getByRole('button', { name: 'Kayıt Ol' }));

    expect(
      await screen.findByText(/doğrulama bağlantısını onayladıktan sonra/i),
    ).toBeTruthy();
  });
});

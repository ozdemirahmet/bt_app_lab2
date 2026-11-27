import { Session, User } from '@supabase/supabase-js';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ProfileRow } from '../types/database';

interface SignUpParams {
  email: string;
  password: string;
  fullName?: string;
}

interface UpdateProfileParams {
  fullName?: string;
  username?: string;
  dailyPomodoroGoal?: number;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    params: SignUpParams,
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (params: UpdateProfileParams) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'E-posta adresi veya şifre hatalı.';
  }
  if (lower.includes('user already registered')) {
    return 'Bu e-posta adresi zaten kayıtlı.';
  }
  if (lower.includes('password should be at least')) {
    return 'Şifre en az 6 karakter olmalıdır.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Giriş yapmadan önce e-posta adresinizi doğrulayın.';
  }
  if (lower.includes('unable to validate email address') || lower.includes('invalid format')) {
    return 'Geçerli bir e-posta adresi girin.';
  }
  if (lower.includes('rate limit')) {
    return 'Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.';
  }
  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);

  const loadProfileForUser = useCallback(async (userId: string, fallbackName?: string) => {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return;
    }

    if (data) {
      setProfile(data);
      return;
    }

    // Create default profile row if the user predates the signup trigger
    const { data: created } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fallbackName?.trim() || null,
      })
      .select('*')
      .maybeSingle();

    if (created) {
      setProfile(created);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session);
        if (data.session?.user) {
          const metaName =
            typeof data.session.user.user_metadata?.full_name === 'string'
              ? data.session.user.user_metadata.full_name
              : undefined;
          void loadProfileForUser(data.session.user.id, metaName);
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!isMounted) return;
        setSession(nextSession);
        if (nextSession?.user) {
          const metaName =
            typeof nextSession.user.user_metadata?.full_name === 'string'
              ? nextSession.user.user_metadata.full_name
              : undefined;
          void loadProfileForUser(nextSession.user.id, metaName);
        } else {
          setProfile(null);
        }
      },
    );

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfileForUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase bağlantısı yapılandırılmamış.' };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { error: mapAuthError(error.message) };
    }
    return { error: null };
  }, []);

  const signUp = useCallback(
    async ({ email, password, fullName }: SignUpParams) => {
      if (!isSupabaseConfigured) {
        return {
          error: 'Supabase bağlantısı yapılandırılmamış.',
          needsEmailConfirmation: false,
        };
      }

      const trimmedName = fullName?.trim();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: trimmedName
          ? { data: { full_name: trimmedName } }
          : undefined,
      });

      if (error) {
        return {
          error: mapAuthError(error.message),
          needsEmailConfirmation: false,
        };
      }

      return {
        error: null,
        needsEmailConfirmation: Boolean(data.user && !data.session),
      };
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    await loadProfileForUser(userId);
  }, [session?.user?.id, loadProfileForUser]);

  const updateProfile = useCallback(
    async (params: UpdateProfileParams) => {
      const userId = session?.user?.id;
      if (!userId) {
        return { error: 'Oturum bulunamadı.' };
      }

      const cleanUsername = params.username?.trim();
      if (cleanUsername && cleanUsername.length < 3) {
        return { error: 'Kullanıcı adı en az 3 karakter olmalıdır.' };
      }

      const updates: {
        id: string;
        full_name?: string | null;
        username?: string | null;
        daily_pomodoro_goal?: number;
      } = { id: userId };

      if (params.fullName !== undefined) {
        updates.full_name = params.fullName.trim() || null;
      }
      if (params.username !== undefined) {
        updates.username = cleanUsername || null;
      }
      if (params.dailyPomodoroGoal !== undefined) {
        updates.daily_pomodoro_goal = Math.min(
          20,
          Math.max(1, Math.round(params.dailyPomodoroGoal)),
        );
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(updates)
        .select('*')
        .single();

      if (error) {
        if (error.message.toLowerCase().includes('profiles_username_key')) {
          return { error: 'Bu kullanıcı adı başka bir kullanıcı tarafından alınmış.' };
        }
        return { error: error.message };
      }

      setProfile(data);
      return { error: null };
    },
    [session?.user?.id],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      isConfigured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [
      session,
      profile,
      isLoading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export function useOptionalAuth(): AuthContextValue | undefined {
  return useContext(AuthContext);
}

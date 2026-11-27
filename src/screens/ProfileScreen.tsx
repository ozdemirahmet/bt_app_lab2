import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import {
  RemotePomodoroTotals,
  fetchRemoteCompletedTodoCount,
  fetchRemotePomodoroTotals,
} from '../storage/remotePomodoroStorage';
import { getTheme, radius, spacing } from '../theme/tokens';

function getInitials(name?: string | null, email?: string): string {
  const source = (name && name.trim()) || email || '?';
  const parts = source.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);
  const { user, profile, isLoading, signOut, updateProfile } = useAuth();

  const [draftFullName, setDraftFullName] = useState<string | null>(null);
  const [draftUsername, setDraftUsername] = useState<string | null>(null);
  const [draftDailyGoal, setDraftDailyGoal] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [stats, setStats] = useState<RemotePomodoroTotals & { completedTodos: number }>({
    todayFocusCount: 0,
    totalFocusCount: 0,
    totalFocusMinutes: 0,
    completedTodos: 0,
  });

  const fullName = draftFullName ?? profile?.full_name ?? '';
  const username = draftUsername ?? profile?.username ?? '';
  const dailyGoal = draftDailyGoal ?? profile?.daily_pomodoro_goal ?? 4;

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    Promise.all([
      fetchRemotePomodoroTotals(user.id),
      fetchRemoteCompletedTodoCount(user.id),
    ])
      .then(([pomodoroTotals, completedTodos]) => {
        if (!isMounted) return;
        setStats({ ...pomodoroTotals, completedTodos });
      })
      .catch(() => {
        // Non-fatal stats fetch failure
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleSaveProfile = async () => {
    setFeedback(null);
    setSaving(true);
    try {
      const { error } = await updateProfile({
        fullName,
        username,
        dailyPomodoroGoal: dailyGoal,
      });

      if (error) {
        setFeedback({ type: 'error', text: error });
      } else {
        setDraftFullName(null);
        setDraftUsername(null);
        setDraftDailyGoal(null);
        setFeedback({ type: 'success', text: 'Profil güncellendi.' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={theme.textMuted} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Hesap
            </Text>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Profil
            </Text>
          </View>

          <View style={styles.guestContainer}>
            <View
              style={[
                styles.guestIconCircle,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                },
              ]}
            >
              <Feather name="user" size={28} color={theme.textMuted} />
            </View>

            <Text style={[styles.guestTitle, { color: theme.textPrimary }]}>
              Hesabına giriş yap
            </Text>
            <Text style={[styles.guestSubtitle, { color: theme.textMuted }]}>
              Görevlerini ve günlük pomodoro odak oturumlarını bulutta güvenle
              sakla.
            </Text>

            <View style={styles.guestActions}>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/auth', params: { mode: 'signIn' } })
                }
                accessibilityRole="button"
                accessibilityLabel="Giriş Yap"
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.accent },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.primaryButtonText, { color: theme.accentText }]}>
                  Giriş Yap
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.push({ pathname: '/auth', params: { mode: 'signUp' } })
                }
                accessibilityRole="button"
                accessibilityLabel="Kayıt Ol"
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: theme.textPrimary },
                  ]}
                >
                  Kayıt Ol
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            <View style={styles.header}>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Hesap
              </Text>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                Profil
              </Text>
            </View>

            <View
              style={[
                styles.identityRow,
                { borderBottomColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: theme.accent },
                ]}
              >
                <Text style={[styles.avatarText, { color: theme.accentText }]}>
                  {getInitials(profile?.full_name, user.email)}
                </Text>
              </View>
              <View style={styles.identityInfo}>
                <Text
                  style={[styles.identityName, { color: theme.textPrimary }]}
                >
                  {profile?.full_name || 'İsimsiz Kullanıcı'}
                </Text>
                <Text style={[styles.identityEmail, { color: theme.textMuted }]}>
                  {user.email}
                </Text>
              </View>
            </View>

            <View
              style={[styles.statsRow, { borderBottomColor: theme.border }]}
            >
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                  {stats.todayFocusCount}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                  Bugün Odak
                </Text>
              </View>

              <View
                style={[styles.statDivider, { backgroundColor: theme.border }]}
              />

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                  {stats.totalFocusMinutes} dk
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                  Toplam Odak
                </Text>
              </View>

              <View
                style={[styles.statDivider, { backgroundColor: theme.border }]}
              />

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                  {stats.completedTodos}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                  Tamamlanan
                </Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: theme.textMuted }]}>
                  Ad Soyad
                </Text>
                <TextInput
                  value={fullName}
                  onChangeText={setDraftFullName}
                  placeholder="Adını ekle"
                  placeholderTextColor={theme.textMuted}
                  accessibilityLabel="Ad Soyad"
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: theme.textMuted }]}>
                  Kullanıcı Adı
                </Text>
                <TextInput
                  value={username}
                  onChangeText={setDraftUsername}
                  placeholder="ornek_kullanici"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Kullanıcı Adı"
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                />
              </View>

              <View style={styles.goalRow}>
                <View>
                  <Text style={[styles.label, { color: theme.textMuted }]}>
                    Günlük Odak Hedefi
                  </Text>
                  <Text
                    style={[styles.goalHint, { color: theme.textPrimary }]}
                  >
                    {dailyGoal} oturum / gün
                  </Text>
                </View>

                <View style={styles.stepper}>
                  <Pressable
                    onPress={() => setDraftDailyGoal(Math.max(1, dailyGoal - 1))}
                    accessibilityRole="button"
                    accessibilityLabel="Hedefi azalt"
                    style={({ pressed }) => [
                      styles.stepperButton,
                      {
                        borderColor: theme.border,
                        backgroundColor: theme.surface,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Feather name="minus" size={16} color={theme.textPrimary} />
                  </Pressable>
                  <Pressable
                    onPress={() => setDraftDailyGoal(Math.min(20, dailyGoal + 1))}
                    accessibilityRole="button"
                    accessibilityLabel="Hedefi artır"
                    style={({ pressed }) => [
                      styles.stepperButton,
                      {
                        borderColor: theme.border,
                        backgroundColor: theme.surface,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Feather name="plus" size={16} color={theme.textPrimary} />
                  </Pressable>
                </View>
              </View>

              {feedback && (
                <Text
                  style={[
                    styles.feedbackText,
                    {
                      color:
                        feedback.type === 'error'
                          ? theme.danger
                          : theme.textPrimary,
                    },
                  ]}
                >
                  {feedback.text}
                </Text>
              )}

              <Pressable
                onPress={handleSaveProfile}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel="Değişiklikleri Kaydet"
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.accent },
                  (pressed || saving) && styles.pressed,
                ]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={theme.accentText} />
                ) : (
                  <Text
                    style={[
                      styles.primaryButtonText,
                      { color: theme.accentText },
                    ]}
                  >
                    Değişiklikleri Kaydet
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={signOut}
                accessibilityRole="button"
                accessibilityLabel="Çıkış Yap"
                style={({ pressed }) => [
                  styles.signOutButton,
                  { borderColor: theme.border },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.signOutText, { color: theme.danger }]}>
                  Çıkış Yap
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
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
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  guestIconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  guestActions: {
    width: '100%',
    maxWidth: 300,
    gap: spacing.md,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  identityInfo: {
    flex: 1,
  },
  identityName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  identityEmail: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
  },
  formSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontSize: 16,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalHint: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepperButton: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackText: {
    fontSize: 13,
  },
  primaryButton: {
    height: 46,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 46,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  signOutButton: {
    height: 44,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.7,
  },
});

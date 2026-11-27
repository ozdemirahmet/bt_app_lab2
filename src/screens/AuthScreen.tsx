import Feather from '@expo/vector-icons/Feather';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthForm, AuthMode } from '../components/AuthForm';
import { getTheme, spacing } from '../theme/tokens';

export function AuthScreen() {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);
  const params = useLocalSearchParams<{ mode?: string }>();
  const initialMode: AuthMode = params.mode === 'signUp' ? 'signUp' : 'signIn';

  const handleSuccess = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'bottom', 'left', 'right']}
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
            <Pressable
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/profile');
                }
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Geri dön"
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Feather name="arrow-left" size={20} color={theme.textPrimary} />
            </Pressable>

            <View style={styles.header}>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Hesap
              </Text>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                Hoş Geldin
              </Text>
              <Text style={[styles.description, { color: theme.textMuted }]}>
                Görevlerini ve pomodoro odak geçmişini hesabınla eşitle.
              </Text>
            </View>

            <AuthForm
              initialMode={initialMode}
              onSuccess={handleSuccess}
              theme={theme}
            />
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
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
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.6,
  },
});

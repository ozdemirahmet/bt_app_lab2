import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ThemeColors, radius, spacing } from '../theme/tokens';

export type AuthMode = 'signIn' | 'signUp';

interface AuthFormProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
  theme: ThemeColors;
}

export function AuthForm({
  initialMode = 'signIn',
  onSuccess,
  theme,
}: AuthFormProps) {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage(null);
    setInfoMessage(null);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (mode === 'signUp' && password !== confirmPassword) {
      setErrorMessage('Şifreler birbiriyle eşleşmiyor.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signIn') {
        const { error } = await signIn(trimmedEmail, password);
        if (error) {
          setErrorMessage(error);
          return;
        }
        onSuccess?.();
        return;
      }

      const { error, needsEmailConfirmation } = await signUp({
        email: trimmedEmail,
        password,
        fullName,
      });

      if (error) {
        setErrorMessage(error);
        return;
      }

      if (needsEmailConfirmation) {
        setInfoMessage(
          'Kayıt oluşturuldu. E-posta adresine gönderilen doğrulama bağlantısını onayladıktan sonra giriş yapabilirsin.',
        );
        setPassword('');
        setConfirmPassword('');
        return;
      }

      onSuccess?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.tabsRow, { borderBottomColor: theme.border }]}
        accessibilityRole="tablist"
      >
        <Pressable
          onPress={() => switchMode('signIn')}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === 'signIn' }}
          style={({ pressed }) => [
            styles.tab,
            mode === 'signIn' && { borderBottomColor: theme.accent },
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.tabLabel,
              {
                color:
                  mode === 'signIn' ? theme.textPrimary : theme.textMuted,
              },
              mode === 'signIn' && styles.tabLabelActive,
            ]}
          >
            Giriş Yap
          </Text>
        </Pressable>

        <Pressable
          onPress={() => switchMode('signUp')}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === 'signUp' }}
          style={({ pressed }) => [
            styles.tab,
            mode === 'signUp' && { borderBottomColor: theme.accent },
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.tabLabel,
              {
                color:
                  mode === 'signUp' ? theme.textPrimary : theme.textMuted,
              },
              mode === 'signUp' && styles.tabLabelActive,
            ]}
          >
            Kayıt Ol
          </Text>
        </Pressable>
      </View>

      <View style={styles.formFields}>
        {mode === 'signUp' && (
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              Ad Soyad (isteğe bağlı)
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Ada Yılmaz"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="words"
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
        )}

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.textMuted }]}>
            E-posta
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@eposta.com"
            placeholderTextColor={theme.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="E-posta"
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
          <Text style={[styles.label, { color: theme.textMuted }]}>Şifre</Text>
          <View
            style={[
              styles.passwordWrapper,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="En az 6 karakter"
              placeholderTextColor={theme.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Şifre"
              onSubmitEditing={mode === 'signIn' ? handleSubmit : undefined}
              style={[styles.passwordInput, { color: theme.textPrimary }]}
            />
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              style={styles.eyeButton}
            >
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={18}
                color={theme.textMuted}
              />
            </Pressable>
          </View>
        </View>

        {mode === 'signUp' && (
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              Şifre Tekrarı
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Şifreni tekrar gir"
              placeholderTextColor={theme.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Şifre Tekrarı"
              onSubmitEditing={handleSubmit}
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
        )}

        {errorMessage && (
          <View
            style={[
              styles.messageBox,
              { borderColor: theme.danger, backgroundColor: theme.surface },
            ]}
          >
            <Text style={[styles.errorText, { color: theme.danger }]}>
              {errorMessage}
            </Text>
          </View>
        )}

        {infoMessage && (
          <View
            style={[
              styles.messageBox,
              { borderColor: theme.border, backgroundColor: theme.surface },
            ]}
          >
            <Text style={[styles.infoText, { color: theme.textPrimary }]}>
              {infoMessage}
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel={mode === 'signIn' ? 'Giriş Yap' : 'Kayıt Ol'}
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: theme.accent },
            (pressed || submitting) && styles.pressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={theme.accentText} />
          ) : (
            <Text style={[styles.submitText, { color: theme.accentText }]}>
              {mode === 'signIn' ? 'Giriş Yap' : 'Hesap Oluştur'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  tab: {
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '600',
  },
  formFields: {
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
    paddingVertical: 13,
    fontSize: 16,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 16,
  },
  eyeButton: {
    padding: spacing.sm,
  },
  messageBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  submitButton: {
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});

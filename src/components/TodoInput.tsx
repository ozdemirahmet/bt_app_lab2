import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ThemeColors, radius, spacing } from '../theme/tokens';

interface TodoInputProps {
  onAdd: (title: string) => boolean;
  theme: ThemeColors;
}

export function TodoInput({ onAdd, theme }: TodoInputProps) {
  const [text, setText] = useState('');
  const canSubmit = text.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const added = onAdd(text);
    if (added) {
      setText('');
    }
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          placeholder="Yeni bir görev ekle..."
          placeholderTextColor={theme.textMuted}
          returnKeyType="done"
          accessibilityLabel="Yeni görev metni"
          style={[styles.input, { color: theme.textPrimary }]}
        />

        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel="Görev ekle"
          accessibilityState={{ disabled: !canSubmit }}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: canSubmit ? theme.accent : theme.surfaceSubtle,
            },
            pressed && canSubmit && styles.pressed,
          ]}
        >
          <Feather
            name="plus"
            size={18}
            color={canSubmit ? theme.accentText : theme.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  submitButton: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});

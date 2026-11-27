import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemeColors, spacing } from '../theme/tokens';
import { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  theme: ThemeColors;
}

export function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
  theme,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);

  const startEditing = () => {
    setDraftTitle(todo.title);
    setIsEditing(true);
  };

  const commitEdit = () => {
    const trimmed = draftTitle.trim();
    if (trimmed && trimmed !== todo.title) {
      onUpdate(todo.id, trimmed);
    } else {
      setDraftTitle(todo.title);
    }
    setIsEditing(false);
  };

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <Pressable
        onPress={() => onToggle(todo.id)}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.completed }}
        accessibilityLabel={`${todo.title} görevini ${
          todo.completed ? 'tamamlanmadı olarak işaretle' : 'tamamla'
        }`}
        style={({ pressed }) => [
          styles.checkbox,
          {
            borderColor: todo.completed ? theme.accent : theme.textMuted,
            backgroundColor: todo.completed ? theme.accent : 'transparent',
          },
          pressed && styles.pressed,
        ]}
      >
        {todo.completed && (
          <Feather name="check" size={13} color={theme.accentText} />
        )}
      </Pressable>

      <View style={styles.content}>
        {isEditing ? (
          <TextInput
            value={draftTitle}
            onChangeText={setDraftTitle}
            onBlur={commitEdit}
            onSubmitEditing={commitEdit}
            autoFocus
            returnKeyType="done"
            accessibilityLabel="Görev başlığını düzenle"
            style={[
              styles.editInput,
              {
                color: theme.textPrimary,
                borderBottomColor: theme.accent,
              },
            ]}
          />
        ) : (
          <Pressable
            onPress={startEditing}
            accessibilityRole="button"
            accessibilityLabel={`${todo.title} görevini düzenle`}
            style={styles.titleButton}
          >
            <Text
              style={[
                styles.title,
                { color: todo.completed ? theme.textMuted : theme.textPrimary },
                todo.completed && styles.titleCompleted,
              ]}
            >
              {todo.title}
            </Text>
          </Pressable>
        )}
      </View>

      <Pressable
        onPress={() => onDelete(todo.id)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={`${todo.title} görevini sil`}
        style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
      >
        <Feather name="x" size={17} color={theme.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  titleButton: {
    paddingVertical: 2,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.65,
  },
  editInput: {
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 2,
    borderBottomWidth: 1,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  pressed: {
    opacity: 0.5,
  },
});

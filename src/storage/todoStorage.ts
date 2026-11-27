import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../types/todo';

export const TODO_STORAGE_KEY = '@minimal_todo_items_v1';

function isValidTodo(item: unknown): item is Todo {
  if (typeof item !== 'object' || item === null) return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.completed === 'boolean' &&
    typeof candidate.createdAt === 'number' &&
    typeof candidate.updatedAt === 'number'
  );
}

/**
 * Loads persisted todos from local AsyncStorage.
 * Returns an empty array if storage is empty or contains invalid JSON.
 */
export async function loadTodos(): Promise<Todo[]> {
  try {
    const raw = await AsyncStorage.getItem(TODO_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidTodo);
  } catch {
    return [];
  }
}

/**
 * Persists the current todo list to local AsyncStorage.
 */
export async function saveTodos(todos: Todo[]): Promise<void> {
  await AsyncStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
}

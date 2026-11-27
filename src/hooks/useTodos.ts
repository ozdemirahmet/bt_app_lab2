import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOptionalAuth } from '../context/AuthContext';
import {
  deleteCompletedRemoteTodos,
  deleteRemoteTodo,
  fetchRemoteTodos,
  insertRemoteTodo,
  syncLocalTodosToRemote,
  updateRemoteTodo,
} from '../storage/remoteTodoStorage';
import { loadTodos, saveTodos } from '../storage/todoStorage';
import { Todo, TodoCounts, TodoFilter } from '../types/todo';
import { triggerLightImpact, triggerSelectionHaptic } from '../utils/haptics';
import { createUuid } from '../utils/uuid';

export function useTodos() {
  const auth = useOptionalAuth();
  const userId = auth?.user?.id ?? null;

  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [hydratedScope, setHydratedScope] = useState<string | null>(null);
  const scopeKey = userId ?? 'local';
  const isLoading = hydratedScope !== scopeKey;

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      try {
        if (userId) {
          const localTodos = await loadTodos();
          if (localTodos.length > 0) {
            await syncLocalTodosToRemote(userId, localTodos);
            await saveTodos([]);
          }
          const remoteTodos = await fetchRemoteTodos(userId);
          if (!isMounted) return;
          setTodos(remoteTodos);
        } else {
          const localTodos = await loadTodos();
          if (!isMounted) return;
          setTodos(localTodos);
        }
      } catch {
        if (!isMounted) return;
        if (!userId) {
          setTodos([]);
        }
      } finally {
        if (isMounted) {
          setHydratedScope(scopeKey);
        }
      }
    }

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [userId, scopeKey]);

  useEffect(() => {
    if (userId) return;
    if (hydratedScope !== 'local') return;
    saveTodos(todos).catch(() => {
      // Storage errors should not interrupt the interactive UI
    });
  }, [todos, userId, hydratedScope]);

  const addTodo = useCallback(
    (rawTitle: string): boolean => {
      const title = rawTitle.trim();
      if (!title) return false;

      const now = Date.now();
      const newTodo: Todo = {
        id: createUuid(),
        title,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      setTodos((prev) => [newTodo, ...prev]);
      void triggerLightImpact();

      if (userId) {
        insertRemoteTodo(userId, newTodo).catch(() => {
          // Keep optimistic item in UI if offline
        });
      }
      return true;
    },
    [userId],
  );

  const toggleTodo = useCallback(
    (id: string) => {
      let nextCompleted: boolean | null = null;
      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id !== id) return todo;
          nextCompleted = !todo.completed;
          return { ...todo, completed: nextCompleted, updatedAt: Date.now() };
        }),
      );
      void triggerSelectionHaptic();

      if (userId && nextCompleted !== null) {
        updateRemoteTodo(userId, id, { completed: nextCompleted }).catch(() => {});
      }
    },
    [userId],
  );

  const updateTodo = useCallback(
    (id: string, rawTitle: string) => {
      const title = rawTitle.trim();
      if (!title) return;

      let changed = false;
      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id === id && todo.title !== title) {
            changed = true;
            return { ...todo, title, updatedAt: Date.now() };
          }
          return todo;
        }),
      );

      if (userId && changed) {
        updateRemoteTodo(userId, id, { title }).catch(() => {});
      }
    },
    [userId],
  );

  const deleteTodo = useCallback(
    (id: string) => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      void triggerLightImpact();

      if (userId) {
        deleteRemoteTodo(userId, id).catch(() => {});
      }
    },
    [userId],
  );

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
    void triggerLightImpact();

    if (userId) {
      deleteCompletedRemoteTodos(userId).catch(() => {});
    }
  }, [userId]);

  const counts = useMemo<TodoCounts>(() => {
    let completed = 0;
    for (const todo of todos) {
      if (todo.completed) completed += 1;
    }
    return {
      total: todos.length,
      active: todos.length - completed,
      completed,
    };
  }, [todos]);

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed);
    if (filter === 'completed') return todos.filter((todo) => todo.completed);
    return todos;
  }, [todos, filter]);

  return {
    todos,
    filteredTodos,
    filter,
    setFilter,
    counts,
    isLoading,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
  };
}

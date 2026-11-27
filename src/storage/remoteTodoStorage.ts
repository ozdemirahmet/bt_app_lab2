import { supabase } from '../lib/supabase';
import { TodoRow } from '../types/database';
import { Todo } from '../types/todo';
import { createUuid, isValidUuid } from '../utils/uuid';

function mapRowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export async function fetchRemoteTodos(userId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }
  return data.map(mapRowToTodo);
}

export async function insertRemoteTodo(
  userId: string,
  todo: Todo,
): Promise<void> {
  const { error } = await supabase.from('todos').insert({
    id: isValidUuid(todo.id) ? todo.id : createUuid(),
    user_id: userId,
    title: todo.title,
    completed: todo.completed,
    created_at: new Date(todo.createdAt).toISOString(),
    updated_at: new Date(todo.updatedAt).toISOString(),
  });
  if (error) throw error;
}

export async function updateRemoteTodo(
  userId: string,
  id: string,
  fields: { title?: string; completed?: boolean },
): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .update(fields)
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteRemoteTodo(
  userId: string,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteCompletedRemoteTodos(
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('user_id', userId)
    .eq('completed', true);
  if (error) throw error;
}

export async function syncLocalTodosToRemote(
  userId: string,
  localTodos: Todo[],
): Promise<void> {
  if (localTodos.length === 0) return;

  const rows = localTodos.map((todo) => ({
    id: isValidUuid(todo.id) ? todo.id : createUuid(),
    user_id: userId,
    title: todo.title,
    completed: todo.completed,
    created_at: new Date(todo.createdAt).toISOString(),
    updated_at: new Date(todo.updatedAt).toISOString(),
  }));

  const { error } = await supabase
    .from('todos')
    .upsert(rows, { onConflict: 'id' });
  if (error) throw error;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TODO_STORAGE_KEY, loadTodos, saveTodos } from '../storage/todoStorage';
import { Todo } from '../types/todo';

describe('todoStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns an empty array when storage has no data', async () => {
    const todos = await loadTodos();
    expect(todos).toEqual([]);
  });

  it('returns an empty array when stored JSON is corrupted', async () => {
    await AsyncStorage.setItem(TODO_STORAGE_KEY, '{invalid-json');
    const todos = await loadTodos();
    expect(todos).toEqual([]);
  });

  it('returns an empty array when stored JSON is not an array', async () => {
    await AsyncStorage.setItem(TODO_STORAGE_KEY, JSON.stringify({ hello: 'world' }));
    const todos = await loadTodos();
    expect(todos).toEqual([]);
  });

  it('filters out malformed entries and keeps valid todos', async () => {
    const validTodo: Todo = {
      id: '1',
      title: 'Kitap oku',
      completed: false,
      createdAt: 1000,
      updatedAt: 1000,
    };

    await AsyncStorage.setItem(
      TODO_STORAGE_KEY,
      JSON.stringify([validTodo, { id: 123, title: 'Bozuk' }, null]),
    );

    const todos = await loadTodos();
    expect(todos).toEqual([validTodo]);
  });

  it('saves and reloads todos accurately', async () => {
    const sampleTodos: Todo[] = [
      {
        id: '1',
        title: 'Kahve al',
        completed: true,
        createdAt: 1700000000000,
        updatedAt: 1700000001000,
      },
    ];

    await saveTodos(sampleTodos);
    const loaded = await loadTodos();
    expect(loaded).toEqual(sampleTodos);
  });
});

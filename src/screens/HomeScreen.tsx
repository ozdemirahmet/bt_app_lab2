import React, { useMemo } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { FilterTabs } from '../components/FilterTabs';
import { Header } from '../components/Header';
import { TodoInput } from '../components/TodoInput';
import { TodoItem } from '../components/TodoItem';
import { useTodos } from '../hooks/useTodos';
import { getTheme } from '../theme/tokens';
import { Todo } from '../types/todo';

export function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);

  const {
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
  } = useTodos();

  const renderItem = ({ item }: { item: Todo }) => (
    <TodoItem
      todo={item}
      onToggle={toggleTodo}
      onUpdate={updateTodo}
      onDelete={deleteTodo}
      theme={theme}
    />
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.innerContainer}>
          <Header
            counts={counts}
            onClearCompleted={clearCompleted}
            theme={theme}
          />

          <FilterTabs
            filter={filter}
            counts={counts}
            onChangeFilter={setFilter}
            theme={theme}
          />

          <FlatList
            data={filteredTodos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              filteredTodos.length === 0 ? styles.emptyListContent : undefined
            }
            ListEmptyComponent={
              <EmptyState filter={filter} isLoading={isLoading} theme={theme} />
            }
          />

          <TodoInput onAdd={addTodo} theme={theme} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  emptyListContent: {
    flexGrow: 1,
  },
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from '../screens/HomeScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

async function renderHome() {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <HomeScreen />
    </SafeAreaProvider>,
  );
}

describe('HomeScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('shows empty state initially and allows adding a todo', async () => {
    await renderHome();

    expect(await screen.findByText('Henüz görev yok')).toBeTruthy();

    const input = screen.getByLabelText('Yeni görev metni');
    const addButton = screen.getByLabelText('Görev ekle');

    // Empty or whitespace input should not create a todo
    await fireEvent.changeText(input, '   ');
    await fireEvent.press(addButton);
    expect(screen.getByText('Henüz görev yok')).toBeTruthy();

    // Valid input creates a todo
    await fireEvent.changeText(input, 'Tasarımı gözden geçir');
    await fireEvent.press(addButton);

    expect(await screen.findByText('Tasarımı gözden geçir')).toBeTruthy();
    expect(screen.getByText('1 aktif görev')).toBeTruthy();
  });

  it('toggles completion, filters tasks, and clears completed items', async () => {
    await renderHome();
    await screen.findByText('Henüz görev yok');

    const input = screen.getByLabelText('Yeni görev metni');
    const addButton = screen.getByLabelText('Görev ekle');

    await fireEvent.changeText(input, 'E-postaları yanıtla');
    await fireEvent.press(addButton);
    await fireEvent.changeText(input, 'Su iç');
    await fireEvent.press(addButton);

    const toggleFirst = screen.getByLabelText('Su iç görevini tamamla');
    await fireEvent.press(toggleFirst);

    await waitFor(() => {
      expect(screen.getByText('1 aktif görev')).toBeTruthy();
    });

    // Filter to Aktif
    await fireEvent.press(screen.getByRole('tab', { name: /Aktif/ }));
    expect(screen.getByText('E-postaları yanıtla')).toBeTruthy();
    expect(screen.queryByText('Su iç')).toBeNull();

    // Filter to Tamamlanan
    await fireEvent.press(screen.getByRole('tab', { name: /Tamamlanan/ }));
    expect(screen.getByText('Su iç')).toBeTruthy();
    expect(screen.queryByText('E-postaları yanıtla')).toBeNull();

    // Clear completed
    await fireEvent.press(screen.getByLabelText('Tamamlanan görevleri temizle'));
    expect(await screen.findByText('Tamamlanan görev yok')).toBeTruthy();

    // Switch back to Tümü and verify active item remains
    await fireEvent.press(screen.getByRole('tab', { name: /Tümü/ }));
    expect(screen.getByText('E-postaları yanıtla')).toBeTruthy();
  });

  it('edits and deletes an existing todo', async () => {
    await renderHome();
    await screen.findByText('Henüz görev yok');

    const input = screen.getByLabelText('Yeni görev metni');
    await fireEvent.changeText(input, 'Eski başlık');
    await fireEvent(input, 'submitEditing');

    expect(await screen.findByText('Eski başlık')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Eski başlık görevini düzenle'));
    const editInput = screen.getByLabelText('Görev başlığını düzenle');
    await fireEvent.changeText(editInput, 'Güncel başlık');
    await fireEvent(editInput, 'submitEditing');

    expect(await screen.findByText('Güncel başlık')).toBeTruthy();
    expect(screen.queryByText('Eski başlık')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Güncel başlık görevini sil'));
    expect(await screen.findByText('Henüz görev yok')).toBeTruthy();
  });
});

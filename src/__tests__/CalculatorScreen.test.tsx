import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CalculatorScreen } from '../screens/CalculatorScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

async function renderCalculator() {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <CalculatorScreen />
    </SafeAreaProvider>,
  );
}

describe('CalculatorScreen', () => {
  it('performs multiplication and displays result and expression', async () => {
    await renderCalculator();

    expect(screen.getByText('Hesap Makinesi')).toBeTruthy();
    expect(screen.getByLabelText('Sonuç 0')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: '7' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Çarp' }));
    await fireEvent.press(screen.getByRole('button', { name: '8' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Eşittir' }));

    expect(screen.getByLabelText('Sonuç 56')).toBeTruthy();
    expect(screen.getByText('7 × 8 =')).toBeTruthy();
  });

  it('handles backspace, clear, and division by zero', async () => {
    await renderCalculator();

    await fireEvent.press(screen.getByRole('button', { name: '1' }));
    await fireEvent.press(screen.getByRole('button', { name: '2' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Son rakamı sil' }));
    expect(screen.getByLabelText('Sonuç 1')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Böl' }));
    await fireEvent.press(screen.getByRole('button', { name: '0' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Eşittir' }));
    expect(screen.getByLabelText('Sonuç Hata')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Tümünü temizle' }));
    expect(screen.getByLabelText('Sonuç 0')).toBeTruthy();
  });
});

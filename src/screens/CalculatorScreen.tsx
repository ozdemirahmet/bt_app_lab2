import Feather from '@expo/vector-icons/Feather';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTheme, radius, spacing } from '../theme/tokens';
import {
  CalculatorOperator,
  CalculatorState,
  INITIAL_CALCULATOR_STATE,
  applyPercent,
  backspaceDigit,
  calculateEquals,
  chooseOperator,
  clearCalculator,
  inputDecimal,
  inputDigit,
  toggleSign,
} from '../utils/calculator';
import { triggerLightImpact, triggerSelectionHaptic } from '../utils/haptics';

type KeyKind = 'digit' | 'utility' | 'operator' | 'equals';

interface KeyConfig {
  label: string;
  accessibilityLabel: string;
  kind: KeyKind;
  onPress: (state: CalculatorState) => CalculatorState;
  icon?: 'delete';
}

const KEY_ROWS: KeyConfig[][] = [
  [
    {
      label: 'AC',
      accessibilityLabel: 'Tümünü temizle',
      kind: 'utility',
      onPress: () => clearCalculator(),
    },
    {
      label: '⌫',
      accessibilityLabel: 'Son rakamı sil',
      kind: 'utility',
      icon: 'delete',
      onPress: backspaceDigit,
    },
    {
      label: '%',
      accessibilityLabel: 'Yüzde',
      kind: 'utility',
      onPress: applyPercent,
    },
    {
      label: '÷',
      accessibilityLabel: 'Böl',
      kind: 'operator',
      onPress: (s) => chooseOperator(s, '÷'),
    },
  ],
  [
    {
      label: '7',
      accessibilityLabel: '7',
      kind: 'digit',
      onPress: (s) => inputDigit(s, '7'),
    },
    {
      label: '8',
      accessibilityLabel: '8',
      kind: 'digit',
      onPress: (s) => inputDigit(s, '8'),
    },
    {
      label: '9',
      accessibilityLabel: '9',
      kind: 'digit',
      onPress: (s) => inputDigit(s, '9'),
    },
    {
      label: '×',
      accessibilityLabel: 'Çarp',
      kind: 'operator',
      onPress: (s) => chooseOperator(s, '×'),
    },
  ],
  [
    {
      label: '4',
      accessibilityLabel: '4',
      kind: 'digit',
      onPress: (s) => inputDigit(s, '4'),
    },
    {
      label: '5',
      accessibilityLabel: '5',
      kind: 'digit',
      onPress: (s) => inputDigit(s, '5'),
    },
    {
      label: '6',
      accessibilityLabel: '6',
      kind: 'digit',
      onPress: (s) => inputDigit(s, '6'),
    },
    {
      label: '-',
      accessibilityLabel: 'Çıkar',
      kind: 'operator',
      onPress: (s) => chooseOperator(s, '-'),
    },
  ],
  [
    {
      label: '1',
      accessibilityLabel: '1',
      kind: 'digit',
      onPress: (s) => inputDigit(s, '1'),
    },
    {
      label: '2',
      accessibilityLabel: '2',
      kind: 'digit',
      onPress: (s) => inputDigit(s, '2'),
    },
    {
      label: '3',
      accessibilityLabel: '3',
      kind: 'digit',
      onPress: (s) => inputDigit(s, '3'),
    },
    {
      label: '+',
      accessibilityLabel: 'Topla',
      kind: 'operator',
      onPress: (s) => chooseOperator(s, '+'),
    },
  ],
  [
    {
      label: '±',
      accessibilityLabel: 'İşaret değiştir',
      kind: 'utility',
      onPress: toggleSign,
    },
    {
      label: '0',
      accessibilityLabel: '0',
      kind: 'digit',
      onPress: (s) => inputDigit(s, '0'),
    },
    {
      label: '.',
      accessibilityLabel: 'Ondalık nokta',
      kind: 'digit',
      onPress: inputDecimal,
    },
    {
      label: '=',
      accessibilityLabel: 'Eşittir',
      kind: 'equals',
      onPress: calculateEquals,
    },
  ],
];

export function CalculatorScreen() {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);
  const [state, setState] = useState<CalculatorState>(INITIAL_CALCULATOR_STATE);

  const handleKeyPress = (key: KeyConfig) => {
    setState((prev) => key.onPress(prev));
    if (key.kind === 'equals' || key.label === 'AC') {
      void triggerLightImpact();
    } else {
      void triggerSelectionHaptic();
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Araçlar
          </Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Hesap Makinesi
          </Text>
        </View>

        <View
          style={[styles.displaySection, { borderBottomColor: theme.border }]}
        >
          <Text
            numberOfLines={1}
            style={[styles.expressionText, { color: theme.textMuted }]}
          >
            {state.expression || ' '}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            accessibilityLabel={`Sonuç ${state.display}`}
            style={[
              styles.resultText,
              {
                color: state.hasError ? theme.danger : theme.textPrimary,
              },
            ]}
          >
            {state.display}
          </Text>
        </View>

        <View style={styles.keypad}>
          {KEY_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((key) => {
                const isSelectedOperator =
                  key.kind === 'operator' &&
                  state.waitingForOperand &&
                  state.operator === (key.label as CalculatorOperator);

                const backgroundColor =
                  key.kind === 'equals' || isSelectedOperator
                    ? theme.accent
                    : key.kind === 'utility' || key.kind === 'operator'
                      ? theme.surfaceSubtle
                      : theme.surface;

                const textColor =
                  key.kind === 'equals' || isSelectedOperator
                    ? theme.accentText
                    : key.kind === 'utility'
                      ? theme.textMuted
                      : theme.textPrimary;

                return (
                  <Pressable
                    key={key.label}
                    onPress={() => handleKeyPress(key)}
                    accessibilityRole="button"
                    accessibilityLabel={key.accessibilityLabel}
                    style={({ pressed }) => [
                      styles.keyButton,
                      {
                        backgroundColor,
                        borderColor: theme.border,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    {key.icon ? (
                      <Feather name={key.icon} size={20} color={textColor} />
                    ) : (
                      <Text
                        style={[
                          styles.keyLabel,
                          { color: textColor },
                          (key.kind === 'operator' || key.kind === 'equals') &&
                            styles.operatorLabel,
                        ]}
                      >
                        {key.label}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: -0.6,
  },
  displaySection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  expressionText: {
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.xs,
  },
  resultText: {
    fontSize: 56,
    fontWeight: '300',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  keypad: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  keyButton: {
    flex: 1,
    height: 60,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyLabel: {
    fontSize: 22,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
  },
  operatorLabel: {
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.65,
  },
});

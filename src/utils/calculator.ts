export type CalculatorOperator = '+' | '-' | '×' | '÷';

export interface CalculatorState {
  display: string;
  previousValue: number | null;
  operator: CalculatorOperator | null;
  waitingForOperand: boolean;
  expression: string;
  hasError: boolean;
}

export const INITIAL_CALCULATOR_STATE: CalculatorState = {
  display: '0',
  previousValue: null,
  operator: null,
  waitingForOperand: false,
  expression: '',
  hasError: false,
};

const MAX_DISPLAY_LENGTH = 14;

export function formatCalculatorNumber(value: number): string {
  if (!Number.isFinite(value)) return 'Hata';
  const normalized = Number(value.toPrecision(12));
  const normalizedZero = Object.is(normalized, -0) ? 0 : normalized;
  const text = String(normalizedZero);
  if (text.length <= MAX_DISPLAY_LENGTH) return text;
  return normalizedZero.toExponential(6).replace(/\.?0+e/, 'e');
}

function evaluate(
  left: number,
  right: number,
  operator: CalculatorOperator,
): number | null {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      if (right === 0) return null;
      return left / right;
  }
}

export function clearCalculator(): CalculatorState {
  return INITIAL_CALCULATOR_STATE;
}

export function inputDigit(
  state: CalculatorState,
  digit: string,
): CalculatorState {
  if (state.hasError) {
    return {
      ...INITIAL_CALCULATOR_STATE,
      display: digit,
    };
  }

  if (state.waitingForOperand) {
    return {
      ...state,
      display: digit,
      waitingForOperand: false,
      expression: state.operator ? state.expression : '',
    };
  }

  if (state.display === '0') {
    return {
      ...state,
      display: digit,
    };
  }

  if (state.display.replace('-', '').replace('.', '').length >= MAX_DISPLAY_LENGTH) {
    return state;
  }

  return {
    ...state,
    display: `${state.display}${digit}`,
  };
}

export function inputDecimal(state: CalculatorState): CalculatorState {
  if (state.hasError) {
    return {
      ...INITIAL_CALCULATOR_STATE,
      display: '0.',
    };
  }

  if (state.waitingForOperand) {
    return {
      ...state,
      display: '0.',
      waitingForOperand: false,
      expression: state.operator ? state.expression : '',
    };
  }

  if (state.display.includes('.')) {
    return state;
  }

  return {
    ...state,
    display: `${state.display}.`,
  };
}

export function toggleSign(state: CalculatorState): CalculatorState {
  if (state.hasError || state.display === '0') {
    return state;
  }

  return {
    ...state,
    display: state.display.startsWith('-')
      ? state.display.slice(1)
      : `-${state.display}`,
  };
}

export function applyPercent(state: CalculatorState): CalculatorState {
  if (state.hasError) return state;
  const current = Number(state.display);
  const nextValue = formatCalculatorNumber(current / 100);
  if (nextValue === 'Hata') {
    return { ...INITIAL_CALCULATOR_STATE, display: 'Hata', hasError: true };
  }
  return {
    ...state,
    display: nextValue,
  };
}

export function backspaceDigit(state: CalculatorState): CalculatorState {
  if (state.hasError) {
    return INITIAL_CALCULATOR_STATE;
  }

  if (state.waitingForOperand) {
    return state;
  }

  if (
    state.display.length <= 1 ||
    (state.display.length === 2 && state.display.startsWith('-'))
  ) {
    return {
      ...state,
      display: '0',
    };
  }

  return {
    ...state,
    display: state.display.slice(0, -1),
  };
}

export function chooseOperator(
  state: CalculatorState,
  nextOperator: CalculatorOperator,
): CalculatorState {
  if (state.hasError) return state;

  const currentValue = Number(state.display);

  if (state.operator && !state.waitingForOperand && state.previousValue !== null) {
    const computed = evaluate(state.previousValue, currentValue, state.operator);
    if (computed === null) {
      return {
        ...INITIAL_CALCULATOR_STATE,
        display: 'Hata',
        hasError: true,
      };
    }

    const formatted = formatCalculatorNumber(computed);
    if (formatted === 'Hata') {
      return {
        ...INITIAL_CALCULATOR_STATE,
        display: 'Hata',
        hasError: true,
      };
    }

    return {
      display: formatted,
      previousValue: computed,
      operator: nextOperator,
      waitingForOperand: true,
      expression: `${formatted} ${nextOperator}`,
      hasError: false,
    };
  }

  const formattedCurrent = formatCalculatorNumber(currentValue);
  return {
    ...state,
    previousValue: currentValue,
    operator: nextOperator,
    waitingForOperand: true,
    expression: `${formattedCurrent} ${nextOperator}`,
  };
}

export function calculateEquals(state: CalculatorState): CalculatorState {
  if (state.hasError || state.operator === null || state.previousValue === null) {
    return state;
  }

  const rightValue = Number(state.display);
  const computed = evaluate(state.previousValue, rightValue, state.operator);
  if (computed === null) {
    return {
      ...INITIAL_CALCULATOR_STATE,
      display: 'Hata',
      hasError: true,
    };
  }

  const formattedResult = formatCalculatorNumber(computed);
  if (formattedResult === 'Hata') {
    return {
      ...INITIAL_CALCULATOR_STATE,
      display: 'Hata',
      hasError: true,
    };
  }

  return {
    display: formattedResult,
    previousValue: null,
    operator: null,
    waitingForOperand: true,
    expression: `${formatCalculatorNumber(state.previousValue)} ${state.operator} ${formatCalculatorNumber(rightValue)} =`,
    hasError: false,
  };
}

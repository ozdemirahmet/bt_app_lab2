import {
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

describe('calculator utils', () => {
  it('handles basic arithmetic and avoids floating-point noise', () => {
    let state = INITIAL_CALCULATOR_STATE;
    state = inputDigit(state, '0');
    state = inputDecimal(state);
    state = inputDigit(state, '1');
    state = chooseOperator(state, '+');
    state = inputDigit(state, '0');
    state = inputDecimal(state);
    state = inputDigit(state, '2');
    state = calculateEquals(state);

    expect(state.display).toBe('0.3');
    expect(state.expression).toBe('0.1 + 0.2 =');
  });

  it('chains operations and evaluates left-to-right', () => {
    let state = INITIAL_CALCULATOR_STATE;
    state = inputDigit(state, '2');
    state = chooseOperator(state, '+');
    state = inputDigit(state, '3');
    state = chooseOperator(state, '×');
    expect(state.display).toBe('5');

    state = inputDigit(state, '4');
    state = calculateEquals(state);
    expect(state.display).toBe('20');
  });

  it('handles division by zero and recovers on next digit', () => {
    let state = INITIAL_CALCULATOR_STATE;
    state = inputDigit(state, '9');
    state = chooseOperator(state, '÷');
    state = inputDigit(state, '0');
    state = calculateEquals(state);

    expect(state.hasError).toBe(true);
    expect(state.display).toBe('Hata');

    state = inputDigit(state, '5');
    expect(state.hasError).toBe(false);
    expect(state.display).toBe('5');
  });

  it('supports sign toggle, percent, backspace, and clear', () => {
    let state = INITIAL_CALCULATOR_STATE;
    state = inputDigit(state, '5');
    state = inputDigit(state, '0');
    state = toggleSign(state);
    expect(state.display).toBe('-50');

    state = applyPercent(state);
    expect(state.display).toBe('-0.5');

    state = backspaceDigit(state);
    expect(state.display).toBe('-0.');

    state = clearCalculator();
    expect(state).toEqual(INITIAL_CALCULATOR_STATE);
  });
});

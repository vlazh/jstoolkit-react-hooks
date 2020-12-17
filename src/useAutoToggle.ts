import { useCallback, useEffect, useMemo, useRef } from 'react';
import debounce from 'lodash.debounce';
import useStateChange from './useStateChange';

export interface ActivateOptions {
  force?: boolean;
  noWait?: boolean;
}

export interface Activate {
  (options: ActivateOptions): void;
  (force: boolean): void;
  (): void;
}

/** [isActive(), activate(), deactivate(), cancel()] */
export type UseAutoToggleResult = [
  isActive: () => boolean,
  activate: Activate,
  deactivate: () => void,
  cancel: () => void
];

export interface UseAutoToggleProps {
  initialValue?: boolean;
  disabled?: boolean;
  /**
   * Time in milliseconds after which an active set to false.
   * If <= 0 then timer creation is disabled.
   */
  wait?: number;
}

/** Useful for tracking user interaction. */
export default function useAutoToggle({
  initialValue,
  disabled,
  wait = 3000,
}: UseAutoToggleProps = {}): UseAutoToggleResult {
  const [isActive, , setActive] = useStateChange(!!initialValue && !disabled);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const deactivateDebounced = useMemo(() => {
    return debounce(() => setActive(false), wait);
  }, [setActive, wait]);

  const activate = useCallback(
    (options: ActivateOptions | boolean = {}) => {
      const { force, noWait = false } = typeof options === 'boolean' ? { force: options } : options;
      if (
        disabledRef.current &&
        // Ignore non boolean value
        (force == null || force === false || typeof force !== 'boolean')
      ) {
        return;
      }
      if (!isActive()) {
        setActive(true);
      }
      // Do not debounce if disabled
      if (wait <= 0 || noWait === true) {
        deactivateDebounced.cancel();
        return;
      }
      deactivateDebounced();
    },
    [deactivateDebounced, isActive, setActive, wait]
  );

  const deactivate = useCallback(() => {
    deactivateDebounced.cancel();
    if (isActive()) {
      setActive(false);
    }
  }, [deactivateDebounced, isActive, setActive]);

  useEffect(() => {
    if (initialValue && !disabled) {
      activate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deactivate early if disabled changed to `true`
  useEffect(
    () => () => {
      !disabled && deactivate();
    },
    [deactivate, disabled]
  );

  // Cancel early if wait changed or unmount
  useEffect(() => () => deactivateDebounced.cancel(), [deactivateDebounced]);

  // eslint-disable-next-line @typescript-eslint/unbound-method
  return [isActive, activate, deactivate, deactivateDebounced.cancel];
}

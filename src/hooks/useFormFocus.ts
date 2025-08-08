import { useCallback, useRef, useState } from "react";
import { UseFormFocusObject } from "../types";

type UseFormFocusReturn = {
  focus: UseFormFocusObject;
};

/**
 * Tracks currently focused form field and provides focus handlers.
 * Uses ref to avoid stale closures in event handlers.
 */
export function useFormFocus(): UseFormFocusReturn {
  // current focused field state
  const [focusedField, setFocusedFieldState] = useState<string | null>(null);
  // last focused color field state (only color fields, not other form fields)
  const [lastFocusedColorField, setLastFocusedColorField] = useState<string | null>(null);

  // Use ref to avoid stale closures in event handlers
  const focusedFieldRef = useRef<string | null>(null);

  /**
   * Updates the focused field state.
   */
  const setFocusedField = useCallback((fieldId: string | null) => {
    setFocusedFieldState(fieldId);
    focusedFieldRef.current = fieldId;

    // Track last focused color field specifically
    if (fieldId && fieldId.startsWith("color")) {
      setLastFocusedColorField(fieldId);
    }
  }, []);

  /**
   * Creates onFocus and onBlur handlers for a form field.
   */
  const createFocusHandlers = useCallback(
    (fieldId: string) => {
      return {
        onFocus: () => {
          setFocusedField(fieldId);
        },
        onBlur: () => {
          // Only clear if this field was actually focused
          // Prevents race conditions when quickly switching between fields
          if (focusedFieldRef.current === fieldId) {
            setFocusedField(null);
          }
        },
      };
    },
    [setFocusedField],
  );

  return {
    focus: {
      field: focusedField,
      lastColorField: lastFocusedColorField,
      set: setFocusedField,
      create: createFocusHandlers,
    },
  };
}

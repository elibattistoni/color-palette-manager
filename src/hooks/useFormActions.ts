import { CLEAR_FORM_VALUES } from "../constants";
import {
  PaletteFormFields,
  UseFormActionsObject,
  UseFormColorsObject,
  UseFormFocusObject,
  UseFormKeywordsObject,
  UseFormPaletteObject,
} from "../types";

type UseFormActionsReturn = {
  formActions: UseFormActionsObject;
};

/**
 * Coordinates form actions across multiple concerns (colors, keywords, focus).
 * Acts as a behavioral orchestrator for complex form interactions.
 */
export function useFormActions({
  colorFields,
  form,
  focus,
  keywords,
}: {
  colorFields: UseFormColorsObject;
  form: UseFormPaletteObject;
  focus: UseFormFocusObject;
  keywords: UseFormKeywordsObject;
}): UseFormActionsReturn {
  /**
   * Clears the form and resets to initial state.
   */
  const clear = () => {
    colorFields.resetColors();
    form.reset(CLEAR_FORM_VALUES);
  };

  /**
   * Adds a new color field and focuses on it.
   */
  const addColor = () => {
    // Calculate the new field ID before state update to avoid race conditions
    const newColorFieldId = `color${colorFields.count + 1}`;

    // Add the new color field (async state update)
    colorFields.addColor();

    // Focus on the newly added color field with a delay to ensure DOM is updated
    setTimeout(() => {
      focus.set(newColorFieldId);
    }, 50); // Sufficient delay for state update and DOM rendering
  };

  /**
   * Removes the last color field and refocuses.
   */
  const removeColor = () => {
    if (colorFields.count > 1) {
      // Clear the value of the last color field before removing it
      const lastColorField = `color${colorFields.count}` as keyof PaletteFormFields;
      form.update(lastColorField, "");

      // Remove the color field from the UI
      colorFields.removeColor();

      // Focus on the new last color field after removal
      const newLastColorField = `color${colorFields.count - 1}`;
      focus.set(newLastColorField);
    }
  };

  /**
   * Handles keyword input parsing and form state updates.
   */
  const updateKeywords = async (keywordsText: string) => {
    const result = await keywords.update(keywordsText);
    form.update("keywords", (prev: string[]) => [...prev, ...result.validKeywords]);
    return result;
  };

  const getPreview = () => ({
    // create a new array with only the color values (filter out undefined)
    colors: Object.values(form.colors)
      .map((item) => item.value)
      .filter((value): value is string => typeof value === "string" && value.length > 0),
  });

  return {
    formActions: {
      clear,
      addColor,
      removeColor,
      updateKeywords,
      getPreview,
    },
  };
}

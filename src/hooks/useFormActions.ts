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
   * Removes the currently focused color field based on focus.field.
   * If no field is currently focused (e.g., Action Panel opened),
   * uses the last focused color field as fallback.
   * Reorganizes remaining colors to fill the gap and updates focus.
   */
  const removeColor = () => {
    // Get the currently focused field, with fallback to last focused color field
    const activeField = focus.field || focus.lastColorField;

    // Check if we have a valid color field to work with
    if (!activeField || !activeField.startsWith("color")) {
      console.warn("No color field is currently focused or was recently focused. Cannot remove specific color.");
      return;
    }

    // Extract the color index from the field name (e.g., "color3" -> 3)
    const colorIndex = parseInt(activeField.replace("color", ""), 10);

    if (colorIndex < 1 || colorIndex > colorFields.count) {
      console.warn(`Invalid color index: ${colorIndex}. Must be between 1 and ${colorFields.count}`);
      return;
    }

    // Get current values for all color fields
    const currentColors: string[] = [];
    for (let i = 1; i <= colorFields.count; i++) {
      const colorKey = `color${i}` as keyof PaletteFormFields;
      const colorValue = form.colors[colorKey]?.value as string;
      if (colorValue) {
        currentColors.push(colorValue);
      }
    }

    // Remove the specific color from the array
    currentColors.splice(colorIndex - 1, 1);

    // Clear all color fields first
    for (let i = 1; i <= colorFields.count; i++) {
      const colorKey = `color${i}` as keyof PaletteFormFields;
      form.update(colorKey, "");
    }

    // Reassign the remaining colors to consecutive fields
    currentColors.forEach((color, index) => {
      const colorKey = `color${index + 1}` as keyof PaletteFormFields;
      form.update(colorKey, color);
    });

    // Update the color count
    colorFields.removeColor();

    // Set focus to a reasonable field after removal
    // If we removed the last field, focus on the new last field
    // Otherwise, focus on the same index (which now contains the next color)
    const newFocusIndex = Math.min(colorIndex, colorFields.count - 1);
    const newFocusField = `color${Math.max(1, newFocusIndex)}`;
    setTimeout(() => {
      focus.set(newFocusField);
    }, 50);
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

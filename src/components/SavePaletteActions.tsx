import { Action, ActionPanel, Icon } from "@raycast/api";
import { UseFormActionsObject, UseFormColorsObject, UseFormFocusObject, UseFormPaletteObject } from "../types";
import { isValidHexColor } from "../utils/isValidHexColor";
import { FormPalettePreview } from "./FormPalettePreview";

interface SavePaletteActionsProps {
  form: UseFormPaletteObject;
  formActions: UseFormActionsObject;
  colorFields: UseFormColorsObject;
  focus: UseFormFocusObject;
}

export function SavePaletteActions({ form, formActions, colorFields, focus }: SavePaletteActionsProps) {
  const lastFocusedColorName =
    focus.lastField && focus.lastField?.startsWith("color")
      ? {
          value: form.colors[focus.lastField]?.value || "",
          number: focus.lastField.replace("color", "").trim(),
        }
      : undefined;

  // Check if all current color fields have valid colors
  const hasEmptyColorFields = Array.from({ length: colorFields.count }, (_, index) => {
    const colorKey = `color${index + 1}` as keyof typeof form.colors;
    const colorValue = form.colors[colorKey]?.value as string;
    return !colorValue || !isValidHexColor(colorValue);
  }).some(Boolean);

  return (
    <ActionPanel>
      <Action.SubmitForm icon={Icon.Check} onSubmit={form.submit} title="Save Palette" />
      <Action.Push
        icon={Icon.Swatch}
        title="Preview Palette"
        target={<FormPalettePreview colors={formActions.getPreview().colors} />}
        shortcut={{ modifiers: ["opt"], key: "p" }}
      />
      {!hasEmptyColorFields && (
        <Action
          icon={Icon.PlusCircle}
          title="Add New Color Field"
          onAction={formActions.addColor}
          shortcut={{ modifiers: ["opt"], key: "n" }}
        />
      )}
      {colorFields.count > 1 && focus.lastField?.startsWith("color") && lastFocusedColorName && (
        <Action
          icon={Icon.MinusCircle}
          title={`Remove Color ${lastFocusedColorName.number}${lastFocusedColorName.value ? " - " + lastFocusedColorName.value : ""}`}
          onAction={formActions.removeColor}
          shortcut={{ modifiers: ["opt"], key: "x" }}
        />
      )}
      <Action
        icon={Icon.Wand}
        title="Clear Form"
        onAction={formActions.clear}
        shortcut={{ modifiers: ["opt"], key: "r" }}
      />
    </ActionPanel>
  );
}

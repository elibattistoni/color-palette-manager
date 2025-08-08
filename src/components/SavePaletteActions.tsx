import { Action, ActionPanel, Icon } from "@raycast/api";
import { UseFormActionsObject, UseFormColorsObject, UseFormFocusObject, UseFormPaletteObject } from "../types";
import { FormPalettePreview } from "./FormPalettePreview";

interface SavePaletteActionsProps {
  form: UseFormPaletteObject;
  formActions: UseFormActionsObject;
  colorFields: UseFormColorsObject;
  focus: UseFormFocusObject;
}

export function SavePaletteActions({ form, formActions, colorFields, focus }: SavePaletteActionsProps) {
  const lastFocusedColorName = focus.lastColorField
    ? {
        value: form.colors[focus.lastColorField]?.value || "",
        number: focus.lastColorField.replace("color", "").trim(),
      }
    : undefined;
  return (
    <ActionPanel>
      <Action.SubmitForm icon={Icon.Check} onSubmit={form.submit} title="Save Palette" />
      <Action.Push
        icon={Icon.Swatch}
        title="Preview Palette"
        target={<FormPalettePreview colors={formActions.getPreview().colors} />}
        shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
      />
      <Action
        icon={Icon.PlusCircle}
        title="Add New Color Field"
        onAction={formActions.addColor}
        shortcut={{ modifiers: ["cmd"], key: "n" }}
      />
      {colorFields.count > 1 && lastFocusedColorName && (
        <Action
          icon={Icon.MinusCircle}
          title={`Remove Color ${lastFocusedColorName.number}${lastFocusedColorName.value ? " - " + lastFocusedColorName.value : ""}`}
          onAction={formActions.removeColor}
          shortcut={{ modifiers: ["cmd"], key: "backspace" }}
        />
      )}
      <Action
        icon={Icon.Wand}
        title="Clear Form"
        onAction={formActions.clear}
        shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
      />
    </ActionPanel>
  );
}

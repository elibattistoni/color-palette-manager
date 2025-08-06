import { Action, ActionPanel } from "@raycast/api";
import { PaletteFormFields, UseFormActionsObject } from "../types";
import { ColorPalettePreview } from "./ColorPalettePreview";

interface SavePaletteActionsProps {
  handleSubmit: (values: PaletteFormFields) => boolean | void | Promise<boolean | void>;
  formActions: UseFormActionsObject;
  colorCount: number;
}

export function SavePaletteActions({ handleSubmit, formActions, colorCount }: SavePaletteActionsProps) {
  return (
    <ActionPanel>
      <Action.SubmitForm onSubmit={handleSubmit} />
      <Action.Push
        title="Preview Palette"
        target={<ColorPalettePreview colors={formActions.getPreview().colors} />}
        shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
      />
      <Action title="Add New Color Field" onAction={formActions.addColor} shortcut={{ modifiers: ["cmd"], key: "n" }} />
      {colorCount > 1 && (
        <Action
          title="Remove Last Color"
          onAction={formActions.removeColor}
          shortcut={{ modifiers: ["cmd"], key: "backspace" }}
        />
      )}
      {/* 
      /// TODO add an action for each color to remove that specific color ??
      */}
      <Action title="Clear Form" onAction={formActions.clear} shortcut={{ modifiers: ["cmd", "shift"], key: "r" }} />
    </ActionPanel>
  );
}

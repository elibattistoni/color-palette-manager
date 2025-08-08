import { Action, ActionPanel, Icon, LaunchType } from "@raycast/api";
import SaveColorPaletteCommand from "../save-color-palette";
import { ManagePaletteActions, SavedPalette } from "../types";
import { isValidHexColor } from "../utils/isValidHexColor";
import { PalettePreview } from "./PalettePreview";

interface ManagePalettesActionsProps {
  palette: SavedPalette;
  paletteActions: ManagePaletteActions;
}

/**
 * Generates Coolors.co URL from palette colors with validation.
 */
const generateCoolorsUrl = (colors: string[]): string => {
  try {
    const colorCodes = colors
      .filter(isValidHexColor) // Validate hex format
      .map((color) => color.replace(/^#/, "")) // Remove # prefix for URL
      .join("-");

    return colorCodes ? `https://coolors.co/${colorCodes}` : "https://coolors.co/";
  } catch {
    return "https://coolors.co/";
  }
};

export function ManagePalettesActions({ palette, paletteActions }: ManagePalettesActionsProps) {
  const coolorsUrl = generateCoolorsUrl(palette.colors);
  return (
    <ActionPanel>
      <Action.Push
        icon={Icon.Swatch}
        title="Preview Palette"
        target={<PalettePreview palette={palette} />}
        shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
      />

      <Action.Push
        title="Edit Palette"
        target={
          <SaveColorPaletteCommand
            launchType={LaunchType.UserInitiated}
            arguments={{}}
            draftValues={paletteActions.createEdit(palette)}
          />
        }
        icon={Icon.Pencil}
        shortcut={{ modifiers: ["cmd"], key: "e" }}
      />

      <Action
        title="Duplicate Palette"
        onAction={() => paletteActions.duplicate(palette)}
        icon={Icon.Duplicate}
        shortcut={{ modifiers: ["cmd"], key: "d" }}
      />

      <Action.CopyToClipboard
        title="Copy link to coolors.co"
        content={coolorsUrl}
        icon={Icon.Repeat}
        shortcut={{ modifiers: ["cmd", "shift"], key: "," }}
      />

      <Action
        title="Delete Palette"
        onAction={() => paletteActions.delete(palette.id, palette.name)}
        icon={Icon.Trash}
        style={Action.Style.Destructive}
        shortcut={{ modifiers: ["ctrl"], key: "x" }}
      />
    </ActionPanel>
  );
}

import { Action, ActionPanel, Icon, LaunchType } from "@raycast/api";
import { COPY_FORMATS } from "../constants";
import SaveColorPaletteCommand from "../save-color-palette";
import { ManagePaletteActions, SavedPalette } from "../types";
import { copyPalette } from "../utils/copyPalette";
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
  return (
    <ActionPanel>
      <Action.Push
        icon={Icon.Swatch}
        title="Preview Palette"
        target={<PalettePreview palette={palette} />}
        shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
      />

      <ActionPanel.Submenu
        title="Copy Palette Colors"
        icon={Icon.CopyClipboard}
        shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
      >
        {COPY_FORMATS.map(({ format, title, icon }) => (
          <Action.CopyToClipboard key={format} title={title} content={copyPalette(palette, format)} icon={icon} />
        ))}
        <ActionPanel.Section title="Copy Individual Colors">
          {palette.colors.map((color, idx) => (
            <Action.CopyToClipboard
              key={`${color}-${idx}`}
              title={`Copy Color ${idx + 1} - ${color}`}
              content={color}
            />
          ))}
        </ActionPanel.Section>
      </ActionPanel.Submenu>

      <Action.OpenInBrowser
        title="Open in Coolors"
        url={generateCoolorsUrl(palette.colors)}
        icon={Icon.Globe}
        shortcut={{ modifiers: ["cmd"], key: "o" }}
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

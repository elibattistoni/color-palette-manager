import { Action, ActionPanel, Grid, Icon, launchCommand, LaunchProps, LaunchType } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { useAIcolors } from "./hooks/useAIcolors";
import { useColorsSelection } from "./hooks/useColorsSelection";
import { AIGeneratedText, ColorItem, UseColorsSelectionObject } from "./types";

type GenerateColorsActionsProps = {
  colorItem: ColorItem;
  selection: UseColorsSelectionObject;
  AItext: AIGeneratedText;
};

export default function CreateColorsWithAi(props: LaunchProps<{ arguments: Arguments.CreateColorsWithAi }>) {
  const { prompt, creativity, totalColors } = props.arguments;

  const { isLoading, colorItems, title, description } = useAIcolors({
    creativity,
    totalColors,
    prompt,
  });

  const { selection } = useColorsSelection(colorItems);

  return (
    <Grid isLoading={isLoading}>
      {colorItems.length === 0 ? (
        <Grid.EmptyView
          icon={Icon.EyeDisabled}
          title="The AI could not create the colors."
          description="Please try again with a different prompt or creativity level."
        />
      ) : (
        colorItems.map((colorItem) => {
          const { color } = colorItem;
          const isSelected = selection.helpers.getIsItemSelected(colorItem);
          const content = isSelected
            ? {
                source: Icon.CircleFilled,
                tintColor: { light: color, dark: color, adjustContrast: true },
              }
            : { color: { light: color, dark: color, adjustContrast: false } };

          return (
            <Grid.Item
              key={colorItem.id}
              content={content}
              title={`${isSelected ? "✓ " : ""}${color}`}
              actions={<Actions colorItem={colorItem} selection={selection} AItext={{ title, description }} />}
            />
          );
        })
      )}
    </Grid>
  );
}

function Actions({ colorItem, selection, AItext }: GenerateColorsActionsProps) {
  const { toggleSelection, selectAll, clearSelection } = selection.actions;
  const { anySelected, allSelected, countSelected } = selection.selected;
  const { getIsItemSelected } = selection.helpers;
  const isSelected = getIsItemSelected(colorItem);
  const formattedColor = colorItem.color;

  return (
    <ActionPanel>
      <ActionPanel.Section title="Select Colors">
        <Action
          icon={isSelected ? Icon.Checkmark : Icon.Circle}
          title={isSelected ? `Deselect Color ${formattedColor}` : `Select Color ${formattedColor}`}
          shortcut={{ modifiers: ["cmd"], key: "s" }}
          onAction={() => toggleSelection(colorItem)}
        />
        {!allSelected && (
          <Action
            icon={Icon.Checkmark}
            title="Select All Colors"
            shortcut={{ modifiers: ["cmd", "shift"], key: "a" }}
            onAction={selectAll}
          />
        )}
        {anySelected && (
          <Action
            icon={Icon.XMarkCircle}
            title="Clear Selection"
            shortcut={{ modifiers: ["cmd", "shift"], key: "z" }}
            onAction={clearSelection}
          />
        )}
      </ActionPanel.Section>
      <ActionPanel.Section title="Save Palette">
        {countSelected > 0 && (
          <Action
            icon={Icon.AppWindowGrid3x3}
            title={`Save ${countSelected} Color${countSelected > 1 ? "s" : ""} as Palette`}
            shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
            onAction={async () => {
              try {
                await launchCommand({
                  name: "save-color-palette",
                  type: LaunchType.UserInitiated,
                  context: { selectedColors: Array.from(selection.selected.selectedItems), AItext },
                });
              } catch (e) {
                await showFailureToast(e);
              }
            }}
          />
        )}
      </ActionPanel.Section>
    </ActionPanel>
  );
}

import {
  Action,
  ActionPanel,
  AI,
  Grid,
  Icon,
  launchCommand,
  LaunchProps,
  LaunchType,
  useNavigation,
} from "@raycast/api";
import { showFailureToast, useAI } from "@raycast/utils";
import { useMemo } from "react";
import { useColorsSelection } from "./hooks/useColorsSelection";
import { ColorItem, UseColorsSelectionObject } from "./types";

type GenerateColorsActionsProps = {
  colorItem: ColorItem;
  selection: UseColorsSelectionObject;
  prompt: string;
};

export default function CreateColorsWithAi(props: LaunchProps<{ arguments: Arguments.CreateColorsWithAi }>) {
  const { prompt } = props.arguments;
  const creativity =
    props.arguments.creativity && props.arguments.creativity.trim() !== "" ? props.arguments.creativity : "medium";
  const totalColors =
    props.arguments.totalColors && props.arguments.totalColors.trim() !== "" ? props.arguments.totalColors : "5";

  console.log("🧨", props.arguments);
  console.log("🍀🍀🍀 creativity", creativity);
  console.log("🍀🍀🍀 totalColors", totalColors);

  const { pop } = useNavigation();

  const { data, isLoading } = useAI(
    `Generate ${totalColors} colors based on the input prompt.
Importantly, return valid HEX colors in a JSON array format, such as ["#66D3BB","#7EDDC6","#96E7D1","#AEEFDB","#C6F9E6"].
Do not include any other text or formatting, just the JSON array of colors.
If you cannot generate colors, return an empty JSON array [].

Prompt: ${prompt}

Creativity: ${creativity}

JSON colors:`,
    {
      model: AI.Model.OpenAI_GPT4o,
      stream: false,
      creativity,
    },
  );

  let colors: string[] = [];
  try {
    colors = data ? (JSON.parse(data) as string[]) : [];
  } catch (error) {
    showFailureToast(error, { title: "The AI could not create the colors, please try again." });
  }

  // Memoize ColorItems creation to avoid recreation on every render
  const colorItems: ColorItem[] = useMemo(() => {
    return colors.map((color, index) => ({
      id: index.toString(),
      color,
    }));
  }, [colors]);

  const { selection } = useColorsSelection(colorItems);

  return (
    <Grid
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action title="Go Back" icon={Icon.ArrowLeft} onAction={pop} />
        </ActionPanel>
      }
    >
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
              actions={<Actions colorItem={colorItem} selection={selection} prompt={prompt} />}
            />
          );
        })
      )}
    </Grid>
  );
}

function Actions({ colorItem, selection, prompt }: GenerateColorsActionsProps) {
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
              const selectedColorsArray = Array.from(selection.selected.selectedItems);
              try {
                await launchCommand({
                  name: "save-color-palette",
                  type: LaunchType.UserInitiated,
                  context: { selectedColors: selectedColorsArray, text: prompt },
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

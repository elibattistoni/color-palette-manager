import { AI, showToast, Toast } from "@raycast/api";
import { useAI } from "@raycast/utils";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_COLOR_FIELDS,
  DESCRIPTION_FIELD_MAXLENGTH,
  MAX_COLOR_FIELDS,
  NAME_FIELD_MAXLENGTH,
} from "../constants";
import { ColorItem } from "../types";

type UseAIcolorsProps = {
  creativity: AI.Creativity;
  totalColors: string;
  prompt: string;
};

type UseAIcolorsReturn = {
  isLoading: boolean;
  colorItems: ColorItem[];
  title: string;
  description: string;
  error: string | null;
};

export function useAIcolors({ creativity, totalColors, prompt }: UseAIcolorsProps): UseAIcolorsReturn {
  const [parsedTotalColors, setParsedTotalColors] = useState<number>(DEFAULT_COLOR_FIELDS);
  const [hasShownLimitToast, setHasShownLimitToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedCreativity = creativity && String(creativity).trim() !== "" ? creativity : "medium";

  // Parse and validate totalColors with MAX_COLOR_FIELDS limit
  useEffect(() => {
    const requestedColors = parseInt(
      totalColors && totalColors.trim() !== "" ? totalColors : String(MAX_COLOR_FIELDS),
      10,
    );

    const finalColors = Math.min(requestedColors, MAX_COLOR_FIELDS);
    setParsedTotalColors(finalColors);

    if (requestedColors > MAX_COLOR_FIELDS && !hasShownLimitToast) {
      showToast({
        title: `Max ${MAX_COLOR_FIELDS} colors allowed.`,
        message: `Creating ${MAX_COLOR_FIELDS} colors instead.`,
      });
      setHasShownLimitToast(true);
    }
  }, [totalColors, hasShownLimitToast]);

  const {
    data: jsonColors,
    isLoading: isLoadingJsonColors,
    error: jsonColorsError,
  } = useAI(
    `Generate ${parsedTotalColors} colors based on the input prompt.
Return valid HEX colors in a JSON array format, such as ["#66D3BB","#7EDDC6","#96E7D1","#AEEFDB","#C6F9E6"].
Do not include any other text or formatting, just the JSON array of colors.
If you cannot generate colors, return an empty JSON array [].

Prompt: ${prompt}

Creativity: ${parsedCreativity}

JSON colors:`,
    {
      model: AI.Model.OpenAI_GPT4o,
      stream: false,
      creativity: parsedCreativity,
    },
  );

  const {
    data: description,
    isLoading: isLoadingDescription,
    error: descriptionError,
  } = useAI(
    `Generate a description for the set of created colors, considering the input prompt ${prompt}.
Importantly, the description must be clear, concise and have a maximum length of 
${DESCRIPTION_FIELD_MAXLENGTH} characters.`,
    { model: AI.Model.OpenAI_GPT4o, stream: false, creativity: "medium" },
  );

  const {
    data: title,
    isLoading: isLoadingTitle,
    error: titleError,
  } = useAI(
    `Generate a title for the set of created colors, considering the input prompt ${prompt},
and the description you just created (${description}).
Importantly, the title must be clear, concise and have a maximum length of 
${NAME_FIELD_MAXLENGTH} characters.`,
    { model: AI.Model.OpenAI_GPT4o, stream: false, creativity: "medium" },
  );

  const isLoading = isLoadingJsonColors || isLoadingDescription || isLoadingTitle;

  // Handle errors
  useEffect(() => {
    if (jsonColorsError || descriptionError || titleError) {
      const errorMessage = "Failed to generate colors. Please try again.";
      setError(errorMessage);
      showToast({
        title: "Generation failed",
        message: "Please try again with a different prompt.",
        style: Toast.Style.Failure,
      });
    }
  }, [jsonColorsError, descriptionError, titleError]);

  // Show loading/success toast
  useEffect(() => {
    if (isLoading) {
      const loadingMessages = [];
      if (isLoadingJsonColors) loadingMessages.push("colors");
      if (isLoadingDescription) loadingMessages.push("description");
      if (isLoadingTitle) loadingMessages.push("title");

      if (loadingMessages.length > 0) {
        showToast({
          title: `Generating ${loadingMessages.join(", ")}...`,
          style: Toast.Style.Animated,
        });
      }
    } else if (!error && !isLoading && (jsonColors || description || title)) {
      showToast({
        title: "Colors generated successfully!",
        style: Toast.Style.Success,
      });
    }
  }, [
    isLoading,
    error,
    !!jsonColors,
    !!description,
    !!title,
    isLoadingJsonColors,
    isLoadingDescription,
    isLoadingTitle,
  ]);

  // Parse colors safely
  const colors: string[] = useMemo(() => {
    if (!jsonColors) return [];

    try {
      const parsed = JSON.parse(jsonColors) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      showToast({
        title: "The AI could not create the colors, please try again.",
        style: Toast.Style.Failure,
      });
      return [];
    }
  }, [jsonColors]);

  // Memoize ColorItems creation to avoid recreation on every render
  const colorItems: ColorItem[] = useMemo(() => {
    return colors.map((color, index) => ({
      id: index.toString(),
      color,
    }));
  }, [colors]);

  return {
    isLoading,
    colorItems,
    title: title || "",
    description: description || "",
    error,
  };
}

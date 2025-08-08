import { Icon } from "@raycast/api";
import { CopyPaletteFormat, PaletteFormFields } from "./types";

export const DEFAULT_NAME = "";

export const DEFAULT_DESCRIPTION = "";

export const DEFAULT_MODE = "light";

export const DEFAULT_KEYWORDS: string[] = [];

export const DEFAULT_COLOR = "";

export const NAME_FIELD_MAXLENGTH = 30;

export const DESCRIPTION_FIELD_MAXLENGTH = 200;

export const MAX_COLOR_FIELDS = 15;

export const DEFAULT_COLOR_FIELDS = 10;

export const DEFAULT_EDIT_ID = undefined;

export const CLEAR_FORM_VALUES: PaletteFormFields = {
  name: DEFAULT_NAME,
  description: DEFAULT_DESCRIPTION,
  mode: DEFAULT_MODE,
  keywords: DEFAULT_KEYWORDS,
  editId: DEFAULT_EDIT_ID,
  color1: DEFAULT_COLOR,
};

/**
 * Copy format configurations with format-specific icons.
 */
export const COPY_FORMATS: Array<{
  format: CopyPaletteFormat;
  title: string;
  icon: Icon;
}> = [
  { format: "json", title: "Copy Colors as JSON", icon: Icon.CodeBlock },
  { format: "css", title: "Copy Colors as CSS Classes", icon: Icon.Brush },
  { format: "css-variables", title: "Copy Colors as CSS Variables", icon: Icon.Gear },
  { format: "txt", title: "Copy Colors as Plain Text", icon: Icon.Text },
];

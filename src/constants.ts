import { PaletteFormFields } from "./types";

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

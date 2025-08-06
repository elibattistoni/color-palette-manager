import { LaunchProps } from "@raycast/api";

export type ColorItem = {
  id: string;
  color: string;
};

export type UseFormColorsObject = {
  count: number;
  addColor: () => void;
  removeColor: () => void;
  resetColors: () => void;
};

export type UseFormKeywordsObject = {
  keywords: string[] | undefined;
  update: (keywordsText: string) => Promise<UpdateKeywordsPromiseResult>;
};

export type UseFormActionsObject = {
  clear: () => void;
  addColor: () => void;
  removeColor: () => void;
  updateKeywords: (keywordsText: string) => Promise<UpdateKeywordsPromiseResult>;
};

export type UseFormFocusObject = {
  field: string | null;
  set: (fieldId: string | null) => void;
  create: (fieldId: string) => {
    onFocus: () => void;
    onBlur: () => void;
  };
};

export type PaletteFormFields = {
  name: string;
  description: string;
  mode: string;
  keywords: string[];
  editId?: string;
  [key: `color${number}`]: string;
};

export interface SavePaletteFormProps extends LaunchProps {
  launchContext?: {
    /// ELISA TODO USE THIS if you want to implement automatic filling of colors base e.g. on AI
    selectedColors?: ColorItem[];
    text?: string;
  };
  draftValues?: PaletteFormFields;
}

export type SavedPalette = {
  id: string;
  name: string;
  description: string;
  mode: "light" | "dark";
  keywords: string[];
  colors: string[];
  createdAt: string;
};

export type UpdateKeywordsPromiseResult = {
  validKeywords: string[];
  invalidKeywords: string[];
  removedKeywords: string[];
  duplicateKeywords: string[];
  totalProcessed: number;
};

export type CopyPaletteFormat = "json" | "css" | "txt" | "css-variables";

export type ManagePaletteActions = {
  delete: (paletteId: string, paletteName: string) => Promise<void>;
  createEdit: (palette: SavedPalette) => PaletteFormFields;
  duplicate: (palette: SavedPalette) => Promise<void>;
  // TODO merge
};

export type UseColorsSelectionObject = {
  actions: {
    toggleSelection: (item: ColorItem) => void;
    selectAll: () => void;
    clearSelection: () => void;
  };
  selected: {
    selectedItems: Set<ColorItem>;
    anySelected: boolean;
    allSelected: boolean;
    countSelected: number;
  };
  helpers: {
    getIsItemSelected: (item: ColorItem) => boolean;
  };
};

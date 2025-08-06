import { Form } from "@raycast/api";
import { useForm } from "@raycast/utils";
import { useMemo } from "react";
import { CLEAR_FORM_VALUES, MAX_COLOR_FIELDS } from "../constants";
import { PaletteFormFields, UseFormColorsObject, UseFormPaletteObject } from "../types";
import { formValidation } from "../utils/formValidation";
import { useFormSubmission } from "./useFormSubmission";

type UseFormPaletteProps = {
  colorFields: UseFormColorsObject;
  initialValues: PaletteFormFields;
  isEditing: boolean;
};

type UseFormPaletteReturn = {
  form: UseFormPaletteObject;
};

export function useFormPalette({ colorFields, initialValues, isEditing }: UseFormPaletteProps): UseFormPaletteReturn {
  const { submitPalette } = useFormSubmission();

  // Pre-define all possible color fields (up to MAX_COLOR_FIELDS) for useForm
  const extendedInitialValues = useMemo(() => {
    const values: PaletteFormFields = { ...initialValues };
    // Ensure all possible color fields exist in the initial values
    for (let i = 1; i <= MAX_COLOR_FIELDS; i++) {
      const colorKey = `color${i}` as `color${number}`;
      if (!values[colorKey]) {
        values[colorKey] = "";
      }
    }
    return values;
  }, [initialValues]);

  const { handleSubmit, itemProps, reset, setValue } = useForm<PaletteFormFields>({
    initialValues: extendedInitialValues,
    validation: formValidation(MAX_COLOR_FIELDS), // Validate all possible fields
    async onSubmit(values) {
      await submitPalette({
        formValues: {
          ...values,
          ...(isEditing && initialValues?.editId ? { editId: initialValues.editId } : {}),
        },
        colorCount: colorFields.count,
        onSubmit: () => {
          colorFields.resetColors();
          reset(CLEAR_FORM_VALUES);
        },
        isNestedContext: isEditing,
      });
    },
  });

  // Extract only the color fields that are currently active (based on colorFields.count)
  // but limit to MAX_COLOR_FIELDS
  const activeColorCount = Math.min(colorFields.count, MAX_COLOR_FIELDS);
  const colors = useMemo(() => {
    const colorProps: Record<string, Partial<Form.ItemProps<string>> & { id: string }> = {};

    for (let i = 1; i <= activeColorCount; i++) {
      const colorKey = `color${i}` as keyof PaletteFormFields;
      const itemProp = itemProps[colorKey];
      if (itemProp) {
        // Only include color fields (string type), not keywords (string[] type)
        colorProps[colorKey] = itemProp as Partial<Form.ItemProps<string>> & { id: string };
      }
    }

    return colorProps;
  }, [itemProps, activeColorCount]);

  return {
    form: {
      submit: handleSubmit,
      items: itemProps,
      reset,
      update: setValue,
      colors,
    },
  };
}

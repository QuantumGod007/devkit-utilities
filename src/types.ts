export interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  sample: string;
  inputLabel?: string;
  inputType?: "number";
  min?: number;
  max?: number;
  actions: { label: string; run: (input: string) => string }[];
}

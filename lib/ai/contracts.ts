import { CATEGORIES, type Category } from "../domain/models.ts";
export type AnalysisSuggestion = { category: Category | "확인 필요"; itemName: string; visibleFeatures: string[]; checksNeeded: string[] };
export function isAnalysisSuggestion(value: unknown): value is AnalysisSuggestion {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  const keys = Object.keys(item).sort();
  const validText = (text: unknown, max: number) => typeof text === "string" && text.trim().length > 0 && text.length <= max;
  const validList = (list: unknown) => Array.isArray(list) && list.length >= 1 && list.length <= 5 && list.every(text => validText(text, 120));
  return keys.join(",") === "category,checksNeeded,itemName,visibleFeatures" && typeof item.category === "string" && [...CATEGORIES, "확인 필요"].includes(item.category as Category | "확인 필요") && validText(item.itemName, 60) && validList(item.visibleFeatures) && validList(item.checksNeeded);
}
export function applySuggestion<T extends { title: string; category: string }>(form: T, suggestion: AnalysisSuggestion): T {
  return { ...form, title: suggestion.itemName === "확인 필요" ? form.title : suggestion.itemName.trim(), category: suggestion.category === "확인 필요" ? form.category : suggestion.category };
}

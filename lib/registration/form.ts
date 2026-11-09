import { CATEGORIES, type Asset, type Category } from "../domain/models.ts";
import { isDate } from "../domain/validation.ts";
export const CONDITIONS = ["거의 새 상품", "사용감 적음", "일반 중고", "사용감 많음"] as const;
export const DISTRICTS = ["수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시", "화성시", "평택시", "의정부시", "시흥시", "파주시", "김포시", "광명시", "광주시", "군포시", "이천시", "오산시", "하남시", "양주시", "구리시", "안성시", "포천시", "의왕시", "여주시", "양평군", "동두천시", "과천시", "가평군", "연천군"] as const;
export type FormData = { title: string; category: string; condition: string; askingPrice: string; district: string; neighborhood: string; disposalDeadline: string; description: string; image: string };
export type FormErrors = Partial<Record<keyof FormData, string>>;
export const emptyForm = (): FormData => ({ title: "", category: "", condition: "", askingPrice: "", district: "", neighborhood: "", disposalDeadline: "", description: "", image: "" });
export function validateForm(form: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim()) errors.title = "장비 이름을 입력해 주세요.";
  else if (form.title.trim().length > 60) errors.title = "장비 이름은 60자 이내로 입력해 주세요.";
  if (!(CATEGORIES as readonly string[]).includes(form.category)) errors.category = "장비 종류를 선택해 주세요.";
  if (!(CONDITIONS as readonly string[]).includes(form.condition)) errors.condition = "장비 상태를 선택해 주세요.";
  if (!/^[0-9]+$/.test(form.askingPrice) || !Number.isSafeInteger(Number(form.askingPrice)) || Number(form.askingPrice) <= 0) errors.askingPrice = "희망 가격을 0원보다 큰 정수로 입력해 주세요.";
  if (!(DISTRICTS as readonly string[]).includes(form.district)) errors.district = "경기도 시·군을 선택해 주세요.";
  if (form.neighborhood.trim().length > 30) errors.neighborhood = "상세 지역은 30자 이내로 입력해 주세요.";
  if (!isDate(form.disposalDeadline)) errors.disposalDeadline = "올바른 처분 예정일을 선택해 주세요.";
  if (form.description.trim().length > 500) errors.description = "설명은 500자 이내로 입력해 주세요.";
  return errors;
}
export function toAsset(form: FormData, id: string, createdAt: string): Asset {
  return { id, title: form.title.trim(), category: form.category as Category, condition: form.condition, askingPrice: Number(form.askingPrice), region: "경기도", district: form.district, ...(form.neighborhood.trim() ? { neighborhood: form.neighborhood.trim() } : {}), disposalDeadline: form.disposalDeadline, description: form.description.trim(), image: form.image || "package", status: "AVAILABLE", dataOrigin: "user", createdAt };
}

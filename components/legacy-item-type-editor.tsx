"use client";
import { useState, type FormEvent } from "react";
import { ITEM_TYPES_BY_CATEGORY, type Asset, type ItemType } from "@/lib/domain/models";
import { useDemoStore } from "@/lib/state/demo-provider";

export function LegacyItemTypeEditor({ asset }: { asset: Asset }) {
  const demo = useDemoStore();
  const [itemType, setItemType] = useState("");
  const [savedType, setSavedType] = useState<ItemType | null>(null);
  const [error, setError] = useState("");

  if (asset.itemType) return savedType ? <p className="legacy-item-status" role="status">세부 품목을 ‘{savedType}’(으)로 저장했습니다. 기존 사진과 거래 기록은 유지됩니다.</p> : null;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!itemType) { setError("세부 품목을 선택해 주세요."); return; }
    const selected = itemType as ItemType;
    if (demo.setLegacyAssetItemType(asset.id, selected)) {
      setSavedType(selected);
      setError("");
    } else {
      setError("저장하지 못했습니다. 브라우저 저장 공간을 확인한 뒤 다시 시도해 주세요.");
    }
  }

  return <section className="legacy-item-editor" aria-labelledby="legacy-item-title">
    <h2 id="legacy-item-title">세부 품목이 필요한 자산</h2>
    <p>이 자산은 이전 데이터라 세부 품목이 없습니다. 품목을 지정하면 정확한 조건으로 매칭할 수 있습니다. 다른 등록 정보와 이미지는 바뀌지 않습니다.</p>
    <form onSubmit={save}>
      <label htmlFor="legacy-item-type">세부 품목</label>
      <select id="legacy-item-type" value={itemType} onChange={event => { setItemType(event.target.value); setError(""); }}>
        <option value="">{asset.category} 품목 선택</option>
        {ITEM_TYPES_BY_CATEGORY[asset.category].map(value => <option key={value} value={value}>{value}</option>)}
      </select>
      <button type="submit" className="button button-secondary">세부 품목 저장</button>
    </form>
    {error && <p className="field-error" role="alert">{error}</p>}
  </section>;
}

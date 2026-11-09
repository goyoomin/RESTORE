"use client";
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/domain/models";
import { isAnalysisSuggestion, type AnalysisSuggestion } from "@/lib/ai/contracts";

type Status = "idle" | "loading" | "ready" | "error";
export function AiAssetSuggestion({ image, onApply, onManual }: { image: string; onApply: (value: AnalysisSuggestion) => void; onManual: () => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [suggestion, setSuggestion] = useState<AnalysisSuggestion | null>(null);
  const [features, setFeatures] = useState(""); const [checks, setChecks] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => () => { abortRef.current?.abort(); }, []);
  async function analyze() {
    if (status === "loading") return;
    const controller = new AbortController(); abortRef.current = controller;
    setStatus("loading"); setMessage(""); setSuggestion(null);
    try {
      const base = window.location.pathname.replace(/\/sell\/new\/?$/, "");
      const result = await fetch(`${base}/api/assets/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image }), signal: controller.signal });
      const payload: unknown = await result.json();
      if (!result.ok) { const error = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string" ? payload.error : "AI 분석에 실패했습니다. 직접 입력해 주세요."; throw new Error(error); }
      const proposed = payload && typeof payload === "object" && "suggestion" in payload ? payload.suggestion : null;
      if (!isAnalysisSuggestion(proposed)) throw new Error("AI 응답을 확인할 수 없습니다. 직접 입력해 주세요.");
      setSuggestion(proposed); setFeatures(proposed.visibleFeatures.join("\n")); setChecks(proposed.checksNeeded.join("\n")); setStatus("ready");
    } catch (error) { if (!controller.signal.aborted) { setStatus("error"); setMessage(error instanceof Error ? error.message : "AI 분석에 실패했습니다. 직접 입력해 주세요."); } }
  }
  function apply() {
    if (!suggestion) return;
    const edited = { ...suggestion, itemName: suggestion.itemName.trim(), visibleFeatures: features.split("\n").map(x => x.trim()).filter(Boolean), checksNeeded: checks.split("\n").map(x => x.trim()).filter(Boolean) };
    if (!isAnalysisSuggestion(edited)) { setMessage("품목명과 각 확인 항목을 입력해 주세요. 항목은 각각 1~5개, 한 줄에 120자 이내입니다."); return; }
    onApply(edited);
  }
  return <div className="ai-suggestion"><div className="ai-suggestion-heading"><Sparkles size={19} aria-hidden="true" /><strong>사진으로 장비 확인하기 <span>(선택)</span></strong></div><p>버튼을 누르면 선택한 사진이 서버를 거쳐 OpenAI에 전송됩니다. 개인정보가 담긴 사진은 사용하지 마세요.</p><div className="ai-actions"><button type="button" className="photo-button" onClick={analyze} disabled={status === "loading"}>{status === "loading" ? "사진 분석 중..." : status === "ready" ? "다시 분석하기" : "AI로 품목 확인"}</button><button type="button" className="photo-remove" onClick={onManual}>직접 입력하기</button></div><div role="status" aria-live="polite">{status === "loading" && <p>사진을 분석하고 있습니다. 직접 입력으로 계속 진행할 수도 있습니다.</p>}{message && <p className="field-error">{message}</p>}</div>{status === "ready" && suggestion && <div className="ai-result"><strong>AI 분석 제안</strong><p>AI가 사진을 바탕으로 제안한 정보입니다. 실제 제품 정보를 확인한 뒤 등록해 주세요.</p><div className="form-grid"><div className="form-field"><label htmlFor="ai-title">예상 품목명</label><input id="ai-title" value={suggestion.itemName} maxLength={60} onChange={e => setSuggestion({ ...suggestion, itemName: e.target.value })} /></div><div className="form-field"><label htmlFor="ai-category">예상 카테고리</label><select id="ai-category" value={suggestion.category} onChange={e => setSuggestion({ ...suggestion, category: e.target.value as Category | "확인 필요" })}><option>확인 필요</option>{CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></div><div className="form-field full"><label htmlFor="ai-features">사진에서 보이는 특징 <span>(한 줄에 하나)</span></label><textarea id="ai-features" value={features} onChange={e => setFeatures(e.target.value)} rows={3} maxLength={604} /></div><div className="form-field full"><label htmlFor="ai-checks">추가 확인 사항 <span>(한 줄에 하나)</span></label><textarea id="ai-checks" value={checks} onChange={e => setChecks(e.target.value)} rows={3} maxLength={604} /></div></div><p>모델명, 제조연도, 가격, 작동 여부, 사용기간과 소유권은 확인이 필요합니다. 품목명과 카테고리만 다음 단계에 적용됩니다.</p><button type="button" className="button button-secondary" onClick={apply}>제안 확인 후 적용</button></div>}</div>;
}

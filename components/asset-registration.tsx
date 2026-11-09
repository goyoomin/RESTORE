"use client";
import Link from "next/link";
import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Trash2 } from "lucide-react";
import { CATEGORIES } from "@/lib/domain/models";
import { CONDITIONS, DISTRICTS, emptyForm, toAsset, validateForm, type FormData, type FormErrors } from "@/lib/registration/form";
import { optimizeImage } from "@/lib/registration/image";
import { useDemoStore } from "@/lib/state/demo-provider";
import { AssetImage } from "./asset-image";
import { AiAssetSuggestion } from "./ai-asset-suggestion";
import { applySuggestion } from "@/lib/ai/contracts";
import { Container } from "./ui";

const steps = ["사진 등록", "장비 정보", "최종 확인"];
function today(): string { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
export function AssetRegistration() {
  const demo = useDemoStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoError, setPhotoError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [saveError, setSaveError] = useState("");
  const [createdId, setCreatedId] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const sequence = useRef(0);
  const setField = (key: keyof FormData, value: string) => { setForm(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined })); setSaveError(""); };
  async function choosePhoto(file?: File) {
    if (!file) return;
    const request = ++sequence.current;
    setPhotoVersion(version => version + 1);
    setPhotoError(""); setProcessing(true);
    try { const image = await optimizeImage(file); if (sequence.current === request) setField("image", image); }
    catch (error) { if (sequence.current === request) setPhotoError(error instanceof Error ? error.message : "사진을 처리하지 못했습니다."); }
    finally { if (sequence.current === request) setProcessing(false); if (input.current) input.current.value = ""; }
  }
  function removePhoto() { sequence.current++; setProcessing(false); setField("image", ""); setPhotoError(""); if (input.current) input.current.value = ""; }
  function onDrop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); void choosePhoto(event.dataTransfer.files[0]); }
  function check(): boolean {
    const next = validateForm(form); setErrors(next);
    const first = Object.keys(next)[0];
    if (first) { setStep(2); window.setTimeout(() => document.getElementById(`field-${first}`)?.focus(), 0); return false; }
    return true;
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (processing) return;
    if (step === 1) { setStep(2); return; }
    if (!check()) return;
    if (step === 2) { setStep(3); return; }
    try {
      const id = crypto.randomUUID();
      if (demo.addAsset(toAsset(form, id, today()))) { setCreatedId(id); setSaveError(""); }
      else setSaveError("저장하지 못했습니다. 입력한 내용은 유지되어 있습니다. 저장 공간을 확보하거나 사진을 삭제한 뒤 다시 시도해 주세요.");
    } catch { setSaveError("등록하지 못했습니다. 입력한 내용은 유지되어 있습니다. 잠시 후 다시 시도해 주세요."); }
  }
  function startOver() { sequence.current++; setForm(emptyForm()); setErrors({}); setPhotoError(""); setSaveError(""); setCreatedId(""); setStep(1); }
  if (createdId) return <main className="registration"><Container><div className="registration-shell success-panel"><span className="success-icon"><Check size={30} /></span><span className="eyebrow">REGISTRATION COMPLETE</span><h1>자산 등록이 완료됐어요</h1><p>소중한 장비가 이 브라우저의 시연 목록에 등록되었습니다.<br />실제 거래가 이루어진 것은 아닙니다.</p><div className="success-actions"><Link className="button button-primary" href={`/market/${encodeURIComponent(createdId)}`}>등록한 장비 보기 <ArrowRight size={17} /></Link><button className="button button-secondary" type="button" onClick={startOver}>다른 장비 등록하기</button><Link className="plain-link" href="/market">장비 목록 둘러보기 <ArrowRight size={16} /></Link></div></div></Container></main>;
  const fieldProps = (name: keyof FormData) => ({ id: `field-${name}`, "aria-invalid": !!errors[name], "aria-describedby": errors[name] ? `error-${name}` : undefined });
  const error = (name: keyof FormData) => errors[name] ? <span className="field-error" id={`error-${name}`}>{errors[name]}</span> : null;
  const details = [["장비 종류", form.category], ["장비 상태", form.condition], ["지역", `경기도 ${form.district}${form.neighborhood.trim() ? ` ${form.neighborhood.trim()}` : ""}`], ["처분 예정일", form.disposalDeadline], ["장비 설명", form.description.trim() || "입력하지 않음"]];
  return <main className="registration"><Container><div className="registration-shell"><Link className="registration-back" href="/"> <ArrowLeft size={16} /> 홈으로</Link><div className="registration-intro"><span className="eyebrow">A NEW BEGINNING</span><h1>소중한 자산을 등록해 주세요</h1><p>한 단계씩 천천히 입력해 주세요. 사진이 없어도 등록할 수 있어요.</p></div><div className="registration-notice">시연용 서비스입니다. 입력한 내용은 이 브라우저에만 저장되며 실제 거래로 이어지지 않습니다. 개인정보와 상세 주소는 입력하지 마세요.</div><ol className="registration-steps">{steps.map((label, index) => <li key={label} aria-current={step === index + 1 ? "step" : undefined} className={step === index + 1 ? "current" : step > index + 1 ? "done" : ""}><span>{step > index + 1 ? <Check size={15} /> : index + 1}</span><div><small>STEP {index + 1}</small><strong>{label}</strong></div></li>)}</ol>
    <form noValidate onSubmit={submit}>
      {step === 1 && <section className="registration-card" aria-labelledby="step-title"><div className="step-heading"><span>STEP 01</span><h2 id="step-title">장비 사진을 보여주세요</h2><p>사진 한 장을 선택해 주세요. 사진이 없어도 다음 단계로 넘어갈 수 있어요.</p></div><div className="photo-drop" onDragOver={event => event.preventDefault()} onDrop={onDrop}>{form.image ? <div className="photo-preview"><AssetImage image={form.image} title="선택한 장비" /></div> : <div className="photo-placeholder"><ImagePlus size={34} strokeWidth={1.4} /><strong>장비 사진을 선택해 주세요</strong><span>또는 이곳에 사진을 끌어다 놓으세요</span></div>}<input ref={input} className="visually-hidden" id="photo-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e: ChangeEvent<HTMLInputElement>) => void choosePhoto(e.target.files?.[0])} aria-describedby="photo-help photo-error" /><div className="photo-actions"><label className="photo-button" htmlFor="photo-input">{form.image ? "사진 변경" : "사진 선택"}</label>{form.image && <button type="button" className="photo-remove" onClick={removePhoto}><Trash2 size={16} /> 사진 삭제</button>}</div><p id="photo-help">JPG, PNG, WebP · 최대 10MB · 사진은 브라우저에서 자동으로 작아집니다</p><p id="photo-error" role="status" className="field-error">{processing ? "사진을 준비하고 있습니다..." : photoError}</p></div>{form.image && !processing && <AiAssetSuggestion key={photoVersion} image={form.image} onManual={() => setStep(2)} onApply={value => { setForm(current => applySuggestion(current, value)); setErrors({}); setStep(2); }} />}</section>}
      {step === 2 && <section className="registration-card" aria-labelledby="step-title"><div className="step-heading"><span>STEP 02</span><h2 id="step-title">장비에 대해 알려주세요</h2><p><b className="required">*</b> 표시는 꼭 입력해 주세요.</p></div><div className="form-grid"><div className="form-field full"><label htmlFor="field-title">장비명 <b className="required">*</b></label><input {...fieldProps("title")} value={form.title} maxLength={60} onChange={e => setField("title", e.target.value)} placeholder="예: 업소용 커피머신" required />{error("title")}</div><div className="form-field"><label htmlFor="field-category">카테고리 <b className="required">*</b></label><select {...fieldProps("category")} value={form.category} onChange={e => setField("category", e.target.value)} required><option value="">장비 종류 선택</option>{CATEGORIES.map(x => <option key={x}>{x}</option>)}</select>{error("category")}</div><div className="form-field"><label htmlFor="field-condition">장비 상태 <b className="required">*</b></label><select {...fieldProps("condition")} value={form.condition} onChange={e => setField("condition", e.target.value)} required><option value="">장비 상태 선택</option>{CONDITIONS.map(x => <option key={x}>{x}</option>)}</select>{error("condition")}</div><div className="form-field"><label htmlFor="field-askingPrice">희망 판매가격 <b className="required">*</b></label><div className="price-input"><input {...fieldProps("askingPrice")} type="text" inputMode="numeric" value={form.askingPrice} maxLength={15} onChange={e => setField("askingPrice", e.target.value)} placeholder="예: 300000" required /><span>원</span></div>{error("askingPrice")}</div><div className="form-field"><label htmlFor="field-disposalDeadline">처분 예정일 <b className="required">*</b></label><input {...fieldProps("disposalDeadline")} type="date" value={form.disposalDeadline} onChange={e => setField("disposalDeadline", e.target.value)} required />{error("disposalDeadline")}</div><div className="form-field"><label htmlFor="field-district">지역 / 시·군 <b className="required">*</b></label><select {...fieldProps("district")} value={form.district} onChange={e => setField("district", e.target.value)} required><option value="">경기도 시·군 선택</option>{DISTRICTS.map(x => <option key={x}>{x}</option>)}</select>{error("district")}</div><div className="form-field"><label htmlFor="field-neighborhood">상세 지역 <span>(선택)</span></label><input {...fieldProps("neighborhood")} value={form.neighborhood} maxLength={30} onChange={e => setField("neighborhood", e.target.value)} placeholder="예: 인계동 (읍·면·동까지만)" />{error("neighborhood")}</div><div className="form-field full"><label htmlFor="field-description">장비 설명 <span>(선택)</span></label><textarea {...fieldProps("description")} value={form.description} maxLength={500} rows={4} onChange={e => setField("description", e.target.value)} placeholder="장비의 특징이나 사용감을 적어 주세요." /><small>{form.description.length} / 500자</small>{error("description")}</div></div></section>}
      {step === 3 && <section className="registration-card" aria-labelledby="step-title"><div className="step-heading"><span>STEP 03</span><h2 id="step-title">입력한 내용을 확인해 주세요</h2><p>등록 전 사진과 장비 정보를 다시 확인할 수 있어요.</p></div><div className="review-card"><div className="review-image"><AssetImage image={form.image || "package"} title={form.title || "장비"} /></div><div className="review-content"><span className="review-tag">사용자 등록 데모</span><h3>{form.title}</h3><strong>{Number(form.askingPrice).toLocaleString("ko-KR")}원</strong><dl>{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></div><div className="edit-actions"><button type="button" onClick={() => setStep(1)}>사진 수정</button><button type="button" onClick={() => setStep(2)}>장비 정보 수정</button></div>{saveError && <div className="save-error" role="alert">{saveError}{demo.status === "error" && <span> {demo.error}</span>}</div>}</section>}
      <div className="registration-actions">{step === 1 ? <Link href="/" className="button button-secondary"><ArrowLeft size={16} /> 이전</Link> : <button type="button" className="button button-secondary" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> 이전</button>}<button type="submit" className="button button-primary" disabled={processing || demo.status === "loading"}>{step === 3 ? "등록 완료하기" : "다음"} <ArrowRight size={16} /></button></div>
    </form></div></Container></main>;
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { useDemoStore } from "@/lib/state/demo-provider";
import { Container } from "./ui";
export function DemoGuideBar() {
  const demo = useDemoStore();
  const [message, setMessage] = useState("");
  function reset() {
    if (!window.confirm("이 브라우저의 등록 자산, 수요, 관심 표시와 가상 거래를 모두 삭제하고 초기 시연 데이터로 되돌릴까요?")) return;
    setMessage(demo.reset() ? "이 브라우저의 시연 데이터를 초기 상태로 되돌렸습니다." : "초기화하지 못했습니다. 브라우저 저장소 설정을 확인해 주세요.");
  }
  return <div className="demo-guide-bar"><Container><details className="demo-guide"><summary><span>공모전 시연 안내</span><small>시연 순서와 빠른 이동</small></summary><div className="demo-guide-content"><p>모든 정보와 거래는 가상이며 이 브라우저에서만 유지됩니다. 기존 입력은 초기화 시 삭제됩니다.</p><nav aria-label="시연 순서"><ol><li><Link href="/sell/new">1. 폐업자: 장비 등록</Link></li><li><Link href="/market">2. 창업자: 장비 둘러보기</Link></li><li><Link href="/match">3. 창업 조건과 추천</Link></li><li><Link href="/market">4. 상세에서 가상 거래</Link></li><li><Link href="/impact">5. 정책 효과 확인</Link></li></ol></nav><button type="button" className="demo-guide-reset" onClick={reset} disabled={demo.status === "loading"}>시연 데이터 초기화</button><p role="status" aria-live="polite">{message}</p></div></details></Container></div>;
}

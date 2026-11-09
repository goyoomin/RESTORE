import { ArrowUpRight, Sprout } from "lucide-react";
import { ButtonLink, Container } from "./ui";
export function ComingSoon({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <main className="coming-soon"><Container><div className="coming-inner"><div className="coming-icon"><Sprout size={28} aria-hidden="true" /></div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p><div className="notice"><ArrowUpRight size={18} aria-hidden="true" /><span>이 기능은 현재 준비 중입니다. 본 서비스는 실제 거래가 이루어지지 않는 시연용 프로토타입입니다.</span></div><ButtonLink href="/" secondary>메인으로 돌아가기</ButtonLink></div></Container></main>;
}

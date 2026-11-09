import Link from "next/link";
import { Container } from "./ui";
import { Logo } from "./header";
export function Footer() {
  return <footer className="footer"><Container><div className="footer-top"><div><Logo light /><p>가게의 이야기가 이어지는 곳,<br />다시가게</p></div><div className="footer-links"><Link href="/policy">서비스 소개</Link><Link href="/policy">정책 취지</Link><Link href="/impact">정책 효과</Link></div></div><div className="footer-bottom"><p>현재는 시연용 서비스이며, 입력한 데이터는 이 브라우저에만 저장됩니다. 실제 거래 서비스가 아닙니다.</p><span>© RE:STORE</span></div></Container></footer>;
}

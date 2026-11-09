import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DemoProvider } from "@/lib/state/demo-provider";
import { DemoGuideBar } from "@/components/demo-guide-bar";
import "./globals.css";
export const metadata: Metadata = { title: "다시가게 RE:STORE | 가게의 이야기가 이어지는 곳", description: "소상공인의 자산이 새로운 시작으로 이어지도록. 다시가게 공모전 시연용 프로토타입입니다." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><a className="skip-link" href="#main-content">본문으로 건너뛰기</a><Header /><DemoProvider><DemoGuideBar /><div id="main-content">{children}</div></DemoProvider><Footer /></body></html>;
}

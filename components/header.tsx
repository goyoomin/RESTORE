"use client";
import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { Container } from "./ui";

const links = [{ href: "/market", label: "장비 둘러보기" }, { href: "/match", label: "스마트 매칭" }, { href: "/impact", label: "정책 효과" }, { href: "/policy", label: "서비스 소개" }];
export function Logo({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`logo ${light ? "logo-light" : ""}`}><span className="logo-mark" aria-hidden="true">R</span><span className="logo-words"><strong>다시가게</strong><small>RE:STORE</small></span><span className="visually-hidden"> 홈</span></Link>;
}
export function Header() {
  return <header className="header"><Container className="header-inner"><Logo /><nav className="desktop-nav" aria-label="주 메뉴">{links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav><Link className="header-cta" href="/sell/new">자산 등록 <ArrowUpRight size={16} aria-hidden="true" /></Link><details className="mobile-menu"><summary aria-label="메뉴"><Menu size={25} aria-hidden="true" /></summary><nav aria-label="모바일 메뉴" onClick={event => { const details = event.currentTarget.closest("details"); if (details) details.open = false; }}>{links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}<Link href="/sell/new">자산 등록 <ArrowUpRight size={16} aria-hidden="true" /></Link></nav></details></Container></header>;
}

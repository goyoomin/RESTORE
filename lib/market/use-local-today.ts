"use client";
import { useEffect, useState } from "react";
import { localToday } from "./filters";
export function useLocalToday(): string {
  const [today, setToday] = useState(localToday);
  useEffect(() => {
    let timer: number;
    const update = () => {
      const now = new Date();
      setToday(localToday(now));
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      window.clearTimeout(timer);
      timer = window.setTimeout(update, midnight.getTime() - now.getTime() + 50);
    };
    const onFocus = () => update();
    timer = window.setTimeout(update, 0);
    window.addEventListener("focus", onFocus);
    return () => { window.clearTimeout(timer); window.removeEventListener("focus", onFocus); };
  }, []);
  return today;
}

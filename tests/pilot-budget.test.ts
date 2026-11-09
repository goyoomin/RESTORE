import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const budget = readFileSync(new URL("../docs/PILOT_BUDGET.md", import.meta.url), "utf8");
const policy = readFileSync(new URL("../app/policy/page.tsx", import.meta.url), "utf8");
const won = (value: string): number => Number(value.replaceAll(",", ""));
const section = (document: string, start: string, end: string): string => {
  const startAt = document.indexOf(start);
  const endAt = document.indexOf(end, startAt + start.length);
  assert.notEqual(startAt, -1, `section missing: ${start}`);
  assert.notEqual(endAt, -1, `section end missing: ${end}`);
  return document.slice(startAt, endAt);
};

test("예산 산식 표의 항목 합계와 세부 비중이 7,250만 원 기준과 일치한다", () => {
  const costTable = section(budget, "## 기준안 비용 가정", "## 항목별 비중");
  const subtotals = costTable.split("\n")
    .filter(line => line.startsWith("| ") && !line.includes("---") && !line.includes("비용 항목"))
    .map(line => {
      const cells = line.split("|").map(cell => cell.trim()).filter(Boolean);
      const amount = cells[4]?.match(/([\d,]+)원/);
      assert.ok(amount, `subtotal missing: ${line}`);
      return won(amount[1]);
    });
  assert.equal(subtotals.length, 12);
  assert.equal(subtotals.reduce((sum, amount) => sum + amount, 0), 72_500_000);

  const shares = section(budget, "## 항목별 비중", "## 가정한 거래 성사 건수별 건당 운영비");
  const shareRows = shares.split("\n").filter(line => line.startsWith("| ") && /\d+\.\d+%/.test(line));
  assert.equal(shareRows.length, 6);
  let shareTotal = 0;
  for (const row of shareRows) {
    const cells = row.split("|").map(cell => cell.trim()).filter(Boolean);
    const amount = cells[1]?.match(/([\d,]+)원/);
    const percent = cells[2]?.match(/([\d.]+)%/);
    assert.ok(amount && percent, `share values missing: ${row}`);
    const expected = Math.round(won(amount[1]) / 72_500_000 * 1000) / 10;
    assert.equal(Number(percent[1]), expected);
    shareTotal += Number(percent[1]);
  }
  assert.ok(shareTotal > 99.8 && shareTotal < 100.2);
});

test("건당 비용 시나리오는 완료 거래 가정을 분모로 계산하고 운송 횟수와 구분한다", () => {
  const scenarios = section(budget, "## 가정한 거래 성사 건수별 건당 운영비", "## 기존 인프라 활용 저비용 운영 대안");
  const expected = new Map([[10, 7_250_000], [20, 3_625_000], [30, 2_416_667], [40, 1_812_500]]);
  const rows = scenarios.split("\n").filter(line => /^\| (10|20|30|40)건 \|/.test(line));
  assert.equal(rows.length, 4);
  for (const row of rows) {
    const cells = row.split("|").map(cell => cell.trim()).filter(Boolean);
    const count = Number(cells[0]?.replace("건", ""));
    const result = cells[2]?.match(/약?\s*([\d,]+)원/);
    assert.ok(result, `scenario result missing: ${row}`);
    assert.equal(won(result[1]), expected.get(count));
  }
  assert.match(scenarios, /운송 30회를 완료 거래 30건으로 간주하지 않는다/);
});

test("정책 타임라인은 2–5개월에 접수와 후속 절차를 병행하고 철거 임박 자산을 우선한다", () => {
  assert.match(policy, /2–5개월 차 · 상시/);
  assert.match(policy, /2–5개월 차 · 병행/);
  assert.match(policy, /철거 예정일이 임박한 자산을 우선 조율합니다/);
  assert.match(policy, /대기하지 않고/);
});

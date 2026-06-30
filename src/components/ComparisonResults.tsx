"use client";

import { useScenarioStore } from "@/store/scenarioStore";
import { PolicyConfig } from "@/types";
import {
  calculateOutOfPocket,
  estimatePremium,
  calculateBreakEven,
  isScenarioCovered,
} from "@/lib/calculations";
import { formatCurrency, formatBreakEven } from "@/lib/format";

/** A single comparable cost figure for one policy. */
interface CostCell {
  /** null means the figure isn't applicable (scenario not covered). */
  value: number | null;
}

function cellClasses(cell: CostCell, other: CostCell): string {
  if (cell.value === null || other.value === null) return "text-slate-800";
  if (cell.value > other.value) return "text-amber-700"; // higher cost
  if (cell.value < other.value) return "text-green-800"; // lower cost
  return "text-slate-800"; // tie
}

function CostText({ cell, other }: { cell: CostCell; other: CostCell }) {
  if (cell.value === null) {
    return <span className="text-amber-700">Not covered</span>;
  }
  const higher = other.value !== null && cell.value > other.value;
  const lower = other.value !== null && cell.value < other.value;
  return (
    <span className={`tabular-nums ${cellClasses(cell, other)}`}>
      {formatCurrency(cell.value)}
      {higher && (
        <>
          <span aria-hidden="true"> ↑</span>
          <span className="sr-only"> (higher cost)</span>
        </>
      )}
      {lower && (
        <>
          <span aria-hidden="true"> ↓</span>
          <span className="sr-only"> (lower cost)</span>
        </>
      )}
    </span>
  );
}

function costCell(
  config: PolicyConfig,
  value: number,
  covered: boolean,
): CostCell {
  return { value: covered ? value : null };
}

export function ComparisonResults() {
  const policyA = useScenarioStore((s) => s.policyA);
  const policyB = useScenarioStore((s) => s.policyB);

  const coveredA = isScenarioCovered(
    policyA.coverageType,
    policyA.selectedScenario,
  );
  const coveredB = isScenarioCovered(
    policyB.coverageType,
    policyB.selectedScenario,
  );

  const oopA = costCell(
    policyA,
    calculateOutOfPocket(policyA, policyA.selectedScenario),
    coveredA,
  );
  const oopB = costCell(
    policyB,
    calculateOutOfPocket(policyB, policyB.selectedScenario),
    coveredB,
  );

  // Premium applies regardless of scenario coverage.
  const premiumA: CostCell = { value: estimatePremium(policyA) };
  const premiumB: CostCell = { value: estimatePremium(policyB) };

  const breakEven = calculateBreakEven(policyA, policyB);

  return (
    <section
      aria-labelledby="comparison-heading"
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2
        id="comparison-heading"
        className="text-lg font-semibold text-slate-900"
      >
        Side-by-side comparison
      </h2>

      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Estimated costs for Policy A and Policy B
        </caption>
        <thead>
          <tr className="border-b border-slate-200">
            <th scope="col" className="py-2 text-sm font-medium text-slate-600">
              Metric
            </th>
            <th
              scope="col"
              className="py-2 text-right text-sm font-medium text-slate-700"
            >
              Policy A
            </th>
            <th
              scope="col"
              className="py-2 text-right text-sm font-medium text-slate-700"
            >
              Policy B
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-100">
            <th scope="row" className="py-3 text-sm font-normal text-slate-600">
              Estimated out-of-pocket
            </th>
            <td className="py-3 text-right font-semibold">
              <CostText cell={oopA} other={oopB} />
            </td>
            <td className="py-3 text-right font-semibold">
              <CostText cell={oopB} other={oopA} />
            </td>
          </tr>
          <tr>
            <th scope="row" className="py-3 text-sm font-normal text-slate-600">
              Annual premium
            </th>
            <td className="py-3 text-right font-semibold">
              <CostText cell={premiumA} other={premiumB} />
            </td>
            <td className="py-3 text-right font-semibold">
              <CostText cell={premiumB} other={premiumA} />
            </td>
          </tr>
        </tbody>
      </table>

      <div
        aria-live="polite"
        className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700"
      >
        <span className="font-medium text-slate-900">Break-even: </span>
        {formatBreakEven(breakEven)}
        {Number.isFinite(breakEven)
          ? " of premium savings to offset the higher out-of-pocket exposure."
          : " — the pricier policy never pays for itself at these settings."}
      </div>
    </section>
  );
}

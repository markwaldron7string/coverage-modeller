"use client";

import { useScenarioStore, PolicyKey } from "@/store/scenarioStore";
import { PolicyConfig } from "@/types";
import {
  calculateOutOfPocket,
  calculateCoveragePayout,
  estimatePremium,
  calculateBreakEven,
  isScenarioCovered,
} from "@/lib/calculations";
import { COVERAGE_LABELS, SCENARIO_LABELS } from "@/lib/labels";
import { formatCurrency, formatBreakEven } from "@/lib/format";

interface ResultsPanelProps {
  policy: PolicyKey;
  /**
   * When provided, the panel is in comparison mode and shows the break-even
   * years against this config. Omitted in single-panel mode, which hides it.
   */
  comparisonConfig?: PolicyConfig;
}

export function ResultsPanel({ policy, comparisonConfig }: ResultsPanelProps) {
  // The slice is already a PolicyConfig and a stable reference, so no
  // useShallow is required.
  const config = useScenarioStore((s) => s[policy]);

  const scenario = config.selectedScenario;
  const covered = isScenarioCovered(config.coverageType, scenario);
  const outOfPocket = calculateOutOfPocket(config, scenario);
  const payout = calculateCoveragePayout(config, scenario);
  const premium = estimatePremium(config);

  const showBreakEven = comparisonConfig !== undefined;
  const breakEven = showBreakEven
    ? calculateBreakEven(config, comparisonConfig)
    : null;

  const headingId = `results-heading-${policy}`;

  return (
    <aside
      aria-labelledby={headingId}
      className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 id={headingId} className="text-lg font-semibold text-slate-900">
        Your estimate
      </h2>

      <div aria-live="polite" className="flex flex-col gap-6">
        {scenario === null ? (
          <div
            role="note"
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-sm text-slate-700">
              Select a claim scenario to see your estimated out-of-pocket cost.
            </p>
          </div>
        ) : covered ? (
          <dl className="flex flex-col gap-4">
            <Metric
              label="Estimated out-of-pocket cost"
              value={formatCurrency(outOfPocket)}
              emphasis
            />
            <Metric label="Coverage payout" value={formatCurrency(payout)} />
          </dl>
        ) : (
          <div
            role="note"
            className="rounded-lg border border-amber-200 bg-amber-50 p-4"
          >
            <p className="font-medium text-amber-900">Not covered</p>
            <p className="mt-1 text-sm text-amber-800">
              {COVERAGE_LABELS[config.coverageType]} doesn&rsquo;t cover{" "}
              {SCENARIO_LABELS[scenario].toLowerCase()}. You&rsquo;d pay the full
              cost yourself.
            </p>
          </div>
        )}

        <dl className="flex flex-col gap-4 border-t border-slate-100 pt-4">
          <Metric
            label="Annual premium estimate"
            value={formatCurrency(premium)}
          />
          {showBreakEven && breakEven !== null && (
            <Metric
              label="Break-even vs. comparison"
              value={formatBreakEven(breakEven)}
            />
          )}
        </dl>
      </div>
    </aside>
  );
}

function Metric({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <>
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd
        className={
          emphasis
            ? "text-2xl font-bold text-slate-900 tabular-nums"
            : "text-lg font-semibold text-slate-800 tabular-nums"
        }
      >
        {value}
      </dd>
    </>
  );
}
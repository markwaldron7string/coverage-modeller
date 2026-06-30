"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useScenarioStore } from "@/store/scenarioStore";
import { ScenarioType, PolicyConfig } from "@/types";
import { calculateOutOfPocket } from "@/lib/calculations";
import { SCENARIO_LABELS } from "@/lib/labels";
import { formatCurrency } from "@/lib/format";

const POLICY_A_COLOR = "#0d9488"; // teal-600
const POLICY_B_COLOR = "#475569"; // slate-600

const CHART_HEIGHT = 320; // matches the h-80 wrapper; a fixed numeric height keeps
// ResponsiveContainer from warning when it measures a 0-height box on first mount.

export interface ChartRow {
  scenario: string;
  "Policy A": number;
  "Policy B": number;
}

/**
 * Out-of-pocket cost for each policy across every scenario — the data behind
 * the grouped bar chart. Pure and deterministic, so it's unit-testable without
 * touching the DOM.
 */
export function buildComparisonChartData(
  policyA: PolicyConfig,
  policyB: PolicyConfig,
): ChartRow[] {
  return Object.values(ScenarioType).map((scenario) => ({
    scenario: SCENARIO_LABELS[scenario],
    "Policy A": calculateOutOfPocket(policyA, scenario),
    "Policy B": calculateOutOfPocket(policyB, scenario),
  }));
}

export function ComparisonChart() {
  const policyA = useScenarioStore((s) => s.policyA);
  const policyB = useScenarioStore((s) => s.policyB);

  const data = buildComparisonChartData(policyA, policyB);

  return (
    <figure
      role="group"
      aria-labelledby="chart-title"
      className="m-0 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <figcaption
        id="chart-title"
        className="text-lg font-semibold text-slate-900"
      >
        Out-of-pocket cost by scenario
      </figcaption>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 56, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="scenario"
              angle={-25}
              textAnchor="end"
              interval={0}
              height={60}
              tick={{ fontSize: 12, fill: "#475569" }}
              label={{
                value: "Claim scenario",
                position: "insideBottom",
                offset: -50,
                fill: "#475569",
              }}
            />
            <YAxis
              tickFormatter={(value: number) => formatCurrency(value)}
              tick={{ fontSize: 12, fill: "#475569" }}
              width={72}
              label={{
                value: "Out-of-pocket cost",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fill: "#475569" },
              }}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              cursor={{ fill: "#f1f5f9" }}
            />
            <Legend />
            <Bar
              dataKey="Policy A"
              fill={POLICY_A_COLOR}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="Policy B"
              fill={POLICY_B_COLOR}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible text equivalent of the chart for screen readers. */}
      <table className="sr-only">
        <caption>
          Out-of-pocket cost by scenario for Policy A and Policy B
        </caption>
        <thead>
          <tr>
            <th scope="col">Scenario</th>
            <th scope="col">Policy A</th>
            <th scope="col">Policy B</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.scenario}>
              <th scope="row">{row.scenario}</th>
              <td>{formatCurrency(row["Policy A"])}</td>
              <td>{formatCurrency(row["Policy B"])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

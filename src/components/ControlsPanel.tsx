"use client";

import { useScenarioStore, PolicyKey } from "@/store/scenarioStore";
import { CoverageType, ScenarioType } from "@/types";
import {
  COVERAGE_LABELS,
  COVERAGE_DESCRIPTIONS,
  SCENARIO_LABELS,
} from "@/lib/labels";
import { formatCurrency } from "@/lib/format";

const VEHICLE_MIN = 1000;
const VEHICLE_MAX = 150000;
const VEHICLE_STEP = 1000;

const DEDUCTIBLE_MIN = 250;
const DEDUCTIBLE_MAX = 3000;
const DEDUCTIBLE_STEP = 250;

interface ControlsPanelProps {
  policy: PolicyKey;
  /** Visible heading; distinguishes the two panels in comparison mode. */
  heading?: string;
}

export function ControlsPanel({
  policy,
  heading = "Configure your policy",
}: ControlsPanelProps) {
  // Selecting the whole slice is reference-stable (changes only when this
  // policy changes), so no useShallow is needed.
  const { vehicleValue, coverageType, deductible, selectedScenario } =
    useScenarioStore((s) => s[policy]);

  const setVehicleValue = useScenarioStore((s) => s.setVehicleValue);
  const setCoverageType = useScenarioStore((s) => s.setCoverageType);
  const setDeductible = useScenarioStore((s) => s.setDeductible);
  const setScenario = useScenarioStore((s) => s.setScenario);

  // Namespace every id by policy so two panels can coexist without colliding.
  const headingId = `controls-heading-${policy}`;

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 id={headingId} className="text-lg font-semibold text-slate-900">
        {heading}
      </h2>

      {/* Vehicle value */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`vehicle-value-${policy}`}
          className="text-sm font-medium text-slate-700"
        >
          Vehicle value
        </label>
        <input
          id={`vehicle-value-${policy}`}
          type="number"
          min={VEHICLE_MIN}
          max={VEHICLE_MAX}
          step={VEHICLE_STEP}
          value={vehicleValue}
          onChange={(e) => {
            const next = e.target.valueAsNumber;
            if (!Number.isNaN(next)) setVehicleValue(policy, next);
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 tabular-nums focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
        />
      </div>

      {/* Coverage type */}
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 text-sm font-medium text-slate-700">
          Coverage type
        </legend>
        <div className="flex flex-col gap-2">
          {Object.values(CoverageType).map((type) => {
            const isSelected = coverageType === type;
            return (
              <div
                key={type}
                className={`flex gap-3 rounded-lg border p-3 transition-colors ${
                  isSelected
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  id={`coverage-${policy}-${type}`}
                  type="radio"
                  name={`coverage-type-${policy}`}
                  value={type}
                  checked={isSelected}
                  onChange={() => setCoverageType(policy, type)}
                  aria-describedby={`coverage-desc-${policy}-${type}`}
                  className="mt-0.5 h-4 w-4 accent-teal-600"
                />
                <div className="flex flex-col">
                  <label
                    htmlFor={`coverage-${policy}-${type}`}
                    className="font-medium text-slate-900"
                  >
                    {COVERAGE_LABELS[type]}
                  </label>
                  <span
                    id={`coverage-desc-${policy}-${type}`}
                    className="text-sm text-slate-500"
                  >
                    {COVERAGE_DESCRIPTIONS[type]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>

      {/* Deductible */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor={`deductible-${policy}`}
            className="text-sm font-medium text-slate-700"
          >
            Deductible
          </label>
          <output
            htmlFor={`deductible-${policy}`}
            aria-live="polite"
            className="text-sm font-semibold tabular-nums text-teal-700"
          >
            {formatCurrency(deductible)}
          </output>
        </div>
        <input
          id={`deductible-${policy}`}
          type="range"
          min={DEDUCTIBLE_MIN}
          max={DEDUCTIBLE_MAX}
          step={DEDUCTIBLE_STEP}
          value={deductible}
          onChange={(e) => setDeductible(policy, e.target.valueAsNumber)}
          aria-valuetext={formatCurrency(deductible)}
          className="w-full accent-teal-600"
        />
        <div className="flex justify-between text-xs text-slate-400 tabular-nums">
          <span>{formatCurrency(DEDUCTIBLE_MIN)}</span>
          <span>{formatCurrency(DEDUCTIBLE_MAX)}</span>
        </div>
      </div>

      {/* Claim scenario */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`scenario-${policy}`}
          className="text-sm font-medium text-slate-700"
        >
          Claim scenario
        </label>
        <select
          id={`scenario-${policy}`}
          value={selectedScenario}
          onChange={(e) => setScenario(policy, e.target.value as ScenarioType)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
        >
          {Object.values(ScenarioType).map((scenario) => (
            <option key={scenario} value={scenario}>
              {SCENARIO_LABELS[scenario]}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
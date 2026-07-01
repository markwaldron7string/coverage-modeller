"use client";

import { useScenarioStore, PolicyKey } from "@/store/scenarioStore";
import { ScenarioType } from "@/types";
import {
  COMPREHENSIVE_LABEL,
  COMPREHENSIVE_DESCRIPTION,
  COLLISION_LABEL,
  COLLISION_DESCRIPTION,
  UM_LABEL,
  UM_DESCRIPTION,
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
  const { vehicleValue, comprehensive, collision, uninsuredMotorist, deductible, selectedScenario } =
    useScenarioStore((s) => s[policy]);

  const setVehicleValue = useScenarioStore((s) => s.setVehicleValue);
  const setComprehensive = useScenarioStore((s) => s.setComprehensive);
  const setCollision = useScenarioStore((s) => s.setCollision);
  const setUninsuredMotorist = useScenarioStore((s) => s.setUninsuredMotorist);
  const setDeductible = useScenarioStore((s) => s.setDeductible);
  const setScenario = useScenarioStore((s) => s.setScenario);

  // Namespace every id by policy so two panels can coexist without colliding.
  const headingId = `controls-heading-${policy}`;

  // Native min/max don't stop a user typing an out-of-range value, so derive a
  // validation message from the current value and wire it to the input.
  const vehicleErrorId = `vehicle-value-error-${policy}`;
  const vehicleError =
    vehicleValue < VEHICLE_MIN
      ? `Enter a vehicle value of at least ${formatCurrency(VEHICLE_MIN)}.`
      : vehicleValue > VEHICLE_MAX
        ? `Enter a vehicle value of at most ${formatCurrency(VEHICLE_MAX)}.`
        : null;

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
          aria-invalid={vehicleError !== null}
          aria-describedby={vehicleError ? vehicleErrorId : undefined}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 tabular-nums focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40 focus:outline-none"
        />
        {vehicleError && (
          <p id={vehicleErrorId} className="text-sm text-red-700">
            {vehicleError}
          </p>
        )}
      </div>

      {/* Coverage — liability is the implicit baseline of every policy here;
          comprehensive, collision, and UM are each independently selectable,
          which is why this is a fieldset of checkboxes rather than radios:
          the interaction model genuinely is "choose any of these," not
          "choose exactly one." */}
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 text-sm font-medium text-slate-700">
          Coverage
        </legend>
        <p className="mb-2 text-sm text-slate-600">
          Liability coverage is included on every policy modelled here.
        </p>
        <div className="flex flex-col gap-2">
          <CoverageCheckbox
            id={`comprehensive-${policy}`}
            checked={comprehensive}
            onChange={(v) => setComprehensive(policy, v)}
            label={COMPREHENSIVE_LABEL}
            description={COMPREHENSIVE_DESCRIPTION}
          />
          <CoverageCheckbox
            id={`collision-${policy}`}
            checked={collision}
            onChange={(v) => setCollision(policy, v)}
            label={COLLISION_LABEL}
            description={COLLISION_DESCRIPTION}
          />
          <CoverageCheckbox
            id={`um-${policy}`}
            checked={uninsuredMotorist}
            onChange={(v) => setUninsuredMotorist(policy, v)}
            label={UM_LABEL}
            description={UM_DESCRIPTION}
          />
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
            className="text-sm font-semibold text-teal-700 tabular-nums"
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
        <div className="flex justify-between text-xs text-slate-600 tabular-nums">
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
          value={selectedScenario ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            setScenario(policy, v === "" ? null : (v as ScenarioType));
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40 focus:outline-none"
        >
          <option value="">Select a scenario…</option>
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

function CoverageCheckbox({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  const descId = `${id}-desc`;
  return (
    <div
      className={`flex gap-3 rounded-lg border p-3 transition-colors ${
        checked
          ? "border-teal-500 bg-teal-50"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={descId}
        className="mt-0.5 h-4 w-4 accent-teal-600"
      />
      <div className="flex flex-col">
        <label htmlFor={id} className="font-medium text-slate-900">
          {label}
        </label>
        <span id={descId} className="text-sm text-slate-600">
          {description}
        </span>
      </div>
    </div>
  );
}
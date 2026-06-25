"use client";

import { useState } from "react";
import { ControlsPanel } from "./ControlsPanel";
import { ResultsPanel } from "./ResultsPanel";
import { ComparisonResults } from "./ComparisonResults";
import { ComparisonChart } from "./ComparisonChart";
import { CopyLinkButton } from "./CopyLinkButton";
import { ExplanationPanel } from "./ExplanationPanel";

type View = "single" | "compare";

export function ModellerWorkspace() {
  const [view, setView] = useState<View>("single");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="View mode"
          className="inline-flex rounded-lg border border-slate-200 bg-white p-1"
        >
          <ToggleButton
            active={view === "single"}
            onClick={() => setView("single")}
          >
            Single policy
          </ToggleButton>
          <ToggleButton
            active={view === "compare"}
            onClick={() => setView("compare")}
          >
            Compare two
          </ToggleButton>
        </div>
        <CopyLinkButton />
      </div>

      {view === "single" ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
            <ControlsPanel policy="policyA" />
            <ResultsPanel policy="policyA" />
          </div>
          <ExplanationPanel policy="policyA" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
            <ControlsPanel policy="policyA" heading="Policy A" />
            <ControlsPanel policy="policyB" heading="Policy B" />
          </div>
          <ComparisonChart />
          <ComparisonResults />
        </div>
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 ${
        active
          ? "bg-teal-600 text-white"
          : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}
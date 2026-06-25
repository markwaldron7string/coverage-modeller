"use client";

import { useScenarioStore, PolicyKey } from "@/store/scenarioStore";
import { buildExplanation } from "@/content/explanations";

interface ExplanationPanelProps {
  policy: PolicyKey;
}

export function ExplanationPanel({ policy }: ExplanationPanelProps) {
  const config = useScenarioStore((state) => state[policy]);
  const explanation = buildExplanation(config);
  const headingId = `explanation-heading-${policy}`;

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-2xl border-l-4 border-teal-500 bg-teal-50/70 p-6"
    >
      <h2
        id={headingId}
        className="text-xs font-semibold uppercase tracking-wide text-teal-800"
      >
        In plain English
      </h2>
      <p className="mt-2 max-w-prose text-base leading-relaxed text-slate-700">
        {explanation}
      </p>
    </section>
  );
}
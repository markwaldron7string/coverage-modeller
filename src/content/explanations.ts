import { CoverageType, PolicyConfig } from "@/types";
import { formatCurrency } from "@/lib/format";

export interface ExplanationParams {
  /** Pre-formatted currency string, e.g. "$20,000". */
  vehicleValue: string;
  /** Pre-formatted currency string, e.g. "$1,000". */
  deductible: string;
}

export type ExplanationTemplate = (params: ExplanationParams) => string;

/**
 * One plain-English template per coverage tier. Kept here as typed content,
 * separate from the component that renders it. Record<CoverageType, ...> forces
 * a template for every tier at compile time.
 */
export const EXPLANATION_TEMPLATES: Record<CoverageType, ExplanationTemplate> = {
  [CoverageType.LIABILITY_ONLY]: ({ vehicleValue, deductible }) =>
    `Liability-only coverage pays for damage you cause to other people and ` +
    `their property, but it doesn't protect your own ${vehicleValue} vehicle. ` +
    `If you have a collision, theft, or weather-related loss, you'd pay for it ` +
    `entirely out of pocket. The one exception is an uninsured-motorist claim, ` +
    `where you'd pay your ${deductible} deductible and the policy covers the rest.`,
  [CoverageType.COMPREHENSIVE]: ({ vehicleValue, deductible }) =>
    `Comprehensive coverage protects your ${vehicleValue} vehicle against theft, ` +
    `weather, and other non-collision damage, as well as uninsured drivers. For ` +
    `any covered claim you'd pay your ${deductible} deductible and the policy ` +
    `covers the rest. It doesn't include collisions, so a minor accident would ` +
    `still be yours to pay.`,
  [CoverageType.FULL_COVERAGE]: ({ vehicleValue, deductible }) =>
    `Full coverage protects your ${vehicleValue} vehicle in nearly any ` +
    `situation — collisions, theft, weather, total loss, and uninsured drivers ` +
    `are all included. In a covered claim you'd pay your ${deductible} ` +
    `deductible, and the policy pays the rest, up to the value of your vehicle.`,
};

/** Builds the plain-English explanation for a policy's current configuration. */
export function buildExplanation(config: PolicyConfig): string {
  return EXPLANATION_TEMPLATES[config.coverageType]({
    vehicleValue: formatCurrency(config.vehicleValue),
    deductible: formatCurrency(config.deductible),
  });
}
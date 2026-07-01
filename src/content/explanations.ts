import { PolicyConfig } from "@/types";
import { formatCurrency } from "@/lib/format";

export interface ExplanationParams {
  vehicleValue: string;
  deductible: string;
}

/**
 * A fragment is a complete, grammatically self-contained sentence. Composing
 * them with a single space between always produces clean prose, regardless
 * of which combination of coverages is active — that's what keeps the output
 * grammatically correct across every input combination without a combinatorial
 * explosion of templates.
 */
type Fragment = (params: ExplanationParams) => string;

const VEHICLE_VALUE_FRAGMENT: Fragment = ({ vehicleValue }) =>
  `This policy covers a vehicle valued at ${vehicleValue}.`;

const LIABILITY_FRAGMENT: Fragment = () =>
  "It includes liability coverage, which pays for injuries or damage you cause to other people if you're at fault in an accident.";

const COMPREHENSIVE_FRAGMENT: Fragment = ({ deductible }) =>
  `You've added comprehensive coverage, so theft, weather damage, and other non-collision losses to your own vehicle are covered above your ${deductible} deductible.`;

const COLLISION_FRAGMENT: Fragment = ({ deductible }) =>
  `You've added collision coverage, so damage to your own vehicle from an accident is covered above your ${deductible} deductible.`;

const UNINSURED_MOTORIST_FRAGMENT: Fragment = () =>
  "You've also added uninsured/underinsured motorist coverage, which protects you if you're hit by a driver who can't cover your costs themselves.";

const NO_OWN_DAMAGE_COVERAGE_FRAGMENT: Fragment = () =>
  "Without comprehensive or collision coverage, damage to your own vehicle generally wouldn't be covered, no matter who's at fault.";

/** Builds the plain-language explanation paragraph for a policy. */
export function buildExplanation(config: PolicyConfig): string {
  const params: ExplanationParams = {
    vehicleValue: formatCurrency(config.vehicleValue),
    deductible: formatCurrency(config.deductible),
  };

  // Vehicle value and liability lead every explanation, unconditionally.
  const sentences: string[] = [VEHICLE_VALUE_FRAGMENT(params), LIABILITY_FRAGMENT(params)];

  if (config.comprehensive) sentences.push(COMPREHENSIVE_FRAGMENT(params));
  if (config.collision) sentences.push(COLLISION_FRAGMENT(params));
  if (!config.comprehensive && !config.collision) {
    sentences.push(NO_OWN_DAMAGE_COVERAGE_FRAGMENT(params));
  }
  if (config.uninsuredMotorist) sentences.push(UNINSURED_MOTORIST_FRAGMENT(params));

  return sentences.join(" ");
}
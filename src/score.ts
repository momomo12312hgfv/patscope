import { highestSeverity } from "./capabilities";
import type { Capability, ScoreBreakdownItem, ScoreResult, Severity } from "./types";

export const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 50,
  high: 20,
  medium: 8,
  low: 2,
};

const SEVERITY_FLOORS: Record<Severity, number> = {
  critical: 70,
  high: 45,
  medium: 20,
  low: 0,
};

const LEVEL_THRESHOLDS: Array<{ minimum: number; level: Severity }> = [
  { minimum: 70, level: "critical" },
  { minimum: 45, level: "high" },
  { minimum: 20, level: "medium" },
  { minimum: 0, level: "low" },
];

export function scoreLevel(value: number): Severity {
  return LEVEL_THRESHOLDS.find((threshold) => value >= threshold.minimum)?.level ?? "low";
}

export function evaluateCapabilities(capabilities: Capability[]): ScoreResult {
  const breakdown: ScoreBreakdownItem[] = capabilities.map((capability) => ({
    capability: capability.id,
    title: capability.title,
    severity: capability.severity,
    weight: SEVERITY_WEIGHTS[capability.severity],
  }));

  const rawValue = breakdown.reduce((sum, item) => sum + item.weight, 0);
  const highest = highestSeverity(capabilities);
  const floor = highest ? SEVERITY_FLOORS[highest] : 0;
  const value = Math.min(100, Math.max(rawValue, floor));
  const floorApplied = floor > rawValue;

  return {
    value,
    rawValue,
    level: scoreLevel(value),
    highestSeverity: highest,
    floorApplied,
    breakdown,
  };
}

export function severityAtLeast(value: Severity, threshold: Severity): boolean {
  const order: Severity[] = ["low", "medium", "high", "critical"];
  return order.indexOf(value) >= order.indexOf(threshold);
}

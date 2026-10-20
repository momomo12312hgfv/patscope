import { CAPABILITY_DEFINITIONS } from "../capabilities";
import pkg from "../../package.json";
import type { Capability, Report, Severity } from "../types";

type SarifLevel = "error" | "warning" | "note";

const RULE_URL =
  "https://github.com/momomo12312hgfv/patscope/blob/main/docs/scope-matrix.md#capabilities";

function sarifLevel(severity: Severity): SarifLevel {
  if (severity === "critical" || severity === "high") return "error";
  if (severity === "medium") return "warning";
  return "note";
}

function ruleFor(capability: (typeof CAPABILITY_DEFINITIONS)[number]) {
  return {
    id: `patscope/${capability.id}`,
    name: capability.title.replace(/[^A-Za-z0-9]+/g, ""),
    shortDescription: { text: capability.title },
    fullDescription: { text: capability.description },
    helpUri: RULE_URL,
    properties: {
      tags: ["security", "github-token", capability.category],
      severity: capability.severity,
      capability: capability.id,
    },
  };
}

function resultFor(report: Report, capability: Capability, locationUri: string) {
  return {
    ruleId: `patscope/${capability.id}`,
    level: sarifLevel(capability.severity),
    message: {
      text: `${capability.title}: ${capability.description} Granted by: ${capability.matchedScopes.join(
        ", ",
      )}. Token blast radius: ${report.score.level} (${report.score.value}/100).`,
    },
    locations: [
      {
        physicalLocation: {
          artifactLocation: {
            uri: locationUri,
          },
          region: {
            startLine: 1,
            startColumn: 1,
          },
        },
        logicalLocations: [
          {
            name: "GitHub token",
            fullyQualifiedName: "github.token",
            kind: "resource",
          },
        ],
      },
    ],
    partialFingerprints: {
      "patscope/v1": capability.id,
    },
    properties: {
      severity: capability.severity,
      capability: capability.id,
      grantedBy: capability.matchedScopes,
      score: report.score.value,
      level: report.score.level,
    },
  };
}

export interface SarifOptions {
  locationUri?: string;
}

export function renderSarif(report: Report, options: SarifOptions = {}): string {
  const locationUri = (options.locationUri ?? "patscope-report.md").replace(/\\/g, "/");
  const sarif = {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "patscope",
            informationUri: "https://github.com/momomo12312hgfv/patscope",
            version: pkg.version,
            rules: CAPABILITY_DEFINITIONS.map(ruleFor),
          },
        },
        invocations: [
          {
            executionSuccessful: true,
            startTimeUtc: report.generatedAt,
            toolExecutionNotifications: report.warnings.map((warning) => ({
              level: "note",
              message: { text: warning },
            })),
          },
        ],
        properties: {
          score: report.score.value,
          level: report.score.level,
          scoreKnown: report.scoreKnown,
          tokenType: report.token.type,
        },
        results: report.capabilities.map((capability) => resultFor(report, capability, locationUri)),
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}
